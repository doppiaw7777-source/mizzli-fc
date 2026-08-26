import type { LiveActivity } from "./live-activity";

export type ClientSnapshot = Record<string, unknown>;

export interface GeoInfo {
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  postal?: string;
  lat?: number;
  lon?: number;
  isp?: string;
  org?: string;
  as?: string;
  timezone?: string;
  query?: string;
  source?: "gps" | "ip";
  accuracyMeters?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  street?: string;
  houseNumber?: string;
  neighbourhood?: string;
  displayName?: string;
  ipLat?: number;
  ipLon?: number;
}

export interface SessionInfo {
  ip: string;
  userAgent: string;
  browser?: string;
  os?: string;
  device?: string;
  deviceType?: string;
  app?: string;
  language?: string;
  timezone?: string;
  page?: string;
  geo?: GeoInfo;
  countryHeader?: string;
  acceptLanguage?: string;
  referer?: string;
  origin?: string;
  host?: string;
  cfRay?: string;
  secChUa?: string;
  secChUaMobile?: string;
  secChUaPlatform?: string;
  client?: ClientSnapshot;
  headers?: Record<string, string>;
  collectedAt?: string;
  phoneModelExact?: string;
  phoneNumber?: string;
  activity?: LiveActivity;
}
