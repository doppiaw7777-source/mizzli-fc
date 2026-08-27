import { NextRequest, NextResponse } from "next/server";
import { addNotice } from "@/lib/notices";
import { getNoticeHookToken, hookTokenMatches, rotateNoticeHookToken } from "@/lib/notice-hook";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

function tokenFromRequest(request: NextRequest) {
  const url = new URL(request.url);
  const auth = request.headers.get("authorization") || "";
  const bearer = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7) : "";
  return (
    url.searchParams.get("key") ||
    request.headers.get("x-mizzli-hook") ||
    bearer
  );
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
  const token = await getNoticeHookToken();
  const origin = (process.env.NEXT_PUBLIC_APP_URL || "https://mizzlifc.it").replace(/\/$/, "");
  return NextResponse.json({
    url: `${origin}/api/hooks/notice?key=${token}`,
    method: "POST",
    example: {
      title: "Allenamento spostato",
      body: "Domani ore 20.30",
      href: "/calendario",
    },
  });
}

export async function POST(request: NextRequest) {
  const expected = await getNoticeHookToken();
  const given = tokenFromRequest(request);
  if (!hookTokenMatches(given, expected)) {
    return NextResponse.json({ error: "Webhook non valido" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const notice = await addNotice({
    title: String(body?.title || body?.text || "Avviso MIZZLI"),
    body: String(body?.body || body?.message || ""),
    href: String(body?.href || body?.url || "/avvisi"),
    kind: "custom",
  });
  if (!notice) {
    return NextResponse.json({ error: "Manca il titolo" }, { status: 400 });
  }
  return NextResponse.json({ ok: true, notice });
}

export async function PUT() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
  const token = await rotateNoticeHookToken();
  const origin = (process.env.NEXT_PUBLIC_APP_URL || "https://mizzlifc.it").replace(/\/$/, "");
  return NextResponse.json({
    url: `${origin}/api/hooks/notice?key=${token}`,
  });
}
