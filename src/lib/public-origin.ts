const CLUB_HOSTS = [
  "mizzlifc.it",
  "www.mizzlifc.it",
  "mizzlifc.com",
  "www.mizzlifc.com",
];

const HTTPS_HOST_SUFFIXES = [
  ".onrender.com",
  ".trycloudflare.com",
  ".lhr.life",
  ".localhost.run",
  ".loca.lt",
  ".pinggy.link",
  ".run.pinggy-free.link",
  ".free.pinggy.net",
  ".ngrok-free.app",
  ".ngrok.io",
  ".cfargotunnel.com",
  ".serveousercontent.com",
];

function firstHeader(value: string | null) {
  return (value || "").split(",")[0].trim();
}

export function hostLooksPublicHttps(host: string) {
  const h = host.split(":")[0].toLowerCase();
  if (CLUB_HOSTS.includes(h)) return true;
  return HTTPS_HOST_SUFFIXES.some((suffix) => h.endsWith(suffix));
}

export function requestIsHttps(request?: Request, headerStore?: Headers) {
  const headers = request?.headers ?? headerStore;
  const host = firstHeader(
    headers?.get("x-forwarded-host") ||
      headers?.get("host") ||
      (request ? new URL(request.url).host : "")
  );
  if (hostLooksPublicHttps(host)) return true;

  const forwarded = firstHeader(headers?.get("x-forwarded-proto") ?? null).toLowerCase();
  if (forwarded === "https") return true;

  const cfVisitor = headers?.get("cf-visitor") || "";
  if (cfVisitor.includes("https")) return true;

  if (request && new URL(request.url).protocol === "https:") return true;
  return false;
}

export function getRequestOrigin(request: Request) {
  const host = firstHeader(
    request.headers.get("x-forwarded-host") ||
      request.headers.get("host") ||
      new URL(request.url).host
  );
  const proto = requestIsHttps(request) ? "https" : "http";
  return `${proto}://${host}`;
}
