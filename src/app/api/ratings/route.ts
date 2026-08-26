import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/user-auth";
import {
  getMatchRatingSummaries,
  getPlayerMatchRating,
  upsertRating,
} from "@/lib/ratings";
import { getTeamData } from "@/lib/storage";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const matchId = searchParams.get("matchId")?.trim() || "";
  const playerId = searchParams.get("playerId")?.trim() || "";
  if (!matchId) {
    return NextResponse.json({ error: "matchId obbligatorio" }, { status: 400 });
  }

  const user = await getUserSession();
  if (playerId) {
    const summary = await getPlayerMatchRating(matchId, playerId, user?.id);
    return NextResponse.json({ matchId, playerId, summary });
  }

  const summaries = await getMatchRatingSummaries(matchId, user?.id);
  return NextResponse.json({
    matchId,
    summaries,
    loggedIn: !!user,
  });
}

export async function POST(request: Request) {
  const user = await getUserSession();
  if (!user) {
    return NextResponse.json(
      { error: "Accedi per votare i giocatori" },
      { status: 401 }
    );
  }

  let body: { matchId?: string; playerId?: string; score?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON non valido" }, { status: 400 });
  }

  const matchId = String(body.matchId || "").trim();
  const playerId = String(body.playerId || "").trim();
  const score = Number(body.score);

  if (!matchId || !playerId) {
    return NextResponse.json(
      { error: "matchId e playerId obbligatori" },
      { status: 400 }
    );
  }
  if (!Number.isFinite(score) || score < 1 || score > 10) {
    return NextResponse.json(
      { error: "Il voto deve essere da 1 a 10" },
      { status: 400 }
    );
  }

  const team = await getTeamData();
  const match = team.matches.find((m) => m.id === matchId);
  if (!match) {
    return NextResponse.json({ error: "Partita non trovata" }, { status: 404 });
  }
  const player = team.players.find((p) => p.id === playerId);
  if (!player) {
    return NextResponse.json({ error: "Giocatore non trovato" }, { status: 404 });
  }

  const rating = await upsertRating({
    matchId,
    playerId,
    voterId: user.id,
    score,
  });
  const summary = await getPlayerMatchRating(matchId, playerId, user.id);

  return NextResponse.json({ ok: true, rating, summary });
}
