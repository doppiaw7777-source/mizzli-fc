import { NextResponse } from "next/server";
import { appendAuthAudit } from "@/lib/auth-audit";
import { buildSessionInfo } from "@/lib/session-info";
import { applyUserSessionCookie, registerWithEmail } from "@/lib/user-auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const session = await buildSessionInfo(request, body?.device);
  try {
    const result = await registerWithEmail(
      body?.name || "",
      body?.email || "",
      body?.password || "",
      body?.phone || "",
      body?.smsCode || ""
    );
    const phone = result.user.phone || "";
    await appendAuthAudit({
      at: new Date().toISOString(),
      channel: "user",
      identifier: String(body?.email || ""),
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
    const message = err instanceof Error ? err.message : "Registrazione non riuscita";
    const attempted = String(body?.phone || "");
    await appendAuthAudit({
      at: new Date().toISOString(),
      channel: "user",
      identifier: String(body?.email || ""),
      ok: false,
      role: "fan",
      reason: message,
      phone: attempted,
      ip: session.ip,
      userAgent: session.userAgent,
      session: { ...session, phoneNumber: attempted || session.phoneNumber },
    });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
