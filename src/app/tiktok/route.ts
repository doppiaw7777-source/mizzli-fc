import { NextResponse } from "next/server";

const TIKTOK = "https://www.tiktok.com/@mizzlitv";

export function GET() {
  return NextResponse.redirect(TIKTOK, 302);
}
