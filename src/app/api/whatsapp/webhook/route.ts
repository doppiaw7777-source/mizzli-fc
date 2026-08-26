import { NextRequest, NextResponse } from "next/server";
import { appendWhatsAppLog, getWhatsAppConfig } from "@/lib/whatsapp-store";
import { extractIncomingMessages, type IncomingWhatsApp } from "@/lib/whatsapp-results";
import { ingestWhatsAppText, replyOnWhatsApp } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");
  const config = await getWhatsAppConfig();
  if (mode === "subscribe" && token && token === config.verifyToken) {
    return new NextResponse(challenge || "", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }
  return NextResponse.json({ error: "Verify token non valido" }, { status: 403 });
}

export async function POST(request: NextRequest) {
  const config = await getWhatsAppConfig();
  const contentType = request.headers.get("content-type") || "";
  let messages: IncomingWhatsApp[] = [];

  try {
    if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const params = new URLSearchParams();
      form.forEach((value, key) => params.set(key, String(value)));
      messages = extractIncomingMessages(null, params);
    } else {
      const body = await request.json().catch(() => null);
      messages = extractIncomingMessages(body);
    }
  } catch {
    messages = [];
  }

  for (const msg of messages) {
    const result = await ingestWhatsAppText(msg.text, msg.from);
    const reply = result.ok ? result.message : result.error;
    try {
      await replyOnWhatsApp(config, msg.from, `⚽ ${reply}`);
    } catch {
      await appendWhatsAppLog({
        at: new Date().toISOString(),
        from: msg.from,
        text: msg.text,
        ok: false,
        detail: "Risultato salvato ma la risposta WhatsApp non è partita",
      });
    }
  }

  return NextResponse.json({ success: true, count: messages.length });
}
