import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getSmsConfig, publicSmsConfig, saveSmsConfig } from "@/lib/sms-store";
import { sendSms } from "@/lib/sms";
import { isValidPhone } from "@/lib/phone";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const config = await getSmsConfig();
    return NextResponse.json(publicSmsConfig(config));
  } catch {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => ({}));
    const current = await getSmsConfig();
    const next = await saveSmsConfig({
      enabled: body.enabled ?? current.enabled,
      accountSid: String(body.accountSid ?? current.accountSid).trim(),
      authToken:
        typeof body.authToken === "string" && body.authToken.trim()
          ? body.authToken.trim()
          : current.authToken,
      fromNumber: String(body.fromNumber ?? current.fromNumber).trim(),
      textbeltKey:
        typeof body.textbeltKey === "string" && body.textbeltKey.trim()
          ? body.textbeltKey.trim()
          : current.textbeltKey,
    });
    return NextResponse.json(publicSmsConfig(next));
  } catch {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => ({}));
    const to = String(body?.to || "");
    if (!isValidPhone(to)) {
      return NextResponse.json({ error: "Numero di prova non valido" }, { status: 400 });
    }
    await sendSms(to, "MIZZLI FC: SMS di prova. Se lo leggi, l'invio funziona.");
    return NextResponse.json({ ok: true, message: "SMS di prova inviato." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invio non riuscito";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
