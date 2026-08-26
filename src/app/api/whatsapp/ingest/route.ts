import { NextRequest, NextResponse } from "next/server";
import { getWhatsAppConfig } from "@/lib/whatsapp-store";
import { ingestWhatsAppText } from "@/lib/whatsapp";
import { extractIncomingMessages } from "@/lib/whatsapp-results";

export const dynamic = "force-dynamic";

function tokenFrom(request: NextRequest) {
  const header = request.headers.get("authorization") || "";
  if (header.toLowerCase().startsWith("bearer ")) return header.slice(7).trim();
  return request.nextUrl.searchParams.get("token") || "";
}

export async function POST(request: NextRequest) {
  const config = await getWhatsAppConfig();
  const token = tokenFrom(request);
  if (!token || token !== config.ingestToken) {
    return NextResponse.json({ error: "Token non valido" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") || "";
  let text = "";
  let from = "";

  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const params = new URLSearchParams();
    form.forEach((value, key) => params.set(key, String(value)));
    const msgs = extractIncomingMessages(null, params);
    text = msgs[0]?.text || "";
    from = msgs[0]?.from || "";
  } else {
    const body = await request.json().catch(() => ({}));
    const msgs = extractIncomingMessages(body);
    text = msgs[0]?.text || "";
    from = msgs[0]?.from || "";
  }

  if (!text) {
    return NextResponse.json({ error: "Messaggio vuoto" }, { status: 400 });
  }

  const result = await ingestWhatsAppText(text, from);
  return NextResponse.json(result, { status: result.ok ? 200 : 422 });
}
