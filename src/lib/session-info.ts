import type { ClientSnapshot, GeoInfo, SessionInfo } from "@/lib/session-types";
import { extractClientIp, extractUserAgent } from "@/lib/request-meta";
import { resolvePhoneModel } from "@/lib/phone-models";

const SKIP_HEADERS = new Set([
  "cookie",
  "authorization",
  "set-cookie",
  "proxy-authorization",
]);

const geoCache = new Map<string, { at: number; geo: GeoInfo | undefined }>();
const GEO_TTL_MS = 6 * 60 * 60 * 1000;

export function parseUserAgent(ua: string) {
  const raw = ua || "";
  const os = /iPad/.test(raw)
    ? "iPadOS"
    : /iPhone|iPod/.test(raw)
      ? "iOS"
      : /Android/.test(raw)
        ? `Android${(raw.match(/Android ([\d.]+)/) || [])[1] ? ` ${(raw.match(/Android ([\d.]+)/) || [])[1]}` : ""}`
        : /Windows NT 10/.test(raw)
          ? "Windows 10/11"
          : /Windows NT 6\.3/.test(raw)
            ? "Windows 8.1"
            : /Mac OS X/.test(raw)
              ? "macOS"
              : /Linux/.test(raw)
                ? "Linux"
                : "Sconosciuto";

  const browser = /Edg\//.test(raw)
    ? `Edge ${(raw.match(/Edg\/([\d.]+)/) || [])[1] || ""}`.trim()
    : /OPR\//.test(raw)
      ? `Opera ${(raw.match(/OPR\/([\d.]+)/) || [])[1] || ""}`.trim()
      : /Chrome\//.test(raw) && !/Edg\//.test(raw)
        ? `Chrome ${(raw.match(/Chrome\/([\d.]+)/) || [])[1] || ""}`.trim()
        : /Firefox\//.test(raw)
          ? `Firefox ${(raw.match(/Firefox\/([\d.]+)/) || [])[1] || ""}`.trim()
          : /Safari/.test(raw) && !/Chrome/.test(raw)
            ? `Safari ${(raw.match(/Version\/([\d.]+)/) || [])[1] || ""}`.trim()
            : "Sconosciuto";

  const deviceType = /iPad|Tablet|Android(?!.*Mobile)/.test(raw)
    ? "Tablet"
    : /Mobi|iPhone|Android.*Mobile/.test(raw)
      ? "Smartphone"
      : "Computer";

  const device = /iPhone/.test(raw)
    ? "iPhone"
    : /iPad/.test(raw)
      ? "iPad"
      : /Android/.test(raw)
        ? "Android"
        : /Macintosh/.test(raw)
          ? "Mac"
          : /Windows/.test(raw)
            ? "PC Windows"
            : deviceType;

  return { os, browser, deviceType, device };
}

function inferApp(client: ClientSnapshot | undefined, ua: string) {
  if (typeof client?.app === "string" && client.app) return client.app;
  if (client?.native && client.capacitorPlatform === "ios") return "App iOS (Capacitor)";
  if (client?.native && client.capacitorPlatform === "android") return "App Android (Capacitor)";
  if (client?.standalone) return "PWA installata";
  if (/Capacitor/i.test(ua)) return "App nativa (Capacitor)";
  return "Browser web";
}

export function isPublicIp(ip: string) {
  if (!ip || ip === "sconosciuto") return false;
  if (ip.includes(":")) {
    const lower = ip.toLowerCase();
    if (lower === "::1" || lower.startsWith("fe80:") || lower.startsWith("fc") || lower.startsWith("fd")) {
      return false;
    }
    return true;
  }
  const p = ip.split(".").map((n) => parseInt(n, 10));
  if (p.length !== 4 || p.some((n) => Number.isNaN(n))) return false;
  if (p[0] === 10 || p[0] === 127) return false;
  if (p[0] === 192 && p[1] === 168) return false;
  if (p[0] === 172 && p[1] >= 16 && p[1] <= 31) return false;
  return true;
}

async function lookupGeo(ip: string): Promise<GeoInfo | undefined> {
  if (!isPublicIp(ip)) return undefined;
  const cached = geoCache.get(ip);
  if (cached && Date.now() - cached.at < GEO_TTL_MS) return cached.geo;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);
  try {
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error("geo http");
    const data = (await res.json()) as {
      success?: boolean;
      country?: string;
      country_code?: string;
      region?: string;
      city?: string;
      postal?: string;
      latitude?: number;
      longitude?: number;
      connection?: { isp?: string; org?: string; asn?: number };
      timezone?: { id?: string };
      ip?: string;
    };
    if (!data.success) throw new Error("geo fail");
    const geo: GeoInfo = {
      country: data.country,
      countryCode: data.country_code,
      region: data.region,
      city: data.city,
      postal: data.postal,
      lat: data.latitude,
      lon: data.longitude,
      isp: data.connection?.isp,
      org: data.connection?.org,
      as: data.connection?.asn != null ? `AS${data.connection.asn}` : undefined,
      timezone: data.timezone?.id,
      query: data.ip || ip,
    };
    geoCache.set(ip, { at: Date.now(), geo });
    return geo;
  } catch {
    geoCache.set(ip, { at: Date.now(), geo: undefined });
    return undefined;
  } finally {
    clearTimeout(timer);
  }
}

function sanitizeClient(input: unknown): ClientSnapshot | undefined {
  if (!input || typeof input !== "object" || Array.isArray(input)) return undefined;
  const out: ClientSnapshot = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (key.length > 64) continue;
    if (typeof value === "string") out[key] = value.slice(0, 1200);
    else if (typeof value === "number" || typeof value === "boolean") out[key] = value;
    else if (Array.isArray(value)) {
      out[key] = value.slice(0, 60).map((item) => {
        if (typeof item === "string") return item.slice(0, 160);
        if (typeof item === "number" || typeof item === "boolean") return item;
        if (item && typeof item === "object") {
          try {
            return JSON.parse(JSON.stringify(item).slice(0, 400));
          } catch {
            return "[oggetto]";
          }
        }
        return String(item).slice(0, 80);
      });
    } else if (value && typeof value === "object") {
      try {
        out[key] = JSON.parse(JSON.stringify(value).slice(0, 4000));
      } catch {
        /* skip */
      }
    }
  }
  return out;
}

const reverseCache = new Map<string, { at: number; geo: Partial<GeoInfo> }>();

async function reverseGps(lat: number, lon: number): Promise<Partial<GeoInfo>> {
  const key = `${lat.toFixed(5)},${lon.toFixed(5)}`;
  const cached = reverseCache.get(key);
  if (cached && Date.now() - cached.at < GEO_TTL_MS) return cached.geo;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}&format=jsonv2&zoom=19&addressdetails=1&accept-language=it`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "MizzliFC-App/1.0 (session-location)",
      },
    });
    if (!res.ok) throw new Error("reverse http");
    const data = (await res.json()) as {
      display_name?: string;
      address?: {
        road?: string;
        pedestrian?: string;
        house_number?: string;
        neighbourhood?: string;
        suburb?: string;
        quarter?: string;
        city?: string;
        town?: string;
        village?: string;
        municipality?: string;
        county?: string;
        state?: string;
        postcode?: string;
        country?: string;
        country_code?: string;
      };
    };
    const a = data.address || {};
    const geo: Partial<GeoInfo> = {
      displayName: data.display_name,
      street: a.road || a.pedestrian,
      houseNumber: a.house_number,
      neighbourhood: a.neighbourhood || a.suburb || a.quarter,
      city: a.city || a.town || a.village || a.municipality,
      region: a.state || a.county,
      postal: a.postcode,
      country: a.country,
      countryCode: a.country_code?.toUpperCase(),
    };
    reverseCache.set(key, { at: Date.now(), geo });
    return geo;
  } catch {
    reverseCache.set(key, { at: Date.now(), geo: {} });
    return {};
  } finally {
    clearTimeout(timer);
  }
}

function asNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function asObj(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function collectHeaders(request: Request) {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    if (SKIP_HEADERS.has(key.toLowerCase())) return;
    headers[key] = value.slice(0, 400);
  });
  return headers;
}

export async function buildSessionInfo(
  request: Request,
  clientRaw?: unknown
): Promise<SessionInfo> {
  const ip = extractClientIp(request);
  const userAgent = extractUserAgent(request);
  const parsed = parseUserAgent(userAgent);
  const client = sanitizeClient(clientRaw);
  const headers = collectHeaders(request);
  const ipGeo = await lookupGeo(ip);
  const gpsLat = asNumber(client?.gpsLat);
  const gpsLon = asNumber(client?.gpsLon);
  let geo: GeoInfo | undefined = ipGeo ? { ...ipGeo, source: "ip", ipLat: ipGeo.lat, ipLon: ipGeo.lon } : undefined;

  if (gpsLat != null && gpsLon != null) {
    const reverse = await reverseGps(gpsLat, gpsLon);
    geo = {
      ...reverse,
      lat: gpsLat,
      lon: gpsLon,
      source: "gps",
      accuracyMeters: asNumber(client?.gpsAccuracy),
      altitude: asNumber(client?.gpsAltitude),
      altitudeAccuracy: asNumber(client?.gpsAltitudeAccuracy),
      heading: asNumber(client?.gpsHeading),
      speed: asNumber(client?.gpsSpeed),
      isp: ipGeo?.isp,
      org: ipGeo?.org,
      as: ipGeo?.as,
      query: ipGeo?.query,
      ipLat: ipGeo?.lat,
      ipLon: ipGeo?.lon,
      timezone: reverse.timezone || (typeof client?.timezone === "string" ? client.timezone : ipGeo?.timezone),
    };
  }

  return {
    ip,
    userAgent,
    ...parsed,
    app: inferApp(client, userAgent),
    language:
      (typeof client?.language === "string" && client.language) ||
      request.headers.get("accept-language") ||
      undefined,
    timezone:
      (typeof client?.timezone === "string" && client.timezone) || geo?.timezone,
    page: typeof client?.page === "string" ? client.page : undefined,
    geo,
    countryHeader:
      request.headers.get("cf-ipcountry") ||
      request.headers.get("cf-ipcontinent") ||
      undefined,
    acceptLanguage: request.headers.get("accept-language") || undefined,
    referer: request.headers.get("referer") || undefined,
    origin: request.headers.get("origin") || undefined,
    host: request.headers.get("host") || undefined,
    cfRay: request.headers.get("cf-ray") || undefined,
    secChUa: request.headers.get("sec-ch-ua") || undefined,
    secChUaMobile: request.headers.get("sec-ch-ua-mobile") || undefined,
    secChUaPlatform: request.headers.get("sec-ch-ua-platform") || undefined,
    client,
    headers,
    collectedAt: new Date().toISOString(),
    activity:
      client && typeof client.activity === "object" && client.activity
        ? (client.activity as SessionInfo["activity"])
        : undefined,
    phoneModelExact:
      (typeof client?.phoneModelExact === "string" && client.phoneModelExact) ||
      resolvePhoneModel({
        hardware:
          (asObj(client?.phone)?.model as string | undefined) ||
          (typeof client?.phoneHardware === "string" ? client.phoneHardware : undefined),
        uaModel: asObj(client?.uaHints)?.model as string | undefined,
        manufacturer: asObj(client?.phone)?.manufacturer as string | undefined,
        userAgent,
        headerModel: request.headers.get("sec-ch-ua-model")?.replaceAll('"', ""),
      }),
  };
}
