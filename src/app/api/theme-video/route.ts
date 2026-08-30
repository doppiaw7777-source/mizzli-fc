import { NextResponse } from "next/server";
import { P0 } from "@/lib/theme-video/p0";
import { P1 } from "@/lib/theme-video/p1";
import { P2 } from "@/lib/theme-video/p2";
import { P3 } from "@/lib/theme-video/p3";
import { P4 } from "@/lib/theme-video/p4";
import { P5 } from "@/lib/theme-video/p5";
import { P6 } from "@/lib/theme-video/p6";
import { P7 } from "@/lib/theme-video/p7";

export const dynamic = "force-static";

export async function GET() {
  const buf = Buffer.from(P0 + P1 + P2 + P3 + P4 + P5 + P6 + P7, "base64");
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "video/mp4",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(buf.length),
    },
  });
}
