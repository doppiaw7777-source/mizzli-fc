export function extractClientIp(request: Request) {
  const xff = request.headers.get("x-forwarded-for") || "";
  const rip = xff.split(",")[0]?.trim();
  if (rip) return rip;
  const real = request.headers.get("x-real-ip") || "";
  if (real) return real.trim();
  const cf = request.headers.get("cf-connecting-ip") || "";
  if (cf) return cf.trim();
  return "sconosciuto";
}

export function extractUserAgent(request: Request) {
  return request.headers.get("user-agent") || "sconosciuto";
}
