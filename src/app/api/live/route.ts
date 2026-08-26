import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { requireCoachUser } from "@/lib/user-auth";
import { getTeamData, saveTeamData } from "@/lib/storage";
import { getMatchLivesStore, saveMatchLivesStore } from "@/lib/match-lives-store";
import { applyLiveCommand, describeCommand, type LiveCommand } from "@/lib/live-engine";
import { activeMatchLive, liveForMatch } from "@/lib/match-live";

export const dynamic = "force-dynamic";

async function requireLiveEditor() {
  try {
    const admin = await requireAdmin();
    return { kind: "admin" as const, name: admin.username };
  } catch {
    const user = await requireCoachUser();
    return { kind: "staff" as const, name: user.name };
  }
}

function isAuthError(err: unknown) {
  const msg = err instanceof Error ? err.message.toLowerCase() : "";
  return (
    msg.includes("non autenticato") ||
    msg.includes("non autorizzato") ||
    msg.includes("unauthorized") ||
    msg.includes("accesso negato") ||
    msg.includes("sessione")
  );
}

export async function GET(request: NextRequest) {
  const data = await getTeamData();
  const matchId = request.nextUrl.searchParams.get("matchId")?.trim() || "";
  const store = await getMatchLivesStore();
  const live = matchId ? liveForMatch(data, matchId) : activeMatchLive(store);
  const match = live ? data.matches.find((item) => item.id === live.matchId) : null;
  return NextResponse.json({
    live,
    match: match || null,
    activeMatchId: data.club.info.liveMatchId || store.activeMatchId || "",
  });
}

export async function POST(request: NextRequest) {
  try {
    await requireLiveEditor();
    let command: LiveCommand;
    try {
      command = (await request.json()) as LiveCommand;
    } catch {
      return NextResponse.json({ error: "JSON non valido" }, { status: 400 });
    }
    if (!command || typeof command !== "object" || !("action" in command)) {
      return NextResponse.json({ error: "Azione obbligatoria" }, { status: 400 });
    }

    const team = await getTeamData();
    const store = await getMatchLivesStore();
    const applied = applyLiveCommand(team, store, command);
    await saveMatchLivesStore(applied.store);
    await saveTeamData(applied.team);

    const saved = await getTeamData();
    return NextResponse.json({
      ok: true,
      message: describeCommand(command),
      live: applied.live,
      team: saved,
    });
  } catch (err) {
    if (isAuthError(err)) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : "Aggiornamento live non riuscito";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
