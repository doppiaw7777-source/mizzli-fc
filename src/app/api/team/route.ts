import { NextResponse } from "next/server";
import defaultTeam from "@/data/default-team.json";
import { getTeamData } from "@/lib/storage";
import type { TeamData } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const headers = {
    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    Pragma: "no-cache",
  };
  try {
    const data = await getTeamData();
    return NextResponse.json(data, { headers });
  } catch (err) {
    console.error("GET /api/team failed, returning defaultTeam", err);
    try {
      return NextResponse.json(defaultTeam as TeamData, { headers, status: 200 });
    } catch {
      return NextResponse.json(
        { error: "team_unavailable", message: "Dati squadra non disponibili" },
        { status: 503, headers }
      );
    }
  }
}
