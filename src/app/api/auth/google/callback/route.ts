import { NextRequest, NextResponse } from "next/server";
import {
  exchangeGoogleCode,
  getRequestOrigin,
  googleConfigured,
  googleRedirectUri,
  loginOrRegisterGoogle,
} from "@/lib/google-oauth";
import { appendAuthAudit } from "@/lib/auth-audit";
import { buildSessionInfo } from "@/lib/session-info";
import { applyUserSessionCookie } from "@/lib/user-auth";
import { postLoginPath } from "@/lib/roles";

export async function GET(request: NextRequest) {
  const origin = getRequestOrigin(request);
  const fail = (msg: string) =>
    NextResponse.redirect(`${origin}/accedi?error=${encodeURIComponent(msg)}`);

  if (!googleConfigured()) {
    return fail("Google Login non configurato");
  }

  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  if (error) return fail("Accesso Google annullato");

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const saved = request.cookies.get("google_oauth_state")?.value;
  if (!code || !state || !saved || state !== saved) {
    return fail("Sessione Google non valida. Riprova.");
  }

  const session = await buildSessionInfo(request);

  try {
    const { profile, phone } = await exchangeGoogleCode(code, origin);
    const { token, user } = await loginOrRegisterGoogle(profile, phone);
    await appendAuthAudit({
      at: new Date().toISOString(),
      channel: "user",
      identifier: profile.email || "google-user",
      ok: true,
      role: user.role || "fan",
      ip: session.ip,
      userAgent: session.userAgent,
      phone: user.phone || "",
      session: { ...session, phoneNumber: user.phone || "" },
    });
    const res = NextResponse.redirect(`${origin}${postLoginPath(user)}`);
    applyUserSessionCookie(res, token, request);
    res.cookies.delete("google_oauth_state");
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Errore Google";
    const redirectUri = googleRedirectUri(origin);
    const friendly =
      message.toLowerCase().includes("redirect_uri") ||
      message.toLowerCase().includes("rifiutato il codice") ||
      message.toLowerCase().includes("invalid_client")
        ? `Google non accetta questo link. Aggiungi questo URI in Google Cloud: ${redirectUri}`
        : message;
    await appendAuthAudit({
      at: new Date().toISOString(),
      channel: "user",
      identifier: "google-oauth",
      ok: false,
      role: "fan",
      reason: message,
      ip: session.ip,
      userAgent: session.userAgent,
      session,
    });
    return fail(friendly);
  }
}
