import { NextResponse } from "next/server";
import {
  applyAdminSessionCookie,
  createSession,
  verifyAdminPin,
  verifyCredentials,
} from "@/lib/auth";
import { appendAuthAudit } from "@/lib/auth-audit";
import { buildSessionInfo } from "@/lib/session-info";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const username = String(body?.username || "").trim();
  const password = String(body?.password || "");
  const pin = String(body?.pin ?? "").trim();
  const session = await buildSessionInfo(request, body?.device);

  if (!username || !password || !pin) {
    await appendAuthAudit({
      at: new Date().toISOString(),
      channel: "admin",
      identifier: username,
      ok: false,
      role: "admin",
      reason: "Credenziali o PIN mancanti",
      ip: session.ip,
      userAgent: session.userAgent,
      session,
    });
    return NextResponse.json({ error: "Credenziali o PIN mancanti" }, { status: 400 });
  }

  if (!verifyAdminPin(pin)) {
    await appendAuthAudit({
      at: new Date().toISOString(),
      channel: "admin",
      identifier: username,
      ok: false,
      role: "admin",
      reason: "PIN non valido",
      ip: session.ip,
      userAgent: session.userAgent,
      session,
    });
    return NextResponse.json({ error: "PIN non valido" }, { status: 401 });
  }

  const valid = await verifyCredentials(username, password);
  if (!valid) {
    await appendAuthAudit({
      at: new Date().toISOString(),
      channel: "admin",
      identifier: username,
      ok: false,
      role: "admin",
      reason: "Utente o password non validi",
      ip: session.ip,
      userAgent: session.userAgent,
      session,
    });
    return NextResponse.json({ error: "Utente o password non validi" }, { status: 401 });
  }

  const token = await createSession(username, request);
  await appendAuthAudit({
    at: new Date().toISOString(),
    channel: "admin",
    identifier: username,
    ok: true,
    role: "admin",
    ip: session.ip,
    userAgent: session.userAgent,
    session,
  });
  const res = NextResponse.json({ success: true, token });
  applyAdminSessionCookie(res, token, request);
  return res;
}
