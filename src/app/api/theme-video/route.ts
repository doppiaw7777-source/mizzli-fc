import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** I file base64 del video tema non sono nel repo: evita module-not-found in build. */
export async function GET() {
  return new NextResponse(null, { status: 204 });
}
