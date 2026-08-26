import { NextResponse } from "next/server";
import { requireAdmin, unlockDeveloper } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const pin = String(body?.pin || "");
  if (!(await unlockDeveloper(pin))) {
    return NextResponse.json({ error: "PIN non valido" }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
