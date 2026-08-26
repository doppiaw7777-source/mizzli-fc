import { NextResponse } from "next/server";
import { requireDeveloper } from "@/lib/auth";
import { getPresence, withStatus } from "@/lib/presence";

export async function GET() {
  try {
    await requireDeveloper();
  } catch {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const list = await getPresence();
  return NextResponse.json({ users: withStatus(list) });
}
