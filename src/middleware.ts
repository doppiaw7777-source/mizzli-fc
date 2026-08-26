import { NextRequest, NextResponse } from "next/server";

const extraOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function isAllowedOrigin(origin: string) {
  if (!origin) return false;
  if (
    origin === "capacitor://localhost" ||
    origin === "ionic://localhost" ||
    origin === "http://localhost" ||
    origin === "https://localhost"
  ) {
    return true;
  }
  if (
    origin === "https://mizzlifc.it" ||
    origin === "https://www.mizzlifc.it" ||
    origin === "http://mizzlifc.it" ||
    origin === "http://www.mizzlifc.it" ||
    origin === "https://mizzlifc.com" ||
    origin === "https://www.mizzlifc.com" ||
    origin === "http://mizzlifc.com" ||
    origin === "http://www.mizzlifc.com" ||
    origin.endsWith(".trycloudflare.com") ||
    origin.endsWith(".lhr.life") ||
    origin.endsWith(".localhost.run") ||
    origin.endsWith(".loca.lt") ||
    origin.endsWith(".pinggy.link") ||
    origin.endsWith(".run.pinggy-free.link") ||
    origin.endsWith(".free.pinggy.net") ||
    origin.endsWith(".ngrok-free.app") ||
    origin.endsWith(".ngrok.io") ||
    origin.endsWith(".cfargotunnel.com") ||
    origin.endsWith(".serveousercontent.com")
  ) {
    return true;
  }
  if (extraOrigins.includes(origin)) return true;
  return false;
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin") || "";
  const allowed = isAllowedOrigin(origin);

  if (request.method === "OPTIONS") {
    const res = new NextResponse(null, { status: 204 });
    if (allowed) {
      res.headers.set("Access-Control-Allow-Origin", origin);
      res.headers.set("Access-Control-Allow-Credentials", "true");
      res.headers.set(
        "Access-Control-Allow-Headers",
        "Authorization, Content-Type"
      );
      res.headers.set(
        "Access-Control-Allow-Methods",
        "GET,POST,PUT,PATCH,DELETE,OPTIONS"
      );
    }
    return res;
  }

  const response = NextResponse.next();
  if (allowed) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }
  return response;
}

export const config = {
  matcher: "/api/:path*",
};
