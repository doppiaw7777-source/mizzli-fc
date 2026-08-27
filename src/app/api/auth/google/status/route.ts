import { NextResponse } from "next/server";
import { googleConfigured, googleRedirectUri, googleScopes } from "@/lib/google-oauth";

export async function GET() {
  const configuredUrl = (process.env.NEXT_PUBLIC_APP_URL || "").trim().replace(/\/$/, "");
  return NextResponse.json({
    enabled: googleConfigured(),
    scopes: googleScopes(),
    redirectUri: configuredUrl ? googleRedirectUri(configuredUrl) : null,
  });
}
