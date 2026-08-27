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

function jsonError(error: string, status: number, retry: boolean) {
  const res = NextResponse.json({ error, retry }, { status });
  if (retry) res.headers.set("Retry-After", status === 503 ? "5" : "15");
  return res;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return jsonError("Non autorizzato", 401, false);
  }
  const token = await getNoticeHookToken();
  const origin = (process.env.NEXT_PUBLIC_APP_URL || "https://mizzlifc.it").replace(/\/$/, "");
  return NextResponse.json({
    url: `${origin}/api/hooks/notice?key=${token}`,
    method: "POST",
    retry: {
      on: [429, 500, 502, 503],
      max: 5,
      header: "Idempotency-Key",
    },
    example: {
      title: "Allenamento spostato",
      body: "Domani ore 20.30",
      href: "/calendario",
      id: "allenamento-2026-08-28",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const expected = await getNoticeHookToken();
    const given = tokenFromRequest(request);
    if (!hookTokenMatches(given, expected)) {
      return jsonError("Webhook non valido", 401, false);
    }
    const body = await request.json().catch(() => ({}));
    const idem =
      String(body?.id || body?.idempotencyKey || request.headers.get("idempotency-key") || "").trim();
    const { notice, duplicate } = await addNotice({
      title: String(body?.title || body?.text || ""),
      body: String(body?.body || body?.message || ""),
      href: String(body?.href || body?.url || "/avvisi"),
      kind: "custom",
      idempotencyKey: idem,
    });
    if (!notice) return jsonError("Manca il titolo", 400, false);
    return NextResponse.json({ ok: true, notice, duplicate, retry: false });
  } catch {
    return jsonError("Errore temporaneo, ritenta", 503, true);
  }
}

export async function PUT() {
  try {
    await requireAdmin();
  } catch {
    return jsonError("Non autorizzato", 401, false);
  }
  const token = await rotateNoticeHookToken();
  const origin = (process.env.NEXT_PUBLIC_APP_URL || "https://mizzlifc.it").replace(/\/$/, "");
  return NextResponse.json({ url: `${origin}/api/hooks/notice?key=${token}` });
}
