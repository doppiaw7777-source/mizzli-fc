import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getRequestOrigin } from "@/lib/public-origin";
import { getTeamData, saveTeamData } from "@/lib/storage";
import {
  getWhatsAppConfig,
  publicWhatsAppConfig,
  saveWhatsAppConfig,
} from "@/lib/whatsapp-store";
import { ingestWhatsAppText, waMeLink } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const config = await getWhatsAppConfig();
    const origin = getRequestOrigin(request);
    return NextResponse.json({
      ...publicWhatsAppConfig(config),
      webhookUrl: `${origin}/api/whatsapp/webhook`,
      ingestUrl: `${origin}/api/whatsapp/ingest`,
      waLink: waMeLink(config.phone),
    });
  } catch {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const current = await getWhatsAppConfig();
    const next = await saveWhatsAppConfig({
      ...current,
      enabled: body.enabled ?? current.enabled,
      phone: String(body.phone ?? current.phone),
      allowedFrom: Array.isArray(body.allowedFrom)
        ? body.allowedFrom.map(String)
        : current.allowedFrom,
      cloudAccessToken:
        typeof body.cloudAccessToken === "string" && body.cloudAccessToken.trim()
          ? body.cloudAccessToken.trim()
          : current.cloudAccessToken,
      cloudPhoneNumberId: String(body.cloudPhoneNumberId ?? current.cloudPhoneNumberId),
    });

    if (next.phone) {
      const team = await getTeamData();
      if (team.club.info.whatsapp !== next.phone) {
        team.club.info.whatsapp = next.phone;
        await saveTeamData(team);
      }
    }

    const origin = getRequestOrigin(request);
    return NextResponse.json({
      ...publicWhatsAppConfig(next),
      webhookUrl: `${origin}/api/whatsapp/webhook`,
      ingestUrl: `${origin}/api/whatsapp/ingest`,
      waLink: waMeLink(next.phone),
    });
  } catch {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const text = String(body.text || "");
    const result = await ingestWhatsAppText(text, "admin-test");
    return NextResponse.json(result, { status: result.ok ? 200 : 422 });
  } catch {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
}
