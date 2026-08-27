import { getRequestOrigin } from "./public-origin";

export function hostFromRequest(request?: Request) {
  if (!request) {
    const configured = (process.env.NEXT_PUBLIC_APP_URL || "").trim();
    try {
      return configured ? new URL(configured).host : "";
    } catch {
      return "";
    }
  }
  try {
    return new URL(getRequestOrigin(request)).host;
  } catch {
    return "";
  }
}

export function clubCookieDomain(request?: Request) {
  const host = hostFromRequest(request).split(":")[0].toLowerCase();
  if (host === "mizzlifc.it" || host === "www.mizzlifc.it") return ".mizzlifc.it";
  if (host === "mizzlifc.com" || host === "www.mizzlifc.com") return ".mizzlifc.com";
  return undefined;
}

export function sessionCookieOptions(secure: boolean, request?: Request) {
  const domain = clubCookieDomain(request);
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    ...(domain ? { domain } : {}),
  };
}

export function oauthStateCookieOptions(secure: boolean, request?: Request) {
  const domain = clubCookieDomain(request);
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 600,
    secure,
    ...(domain ? { domain } : {}),
  };
}
