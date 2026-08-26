import { NextResponse } from "next/server";
import { requireDeveloper } from "@/lib/auth";
import { readAuthAudit } from "@/lib/auth-audit";

export async function GET() {
  try {
    await requireDeveloper();
  } catch {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const logs = await readAuthAudit();
  return NextResponse.json({
    logs: logs.map((x) => ({
      ...x,
      passwordUsed: "[NON SALVATA IN CHIARO PER SICUREZZA]",
    })),
  });
}
