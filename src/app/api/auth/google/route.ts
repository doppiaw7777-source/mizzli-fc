import { NextRequest, NextResponse } from "next/server";
import { googleAuthUrl, googleConfigured, getRequestOrigin } from "@/lib/google-oauth";

export async function GET(request: NextRequest) {
  const origin = getRequestOrigin(request);
  if (!googleConfigured()) {
    return NextResponse.redirect(
      `${origin}/accedi?error=${encodeURIComponent(
        "Google non è ancora collegato. Imposta GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET."
      )}`
    );
  }
  const state = crypto.randomUUID();
  const res = NextResponse.redirect(googleAuthUrl(origin, state));
  res.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
    secure: origin.startsWith("https://"),
  });
  return res;
}
