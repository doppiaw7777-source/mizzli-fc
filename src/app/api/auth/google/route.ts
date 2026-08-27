import { NextRequest, NextResponse } from "next/server";
import {
  googleAuthUrl,
  googleConfigured,
  googleOAuthOrigin,
  getRequestOrigin,
} from "@/lib/google-oauth";
import { oauthStateCookieOptions } from "@/lib/auth-cookies";

export async function GET(request: NextRequest) {
  const origin = googleOAuthOrigin(request);
  const requestOrigin = getRequestOrigin(request);
  if (origin !== requestOrigin) {
    return NextResponse.redirect(`${origin}/api/auth/google`);
  }
  if (!googleConfigured()) {
    return NextResponse.redirect(
      `${origin}/accedi?error=${encodeURIComponent(
        "Google non è ancora collegato. Imposta GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET."
      )}`
    );
  }
  const state = crypto.randomUUID();
  const res = NextResponse.redirect(googleAuthUrl(origin, state));
  res.cookies.set(
    "google_oauth_state",
    state,
    oauthStateCookieOptions(origin.startsWith("https://"), request)
  );
  return res;
}
