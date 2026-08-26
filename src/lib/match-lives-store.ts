import type { MatchLive, MatchLivesStore, TeamData } from "./types";
import { readJson, writeJson } from "./store";
import { emptyMatchLivesStore } from "./match-live";

const STORE_KEY = "match-lives";

function normalizeStore(raw: MatchLivesStore | null | undefined): MatchLivesStore {
  const lives = Array.isArray(raw?.lives) ? raw!.lives : [];
  return {
    activeMatchId: String(raw?.activeMatchId || ""),
    lives: lives.map(normalizeLive).filter((live) => !!live.matchId),
  };
}

function normalizeLive(live: MatchLive): MatchLive {
  return {
    matchId: String(live.matchId || ""),
    status: live.status || "idle",
    scoreUs: Number(live.scoreUs) || 0,
    scoreOpp: Number(live.scoreOpp) || 0,
    minute: Number(live.minute) || 0,
    extra: Number(live.extra) || 0,
    events: Array.isArray(live.events) ? live.events : [],
    clockBaseMinute: Number(live.clockBaseMinute) || Number(live.minute) || 0,
    clockStartedAt: live.clockStartedAt || null,
    updatedAt: live.updatedAt || new Date().toISOString(),
  };
}

export async function getMatchLivesStore(): Promise<MatchLivesStore> {
  const raw = await readJson<MatchLivesStore>(STORE_KEY, emptyMatchLivesStore());
  return normalizeStore(raw);
}

export async function saveMatchLivesStore(store: MatchLivesStore): Promise<void> {
  await writeJson(STORE_KEY, normalizeStore(store));
}

export async function seedMatchLivesFromTeam(data: TeamData): Promise<MatchLivesStore> {
  const current = await getMatchLivesStore();
  if (current.lives.length) return current;
  const fallback = data.club.matchLives;
  if (!fallback?.length) return current;
  const seeded: MatchLivesStore = {
    activeMatchId: data.club.info.liveMatchId || current.activeMatchId,
    lives: fallback,
  };
  await saveMatchLivesStore(seeded);
  return seeded;
}

export function livesStoreFromTeam(data: TeamData): MatchLivesStore {
  const lives = data.club.matchLives || [];
  const active =
    data.club.info.liveMatchId ||
    lives.find((live) => live.status === "live" || live.status === "ht")?.matchId ||
    "";
  return { activeMatchId: active, lives };
}
