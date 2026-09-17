import { NextResponse } from "next/server";
import { getTeamData } from "@/lib/storage";
import { standingGoalDiff, standingPoints } from "@/lib/standings";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getTeamData();
  const rows = (data.standings?.rows || []).map((row, index) => ({
    teamId: row.id,
    name: row.name,
    logo: row.logoUrl || "",
    played: row.played,
    wins: row.won,
    draws: row.drawn,
    losses: row.lost,
    goalsFor: row.goalsFor,
    goalsAgainst: row.goalsAgainst,
    goalDifference: standingGoalDiff(row),
    points: standingPoints(row),
    position: index + 1,
    isUs: row.isUs,
  }));
  return NextResponse.json(
    {
      title: data.standings?.title || "Classifica Campionato",
      season: data.standings?.season || "",
      rows,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
    }
  );
}
