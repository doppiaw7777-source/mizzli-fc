import { NextResponse } from "next/server";
import { addNotice, getNotices } from "@/lib/notices";
import { requireAdmin } from "@/lib/auth";
import { requireStaffUser } from "@/lib/user-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const notices = await getNotices();
    return NextResponse.json({ notices, retry: false });
  } catch {
    return NextResponse.json({ error: "Avvisi non disponibili", retry: true }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    try {
      await requireAdmin();
    } catch {
      await requireStaffUser();
    }
  } catch {
    return NextResponse.json({ error: "Non autorizzato", retry: false }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  try {
    const { notice, duplicate } = await addNotice({
      title: String(body?.title || ""),
      body: String(body?.body || ""),
      href: String(body?.href || "/"),
      kind: body?.kind === "callup" || body?.kind === "live" || body?.kind === "news" ? body.kind : "custom",
      idempotencyKey: String(body?.id || body?.idempotencyKey || request.headers.get("idempotency-key") || ""),
    });
    if (!notice) {
      return NextResponse.json({ error: "Scrivi un titolo", retry: false }, { status: 400 });
    }
    return NextResponse.json({ ok: true, notice, duplicate, retry: false });
  } catch {
    return NextResponse.json({ error: "Salvataggio fallito, riprova", retry: true }, { status: 503 });
  }
}
