import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { blankDemo, deleteDemoClub, getDemoClub, saveDemoClub } from "@/lib/demo-club";

export const dynamic = "force-dynamic";

export async function GET() {
  const club = await getDemoClub();
  return NextResponse.json({ club });
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Solo admin" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const club = await saveDemoClub(blankDemo(String(body?.teamName || "ASD Prova FC")));
  return NextResponse.json({ club, preview: "/demo" });
}

export async function DELETE() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Solo admin" }, { status: 401 });
  }
  await deleteDemoClub();
  return NextResponse.json({ ok: true });
}
