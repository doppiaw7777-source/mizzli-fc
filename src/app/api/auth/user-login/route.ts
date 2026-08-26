import { NextResponse } from "next/server";
import { appendAuthAudit } from "@/lib/auth-audit";
import { buildSessionInfo } from "@/lib/session-info";
import { findUserByEmail } from "@/lib/users";
import { applyUserSessionCookie, loginWithEmail } from "@/lib/user-auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = body?.email;
  const password = body?.password;
  const session = await buildSessionInfo(request, body?.device);

  try {
    const result = await loginWithEmail(email || "", password || "");
    const phone = result.user.phone || "";
    await appendAuthAudit({
      at: new Date().toISOString(),
      channel: "user",
      identifier: String(email || ""),
      ok: true,
      role: result.user.role || "fan",
      phone,
      ip: session.ip,
      userAgent: session.userAgent,
      session: { ...session, phoneNumber: phone || session.phoneNumber },
    });
    const res = NextResponse.json({ success: true, user: result.user });
    applyUserSessionCookie(res, result.token, request);
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Accesso non riuscito";
    const u = await findUserByEmail(String(email || ""));
    const phone = u?.phone || "";
    await appendAuthAudit({
      at: new Date().toISOString(),
      channel: "user",
      identifier: String(email || ""),
      ok: false,
      role: u?.role || "fan",
      reason: message,
      phone,
      ip: session.ip,
      userAgent: session.userAgent,
      session: { ...session, phoneNumber: phone || session.phoneNumber },
    });
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
