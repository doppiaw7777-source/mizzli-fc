import { NextResponse } from "next/server";
import { googleConfigured, googleScopes } from "@/lib/google-oauth";

export async function GET() {
  return NextResponse.json({
    enabled: googleConfigured(),
    scopes: googleScopes(),
  });
}
