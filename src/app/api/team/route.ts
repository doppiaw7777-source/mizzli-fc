import { NextResponse } from "next/server";
import { getTeamData } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getTeamData();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
    });
  } catch (err) {
    console.error("GET /api/team failed", err);
    return NextResponse.json(
      { error: "team_unavailable", message: "Dati squadra non disponibili" },
      { status: 503 }
    );
  }
}
