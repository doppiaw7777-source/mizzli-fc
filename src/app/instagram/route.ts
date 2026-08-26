import { NextResponse } from "next/server";

const INSTAGRAM = "https://www.instagram.com/mizzlifc/";

export function GET() {
  return NextResponse.redirect(INSTAGRAM, 302);
}
