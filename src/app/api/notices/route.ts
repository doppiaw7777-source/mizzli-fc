import { NextResponse } from "next/server";
import { addNotice, getNotices } from "@/lib/notices";
import { requireAdmin } from "@/lib/auth";
import { requireStaffUser } from "@/lib/user-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const notices = await getNotices();
  return NextResponse.json({ notices });
}

export async function POST(request: Request) {
  try {
    try {
      await requireAdmin();
    } catch {
      await requireStaffUser();
    }
  } catch {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const notice = await addNotice({
    title: String(body?.title || ""),
    body: String(body?.body || ""),
    href: String(body?.href || "/"),
    kind: body?.kind === "callup" || body?.kind === "live" || body?.kind === "news" ? body.kind : "custom",
  });
  if (!notice) {
    return NextResponse.json({ error: "Scrivi un titolo" }, { status: 400 });
  }
  return NextResponse.json({ ok: true, notice });
}
