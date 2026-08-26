import { readJson, writeJson } from "./store";

export type MatchRating = {
  matchId: string;
  playerId: string;
  voterId: string;
  score: number;
  updatedAt: string;
};

export type RatingsStore = {
  ratings: MatchRating[];
};

export type PlayerRatingSummary = {
  playerId: string;
  average: number | null;
  count: number;
  myScore: number | null;
};

const STORE_KEY = "ratings";

function clampScore(score: number) {
  return Math.min(10, Math.max(1, Math.round(score)));
}

export async function getRatingsStore(): Promise<RatingsStore> {
  return readJson<RatingsStore>(STORE_KEY, { ratings: [] });
}

async function saveRatingsStore(store: RatingsStore) {
  await writeJson(STORE_KEY, store);
}

export async function upsertRating(input: {
  matchId: string;
  playerId: string;
  voterId: string;
  score: number;
}): Promise<MatchRating> {
  const matchId = input.matchId.trim();
  const playerId = input.playerId.trim();
  const voterId = input.voterId.trim();
  const score = clampScore(input.score);
  if (!matchId || !playerId || !voterId) {
    throw new Error("Dati voto incompleti");
  }

  const store = await getRatingsStore();
  const updatedAt = new Date().toISOString();
  const idx = store.ratings.findIndex(
    (r) =>
      r.matchId === matchId &&
      r.playerId === playerId &&
      r.voterId === voterId
  );
  const entry: MatchRating = {
    matchId,
    playerId,
    voterId,
    score,
    updatedAt,
  };
  if (idx >= 0) store.ratings[idx] = entry;
  else store.ratings.push(entry);
  await saveRatingsStore(store);
  return entry;
}

export function summarizeMatchRatings(
  ratings: MatchRating[],
  matchId: string,
  voterId?: string | null
): PlayerRatingSummary[] {
  const byPlayer = new Map<
    string,
    { sum: number; count: number; myScore: number | null }
  >();

  for (const r of ratings) {
    if (r.matchId !== matchId) continue;
    const cur = byPlayer.get(r.playerId) || {
      sum: 0,
      count: 0,
      myScore: null as number | null,
    };
    cur.sum += r.score;
    cur.count += 1;
    if (voterId && r.voterId === voterId) cur.myScore = r.score;
    byPlayer.set(r.playerId, cur);
  }

  return [...byPlayer.entries()].map(([playerId, v]) => ({
    playerId,
    average: v.count ? Math.round((v.sum / v.count) * 10) / 10 : null,
    count: v.count,
    myScore: v.myScore,
  }));
}

export async function getMatchRatingSummaries(
  matchId: string,
  voterId?: string | null
) {
  const store = await getRatingsStore();
  return summarizeMatchRatings(store.ratings, matchId, voterId);
}

export async function getPlayerMatchRating(
  matchId: string,
  playerId: string,
  voterId?: string | null
): Promise<PlayerRatingSummary> {
  const all = await getMatchRatingSummaries(matchId, voterId);
  return (
    all.find((s) => s.playerId === playerId) || {
      playerId,
      average: null,
      count: 0,
      myScore: null,
    }
  );
}
