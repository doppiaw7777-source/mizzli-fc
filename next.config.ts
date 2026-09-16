import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    proxyClientMaxBodySize: "64mb",
    serverActions: { bodySizeLimit: "64mb" },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "**.onrender.com" },
      { protocol: "https", hostname: "mizzlifc.it" },
      { protocol: "https", hostname: "www.mizzlifc.it" },
    ],
  },
  allowedDevOrigins: [
    "mizzlifc.it",
    "www.mizzlifc.it",
    "mizzlifc.com",
    "www.mizzlifc.com",
    "*.trycloudflare.com",
    "*.lhr.life",
    "*.localhost.run",
    "*.loca.lt",
    "*.pinggy.link",
    "*.run.pinggy-free.link",
    "*.free.pinggy.net",
    "*.ngrok-free.app",
    "*.ngrok.io",
    "*.cfargotunnel.com",
    "*.serveousercontent.com",
    "*.onrender.com",
  ],
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/api/media/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/brand/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/api/team",
        headers: [{ key: "Cache-Control", value: "public, max-age=15, stale-while-revalidate=60" }],
      },
    ];
  },
  async rewrites() {
    return [{ source: "/brand/players/:name.jpg", destination: "/brand/players/:name.png" }];
  },
};

export default nextConfig;
