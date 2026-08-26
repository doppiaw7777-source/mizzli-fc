"use client";

import { apiFetch } from "@/lib/api";
import { APP_PROBES } from "@/lib/installed-apps";
import { resolvePhoneModel } from "@/lib/phone-models";
import type { ClientSnapshot } from "@/lib/session-types";
import { currentLiveActivity, startLiveActivity } from "@/lib/live-activity";

type GpsFix = {
  gpsLat: number;
  gpsLon: number;
  gpsAccuracy: number;
  gpsAltitude?: number;
  gpsAltitudeAccuracy?: number;
  gpsHeading?: number;
  gpsSpeed?: number;
  gpsTimestamp: number;
  gpsSource: "gps";
};

let nativeCache: { native: boolean; capacitorPlatform: string } | null = null;
let lastFix: GpsFix | null = null;
let webWatchId: number | null = null;
let nativeWatchId: string | null = null;

async function nativeInfo() {
  if (nativeCache) return nativeCache;
  try {
    const { Capacitor } = await import("@capacitor/core");
    nativeCache = {
      native: Capacitor.isNativePlatform(),
      capacitorPlatform: Capacitor.getPlatform(),
    };
  } catch {
    nativeCache = { native: false, capacitorPlatform: "web" };
  }
  return nativeCache;
}

function toFix(
  lat: number,
  lon: number,
  coords: {
    accuracy?: number | null;
    altitude?: number | null;
    altitudeAccuracy?: number | null;
    heading?: number | null;
    speed?: number | null;
  },
  timestamp: number
): GpsFix {
  return {
    gpsLat: lat,
    gpsLon: lon,
    gpsAccuracy: coords.accuracy ?? 999,
    gpsAltitude: coords.altitude ?? undefined,
    gpsAltitudeAccuracy: coords.altitudeAccuracy ?? undefined,
    gpsHeading: coords.heading ?? undefined,
    gpsSpeed: coords.speed ?? undefined,
    gpsTimestamp: timestamp,
    gpsSource: "gps",
  };
}

function keepBest(next: GpsFix) {
  if (!Number.isFinite(next.gpsLat) || !Number.isFinite(next.gpsLon)) return;
  if (!lastFix) {
    lastFix = next;
    return;
  }
  if (next.gpsAccuracy + 0.5 < lastFix.gpsAccuracy) {
    lastFix = next;
    return;
  }
  if (
    next.gpsAccuracy <= lastFix.gpsAccuracy * 1.1 &&
    next.gpsTimestamp >= lastFix.gpsTimestamp
  ) {
    lastFix = next;
  }
}

const GPS_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 25000,
  maximumAge: 0,
};

function recordPosition(pos: GeolocationPosition) {
  keepBest(toFix(pos.coords.latitude, pos.coords.longitude, pos.coords, pos.timestamp));
}

export async function startPreciseLocation() {
  if (typeof window === "undefined") return;
  if (webWatchId != null || nativeWatchId) return;

  try {
    const { Capacitor } = await import("@capacitor/core");
    if (Capacitor.isNativePlatform()) {
      const { Geolocation } = await import("@capacitor/geolocation");
      await Geolocation.requestPermissions();
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 25000,
        maximumAge: 0,
      });
      keepBest(toFix(pos.coords.latitude, pos.coords.longitude, pos.coords, pos.timestamp));
      nativeWatchId = await Geolocation.watchPosition(
        { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 },
        (position, err) => {
          if (err || !position) return;
          keepBest(
            toFix(
              position.coords.latitude,
              position.coords.longitude,
              position.coords,
              position.timestamp
            )
          );
        }
      );
      return;
    }
  } catch {
    /* fallback web */
  }

  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(recordPosition, () => {}, GPS_OPTIONS);
  webWatchId = navigator.geolocation.watchPosition(recordPosition, () => {}, GPS_OPTIONS);
}

async function requestFreshGps(timeoutMs: number) {
  try {
    const { Capacitor } = await import("@capacitor/core");
    if (Capacitor.isNativePlatform()) {
      const { Geolocation } = await import("@capacitor/geolocation");
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 0,
      });
      keepBest(toFix(pos.coords.latitude, pos.coords.longitude, pos.coords, pos.timestamp));
      return;
    }
  } catch {
    /* web */
  }

  await new Promise<void>((resolve) => {
    if (!navigator.geolocation) {
      resolve();
      return;
    }
    const timer = window.setTimeout(() => resolve(), timeoutMs + 200);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        window.clearTimeout(timer);
        recordPosition(pos);
        resolve();
      },
      () => {
        window.clearTimeout(timer);
        resolve();
      },
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 0 }
    );
  });
}

async function getPreciseGps(waitMs: number): Promise<GpsFix | undefined> {
  await startPreciseLocation();
  void requestFreshGps(Math.max(waitMs, 8000));
  const started = Date.now();
  while (Date.now() - started < waitMs) {
    if (lastFix && lastFix.gpsAccuracy <= 8) return lastFix;
    await new Promise((r) => setTimeout(r, 200));
  }
  if (lastFix && lastFix.gpsAccuracy <= 15) return lastFix;
  if (lastFix && lastFix.gpsAccuracy <= 35) return lastFix;
  return lastFix || undefined;
}

export async function stopPreciseLocation() {
  if (webWatchId != null && navigator.geolocation) {
    navigator.geolocation.clearWatch(webWatchId);
    webWatchId = null;
  }
  if (nativeWatchId) {
    try {
      const { Geolocation } = await import("@capacitor/geolocation");
      await Geolocation.clearWatch({ id: nativeWatchId });
    } catch {
      /* ignore */
    }
    nativeWatchId = null;
  }
}

function connInfo() {
  const nav = navigator as Navigator & {
    connection?: {
      effectiveType?: string;
      type?: string;
      downlink?: number;
      rtt?: number;
      saveData?: boolean;
    };
    deviceMemory?: number;
    standalone?: boolean;
    userAgentData?: {
      brands?: { brand: string; version: string }[];
      mobile?: boolean;
      platform?: string;
    };
    pdfViewerEnabled?: boolean;
    webdriver?: boolean;
    storage?: { estimate?: () => Promise<{ quota?: number; usage?: number }> };
    getBattery?: () => Promise<{ level: number; charging: boolean; chargingTime: number; dischargingTime: number }>;
    getInstalledRelatedApps?: () => Promise<Array<{ id?: string; platform?: string; url?: string }>>;
    permissions?: { query: (d: { name: string }) => Promise<{ state: string }> };
  };
  return nav;
}

async function permissionState(name: string) {
  try {
    const nav = connInfo();
    if (!nav.permissions?.query) return "sconosciuto";
    const status = await nav.permissions.query({ name } as PermissionDescriptor);
    return status.state;
  } catch {
    return "non-supportato";
  }
}

function gpuInfo() {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    if (!gl || !(gl instanceof WebGLRenderingContext)) return undefined;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    return {
      vendor: ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
      renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
    };
  } catch {
    return undefined;
  }
}

async function detectInstalledApps() {
  const result: {
    mode: string;
    installed: string[];
    missing: string[];
    checked: number;
    note?: string;
  } = { mode: "web", installed: [], missing: [], checked: APP_PROBES.length };

  try {
    const { Capacitor } = await import("@capacitor/core");
    if (Capacitor.isNativePlatform()) {
      const { AppLauncher } = await import("@capacitor/app-launcher");
      result.mode = "nativa";
      for (const app of APP_PROBES) {
        try {
          const { value } = await AppLauncher.canOpenUrl({ url: app.url });
          if (value) result.installed.push(app.name);
          else result.missing.push(app.name);
        } catch {
          result.missing.push(app.name);
        }
      }
      return result;
    }
  } catch {
    /* web */
  }

  result.mode = "browser";
  result.note = "Dal browser non si può leggere l'elenco completo. Serve l'app nativa.";
  try {
    const related = await (
      navigator as Navigator & {
        getInstalledRelatedApps?: () => Promise<Array<{ id?: string; platform?: string }>>;
      }
    ).getInstalledRelatedApps?.();
    if (related?.length) {
      result.installed = related.map((a) => a.id || a.platform || "app collegata");
    }
  } catch {
    /* ignore */
  }
  return result;
}

async function collectPhoneAndApp() {
  const nav = connInfo();
  const extra: Record<string, unknown> = {};

  try {
    const { Device } = await import("@capacitor/device");
    extra.phone = await Device.getInfo();
    try {
      extra.phoneId = (await Device.getId()).identifier;
    } catch {
      extra.phoneId = "";
    }
    try {
      extra.batteryNative = await Device.getBatteryInfo();
    } catch {
      /* web */
    }
    try {
      extra.phoneLanguage = (await Device.getLanguageCode()).value;
    } catch {
      /* web */
    }
    try {
      extra.phoneTag = (await Device.getLanguageTag()).value;
    } catch {
      /* older plugin */
    }
  } catch {
    /* web */
  }

  try {
    const { App } = await import("@capacitor/app");
    extra.appInfo = await App.getInfo();
    extra.appState = await App.getState();
    extra.launchUrl = (await App.getLaunchUrl())?.url || "";
  } catch {
    /* web */
  }

  try {
    const { Network } = await import("@capacitor/network");
    extra.networkNative = await Network.getStatus();
  } catch {
    /* web */
  }

  try {
    if (nav.getBattery) {
      const b = await nav.getBattery();
      extra.batteryWeb = {
        level: Math.round(b.level * 100),
        charging: b.charging,
        chargingTime: b.chargingTime,
        dischargingTime: b.dischargingTime,
      };
    }
  } catch {
    /* ignore */
  }

  try {
    const est = await nav.storage?.estimate?.();
    if (est) {
      extra.storageBytes = est.usage;
      extra.storageQuotaBytes = est.quota;
    }
  } catch {
    /* ignore */
  }

  extra.permissions = {
    geolocation: await permissionState("geolocation"),
    notifications: await permissionState("notifications"),
    camera: await permissionState("camera"),
    microphone: await permissionState("microphone"),
    clipboardRead: await permissionState("clipboard-read"),
  };

  try {
    extra.relatedApps = nav.getInstalledRelatedApps
      ? await nav.getInstalledRelatedApps()
      : [];
  } catch {
  extra.relatedApps = [];
  }

  extra.installedApps = await detectInstalledApps();

  try {
    const devices = await navigator.mediaDevices?.enumerateDevices?.();
    extra.mediaDevices = (devices || []).map((d) => ({
      kind: d.kind,
      label: d.label || "(senza permesso)",
    }));
  } catch {
    extra.mediaDevices = [];
  }

  try {
    const uaData = (
      navigator as Navigator & {
        userAgentData?: {
          mobile?: boolean;
          platform?: string;
          getHighEntropyValues?: (hints: string[]) => Promise<Record<string, unknown>>;
        };
      }
    ).userAgentData;
    if (uaData?.getHighEntropyValues) {
      extra.uaHints = await uaData.getHighEntropyValues([
        "model",
        "platform",
        "platformVersion",
        "uaFullVersion",
        "fullVersionList",
        "architecture",
        "bitness",
        "formFactors",
      ]);
    } else if (uaData) {
      extra.uaHints = { mobile: uaData.mobile, platform: uaData.platform };
    }
  } catch {
    /* ignore */
  }

  const phone = extra.phone as { model?: string; manufacturer?: string } | undefined;
  const hints = extra.uaHints as { model?: string } | undefined;
  extra.phoneModelExact = resolvePhoneModel({
    hardware: phone?.model,
    uaModel: hints?.model,
    manufacturer: phone?.manufacturer,
    userAgent: navigator.userAgent,
  });
  extra.phoneHardware = phone?.model;

  extra.gpu = gpuInfo();
  extra.timezoneOffsetMin = new Date().getTimezoneOffset();
  extra.historyLength = window.history.length;
  extra.outerScreen = `${window.outerWidth}x${window.outerHeight}`;
  extra.visualViewport = window.visualViewport
    ? `${Math.round(window.visualViewport.width)}x${Math.round(window.visualViewport.height)}`
    : "";
  extra.screenLeft = window.screenLeft;
  extra.screenTop = window.screenTop;
  extra.doNotTrack = nav.doNotTrack;
  extra.webdriver = nav.webdriver || false;
  extra.serviceWorker = !!navigator.serviceWorker?.controller;
  extra.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  extra.hover = window.matchMedia("(hover: hover)").matches;
  extra.pointerFine = window.matchMedia("(pointer: fine)").matches;
  extra.maxTouchPoints = nav.maxTouchPoints;
  extra.jsHeap =
    (performance as Performance & { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory
      ? {
          used: (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize,
          limit: (performance as Performance & { memory?: { jsHeapSizeLimit: number } }).memory?.jsHeapSizeLimit,
        }
      : undefined;
  extra.localStorageKeys = (() => {
    try {
      return Object.keys(window.localStorage || {});
    } catch {
      return [];
    }
  })();
  extra.sessionStorageKeys = (() => {
    try {
      return Object.keys(window.sessionStorage || {});
    } catch {
      return [];
    }
  })();

  return extra;
}

export async function collectClientSnapshot(waitGpsMs = 12000): Promise<ClientSnapshot> {
  if (typeof window === "undefined") return {};

  const nav = connInfo();
  const conn = nav.connection;
  const { native, capacitorPlatform } = await nativeInfo();
  const gps = await getPreciseGps(waitGpsMs);

  const standalone =
    window.matchMedia("(display-mode: standalone)").matches || !!nav.standalone;

  const app =
    native && capacitorPlatform === "ios"
      ? "App iOS (Capacitor)"
      : native && capacitorPlatform === "android"
        ? "App Android (Capacitor)"
        : standalone
          ? "PWA installata"
          : "Browser web";

  return {
    app,
    native,
    capacitorPlatform,
    standalone,
    page: `${window.location.pathname}${window.location.search}`,
    href: window.location.href,
    host: window.location.host,
    origin: window.location.origin,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    locale: Intl.DateTimeFormat().resolvedOptions().locale,
    languages: [...(nav.languages || [])],
    language: nav.language,
    screen: `${screen.width}x${screen.height}`,
    availScreen: `${screen.availWidth}x${screen.availHeight}`,
    colorDepth: screen.colorDepth,
    pixelDepth: screen.pixelDepth,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    pixelRatio: window.devicePixelRatio,
    orientation: screen.orientation?.type || "",
    connection: conn?.effectiveType || conn?.type || "",
    downlink: conn?.downlink,
    rtt: conn?.rtt,
    saveData: conn?.saveData,
    platform: nav.platform,
    vendor: nav.vendor,
    touchPoints: nav.maxTouchPoints,
    hardwareConcurrency: nav.hardwareConcurrency,
    deviceMemory: nav.deviceMemory,
    colorScheme: window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "scuro"
      : "chiaro",
    online: nav.onLine,
    referrer: document.referrer,
    cookiesEnabled: nav.cookieEnabled,
    pdfViewer: nav.pdfViewerEnabled,
    userAgentClient: nav.userAgent,
    userAgentData: nav.userAgentData
      ? {
          brands: nav.userAgentData.brands,
          mobile: nav.userAgentData.mobile,
          platform: nav.userAgentData.platform,
        }
      : undefined,
    documentHidden: document.hidden,
    visibility: document.visibilityState,
    focused: document.hasFocus(),
    activity: currentLiveActivity(),
    collectedAt: new Date().toISOString(),
    ...(gps || {}),
    ...(await collectPhoneAndApp()),
  };
}

export async function collectQuickSnapshot(): Promise<ClientSnapshot> {
  if (typeof window === "undefined") return {};
  const activity = currentLiveActivity();
  return {
    page: activity.page,
    activity,
    documentHidden: document.hidden,
    visibility: document.visibilityState,
    focused: document.hasFocus(),
    collectedAt: new Date().toISOString(),
    ...(lastFix || {}),
  };
}

export async function pingPresence(mode: "full" | "quick" = "quick") {
  const wait =
    mode === "quick" ? 0 : lastFix && lastFix.gpsAccuracy <= 12 ? 600 : 12000;
  const device =
    mode === "quick" ? await collectQuickSnapshot() : await collectClientSnapshot(wait);
  return apiFetch("/api/presence/ping", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ device }),
    keepalive: true,
  });
}

export function startLivePresence() {
  startLiveActivity(() => {
    void pingPresence("quick");
  });
  void pingPresence("full");
}
