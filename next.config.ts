import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
        source: "/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
          {
            key: "Accept-CH",
            value:
              "Sec-CH-UA-Model, Sec-CH-UA-Platform, Sec-CH-UA-Platform-Version, Sec-CH-UA-Full-Version-List, Sec-CH-UA-Mobile, Sec-CH-UA-Arch, Sec-CH-UA-Bitness, Sec-CH-UA-Form-Factors",
          },
          { key: "Critical-CH", value: "Sec-CH-UA-Model" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      { source: "/brand/players/:name.jpg", destination: "/brand/players/:name.png" },
    ];
  },
};

export default nextConfig;
