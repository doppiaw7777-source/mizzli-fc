import type {
  Match,
  MatchEvent,
  MatchEventTeam,
  MatchEventType,
  MatchLive,
  MatchLivesStore,
  Player,
  TeamData,
} from "./types";
import { parseScore } from "./standings";
import { getMatchKind } from "./match-kind";

export const SCORING_TYPES: MatchEventType[] = ["goal", "penalty", "own_goal"];

export const EVENT_LABELS: Record<MatchEventType, string> = {
  kickoff: "Inizio",
  period: "Periodo",
  goal: "Gol",
  own_goal: "Autogol",
  penalty: "Rigore",
  yellow: "Giallo",
  red: "Rosso",
  sub: "Cambio",
  var: "VAR",
  note: "Nota",
};

export function emptyMatchLive(matchId: string, now = new Date()): MatchLive {
  const updatedAt = now.toISOString();
  return {
    matchId,
    status: "idle",
    scoreUs: 0,
    scoreOpp: 0,
    minute: 0,
    extra: 0,
    events: [],
    clockBaseMinute: 0,
    clockStartedAt: null,
    updatedAt,
  };
}

export function emptyMatchLivesStore(): MatchLivesStore {
  return { activeMatchId: "", lives: [] };
}

export function clampMinute(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(120, Math.max(0, Math.round(value)));
}

export function liveClockMinute(live: MatchLive, now = Date.now()) {
  let total = live.minute || 0;
  if (live.status === "live" && live.clockStartedAt) {
    const started = Date.parse(live.clockStartedAt);
    if (!Number.isNaN(started)) {
      const elapsed = Math.floor((now - started) / 60000);
      total = (live.clockBaseMinute || 0) + Math.max(0, elapsed);
    }
  }
  total = clampMinute(total);
  if (total > 90) {
    return { minute: 90, extra: total - 90, total };
  }
  return { minute: total, extra: live.extra && total >= 45 ? live.extra : 0, total };
}

export function formatMinuteLabel(live: MatchLive, now = Date.now()) {
  const clock = liveClockMinute(live, now);
  if (live.status === "ht") return "Int.";
  if (live.status === "ft") return "90'";
  if (clock.minute === 90 && clock.extra > 0) return `90+${clock.extra}'`;
  if (clock.extra > 0 && clock.minute >= 45 && clock.total <= 50) {
    return `45+${clock.extra}'`;
  }
  return `${clock.total}'`;
}

export function formatLiveStatus(status: MatchLive["status"]) {
  if (status === "live") return "IN CORSO";
  if (status === "ht") return "INTERVALLO";
  if (status === "ft") return "FINITA";
  return "IN ATTESA";
}

export function scoreFromEvents(events: MatchEvent[]) {
  let us = 0;
  let opp = 0;
  for (const event of events) {
    if (event.type === "goal" || event.type === "penalty") {
      if (event.team === "us") us += 1;
      else opp += 1;
    } else if (event.type === "own_goal") {
      if (event.team === "us") opp += 1;
      else us += 1;
    }
  }
  return { us, opp };
}

export function resolvedScore(live: MatchLive) {
  const hasScoring = live.events.some((event) => SCORING_TYPES.includes(event.type));
  if (hasScoring) return scoreFromEvents(live.events);
  return { us: live.scoreUs || 0, opp: live.scoreOpp || 0 };
}

/** Scoreboard string in home–away order. Club liveScore stays us–opp. */
export function boardScore(live: MatchLive, isHome: boolean) {
  const { us, opp } = resolvedScore(live);
  return isHome ? `${us}–${opp}` : `${opp}–${us}`;
}

export function clubScore(live: MatchLive) {
  const { us, opp } = resolvedScore(live);
  return `${us}-${opp}`;
}

export function findMatchLive(store: MatchLivesStore, matchId: string) {
  return store.lives.find((live) => live.matchId === matchId) || null;
}

export function activeMatchLive(store: MatchLivesStore) {
  if (!store.activeMatchId) return null;
  const named = findMatchLive(store, store.activeMatchId);
  if (named && named.status !== "idle") return named;
  return null;
}

export function liveForMatch(data: TeamData, matchId: string) {
  return (data.club.matchLives || []).find((live) => live.matchId === matchId) || null;
}

export function isLiveActive(live?: MatchLive | null) {
  return !!live && (live.status === "live" || live.status === "ht");
}

export function playerName(players: Player[], id?: string) {
  if (!id) return "";
  return players.find((p) => p.id === id)?.name || "";
}

export function eventIcon(type: MatchEventType) {
  switch (type) {
    case "goal":
    case "penalty":
      return "⚽";
    case "own_goal":
      return "⚪";
    case "yellow":
      return "🟨";
    case "red":
      return "🟥";
    case "sub":
      return "🔁";
    case "kickoff":
      return "▶️";
    case "period":
      return "⏱";
    case "var":
      return "📺";
    default:
      return "📝";
  }
}

export function buildEventText(
  event: Pick<
    MatchEvent,
    | "type"
    | "team"
    | "playerId"
    | "assistId"
    | "playerOutId"
    | "playerInId"
    | "oppName"
    | "text"
  >,
  players: Player[],
  opponent: string
): string {
  if (event.text?.trim()) return event.text.trim();
  const ours = (id?: string) => playerName(players, id);
  const other = event.oppName?.trim() || opponent || "Avversario";

  switch (event.type) {
    case "kickoff":
      return "Calcio d'inizio";
    case "period":
      return "Cambio periodo";
    case "goal":
      if (event.team === "us") {
        const scorer = ours(event.playerId) || "Gol MIZZLI";
        return event.assistId ? `${scorer} (assist ${ours(event.assistId)})` : scorer;
      }
      return other;
    case "penalty":
      return event.team === "us"
        ? `Rigore ${ours(event.playerId) || "MIZZLI"}`
        : `Rigore ${other}`;
    case "own_goal":
      return event.team === "us"
        ? `Autogol ${ours(event.playerId) || "MIZZLI"}`
        : `Autogol ${other}`;
    case "yellow":
      return event.team === "us"
        ? `Giallo ${ours(event.playerId) || "MIZZLI"}`
        : `Giallo ${other}`;
    case "red":
      return event.team === "us"
        ? `Rosso ${ours(event.playerId) || "MIZZLI"}`
        : `Rosso ${other}`;
    case "sub":
      if (event.team === "us") {
        const out = ours(event.playerOutId);
        const inn = ours(event.playerInId);
        if (out && inn) return `${inn} per ${out}`;
        return inn || out || "Sostituzione";
      }
      return `Cambio ${other}`;
    case "var":
      return "Controllo VAR";
    default:
      return "Aggiornamento";
  }
}

export function stampEvent(
  live: MatchLive,
  partial: Omit<MatchEvent, "id" | "createdAt" | "matchId" | "text"> & {
    id?: string;
    text?: string;
    createdAt?: string;
  },
  players: Player[],
  opponent: string,
  now = new Date()
): MatchEvent {
  const clock = liveClockMinute(live, now.getTime());
  const minute = clampMinute(partial.minute ?? clock.total);
  const event: MatchEvent = {
    id: partial.id || "",
    matchId: live.matchId,
    minute,
    extra: partial.extra,
    type: partial.type,
    team: partial.team,
    playerId: partial.playerId || "",
    assistId: partial.assistId || "",
    playerOutId: partial.playerOutId || "",
    playerInId: partial.playerInId || "",
    oppName: partial.oppName || "",
    text: "",
    createdAt: partial.createdAt || now.toISOString(),
    statsApplied: false,
  };
  event.text = buildEventText({ ...event, text: partial.text || "" }, players, opponent);
  return event;
}

export function withScore(live: MatchLive): MatchLive {
  const score = resolvedScore(live);
  return { ...live, scoreUs: score.us, scoreOpp: score.opp };
}

export function appendEvent(live: MatchLive, event: MatchEvent, now = new Date()): MatchLive {
  const events = [...live.events, event];
  return withScore({
    ...live,
    events,
    minute: event.minute,
    extra: event.extra,
    updatedAt: now.toISOString(),
  });
}

export function removeEventById(live: MatchLive, eventId: string, now = new Date()): MatchLive {
  const events = live.events.filter((event) => event.id !== eventId);
  const last = events[events.length - 1];
  return withScore({
    ...live,
    events,
    minute: last?.minute ?? live.minute,
    extra: last?.extra ?? live.extra,
    updatedAt: now.toISOString(),
  });
}

export type StatPatch = {
  playerId: string;
  goals?: number;
  assists?: number;
  yellow?: number;
  red?: number;
};

export function eventStatPatches(event: MatchEvent): StatPatch[] {
  if (event.team !== "us") return [];
  const patches: StatPatch[] = [];
  if ((event.type === "goal" || event.type === "penalty") && event.playerId) {
    patches.push({ playerId: event.playerId, goals: 1 });
  }
  if (event.type === "goal" && event.assistId) {
    patches.push({ playerId: event.assistId, assists: 1 });
  }
  if (event.type === "yellow" && event.playerId) {
    patches.push({ playerId: event.playerId, yellow: 1 });
  }
  if (event.type === "red" && event.playerId) {
    patches.push({ playerId: event.playerId, red: 1 });
  }
  return patches;
}

export function applyStatPatches(players: Player[], patches: StatPatch[], direction: 1 | -1): Player[] {
  if (!patches.length) return players;
  const byId = new Map<string, StatPatch>();
  for (const patch of patches) {
    const cur = byId.get(patch.playerId) || { playerId: patch.playerId };
    cur.goals = (cur.goals || 0) + (patch.goals || 0);
    cur.assists = (cur.assists || 0) + (patch.assists || 0);
    cur.yellow = (cur.yellow || 0) + (patch.yellow || 0);
    cur.red = (cur.red || 0) + (patch.red || 0);
    byId.set(patch.playerId, cur);
  }
  return players.map((player) => {
    const patch = byId.get(player.id);
    if (!patch) return player;
    const goals = Math.max(0, (player.stats?.goals || 0) + direction * (patch.goals || 0));
    const assists = Math.max(0, (player.stats?.assists || 0) + direction * (patch.assists || 0));
    const yellowCards = Math.max(0, (player.yellowCards || 0) + direction * (patch.yellow || 0));
    const redCards = Math.max(0, (player.redCards || 0) + direction * (patch.red || 0));
    return {
      ...player,
      yellowCards,
      redCards,
      stats: {
        ...player.stats,
        goals,
        assists,
      },
    };
  });
}

export function applyEventToPlayers(players: Player[], event: MatchEvent, direction: 1 | -1) {
  return applyStatPatches(players, eventStatPatches(event), direction);
}

export function ensureEventIds(live: MatchLive, makeId: () => string): MatchLive {
  let changed = false;
  const events = live.events.map((event) => {
    if (event.id) return event;
    changed = true;
    return { ...event, id: makeId() };
  });
  return changed ? { ...live, events } : live;
}

export function applyPendingStats(players: Player[], live: MatchLive) {
  let nextPlayers = players;
  const events = live.events.map((event) => {
    if (event.statsApplied) return event;
    nextPlayers = applyEventToPlayers(nextPlayers, event, 1);
    return { ...event, statsApplied: true };
  });
  return { players: nextPlayers, live: { ...live, events } };
}

export function revertEventStats(players: Player[], event: MatchEvent) {
  if (!event.statsApplied) return players;
  return applyEventToPlayers(players, event, -1);
}

export function setLiveClock(live: MatchLive, minute: number, running: boolean, now = new Date()): MatchLive {
  const total = clampMinute(minute);
  return {
    ...live,
    minute: total,
    clockBaseMinute: total,
    clockStartedAt: running ? now.toISOString() : null,
    extra: total > 90 ? total - 90 : 0,
    updatedAt: now.toISOString(),
  };
}

export function setLiveStatus(
  live: MatchLive,
  status: MatchLive["status"],
  players: Player[],
  opponent: string,
  now = new Date()
): MatchLive {
  let next = { ...live, status, updatedAt: now.toISOString() };
  if (status === "live") {
    const resumeAt = Math.max(live.minute || 0, live.status === "ht" ? 45 : 0);
    next = setLiveClock(next, resumeAt, true, now);
    if (live.status === "idle") {
      const kickoff = stampEvent(
        next,
        { type: "kickoff", team: "us", minute: 0 },
        players,
        opponent,
        now
      );
      next = appendEvent({ ...next, minute: 0, clockBaseMinute: 0 }, kickoff, now);
      next = setLiveClock(next, 0, true, now);
    } else if (live.status === "ht") {
      const period = stampEvent(
        next,
        { type: "period", team: "us", minute: 45, text: "Inizio secondo tempo" },
        players,
        opponent,
        now
      );
      next = appendEvent(next, period, now);
    }
  } else if (status === "ht") {
    next = setLiveClock(next, Math.max(live.minute || 45, 45), false, now);
    const period = stampEvent(
      next,
      { type: "period", team: "us", minute: next.minute, text: "Fine primo tempo" },
      players,
      opponent,
      now
    );
    next = appendEvent(next, period, now);
  } else if (status === "ft") {
    next = setLiveClock(next, Math.max(live.minute || 90, 90), false, now);
    const period = stampEvent(
      next,
      { type: "period", team: "us", minute: 90, text: "Fine partita" },
      players,
      opponent,
      now
    );
    next = appendEvent(next, period, now);
  } else {
    next = setLiveClock(next, live.minute, false, now);
  }
  return withScore(next);
}

export function upsertLive(store: MatchLivesStore, live: MatchLive): MatchLivesStore {
  const rest = store.lives.filter((item) => item.matchId !== live.matchId);
  return { ...store, lives: [...rest, live] };
}

export function demoteOtherLives(store: MatchLivesStore, matchId: string, now = new Date()): MatchLivesStore {
  return {
    ...store,
    lives: store.lives.map((live) => {
      if (live.matchId === matchId) return live;
      if (live.status === "live" || live.status === "ht") {
        return { ...live, status: "idle" as const, clockStartedAt: null, updatedAt: now.toISOString() };
      }
      return live;
    }),
  };
}

export function overlayLiveOnTeam(data: TeamData, store: MatchLivesStore): TeamData {
  const info = { ...data.club.info };
  const active = activeMatchLive(store);
  if (active && active.status !== "idle") {
    const clock = liveClockMinute(active);
    info.liveStatus = active.status;
    info.liveScore = clubScore(active);
    info.liveMinute =
      clock.minute === 90 && clock.extra > 0 ? `90+${clock.extra}` : String(clock.total);
    info.liveMatchId = active.matchId;
  } else {
    info.liveStatus = "idle";
    info.liveScore = "";
    info.liveMinute = "";
    info.liveMatchId = "";
  }
  return {
    ...data,
    club: {
      ...data.club,
      info,
      matchLives: store.lives,
    },
  };
}

export function stripMatchLives(data: TeamData): TeamData {
  const club = { ...data.club };
  delete club.matchLives;
  return { ...data, club };
}

export function applyMatchResult(data: TeamData, live: MatchLive): TeamData {
  if (live.status !== "ft") return data;
  const result = clubScore(live);
  return {
    ...data,
    matches: data.matches.map((match) =>
      match.id === live.matchId ? { ...match, result } : match
    ),
  };
}

export function mergePlayerLiveStats(draftPlayers: Player[], serverPlayers: Player[]): Player[] {
  const liveById = new Map(serverPlayers.map((p) => [p.id, p]));
  return draftPlayers.map((player) => {
    const live = liveById.get(player.id);
    if (!live) return player;
    return {
      ...player,
      stats: live.stats,
      yellowCards: live.yellowCards,
      redCards: live.redCards,
    };
  });
}

export function suggestedLiveMatch(data: TeamData): Match | undefined {
  const activeId = data.club.info.liveMatchId;
  if (activeId) {
    const current = data.matches.find((m) => m.id === activeId);
    if (current) return current;
  }
  const todayish = [...data.matches]
    .filter((m) => getMatchKind(m) === "partita")
    .sort((a, b) => a.date.localeCompare(b.date));
  const open = todayish.find((m) => !m.result);
  return open || todayish[todayish.length - 1];
}

export function parseClubScore(score: string): { us: number; opp: number } | null {
  const parsed = parseScore(score);
  if (!parsed) return null;
  return { us: parsed[0], opp: parsed[1] };
}

export function scoringEvents(live: MatchLive, team: MatchEventTeam) {
  return live.events.filter((event) => {
    if (!SCORING_TYPES.includes(event.type)) return false;
    if (event.type === "own_goal") return event.team !== team;
    return event.team === team;
  });
}

export function periodLabel(live: MatchLive) {
  if (live.status === "ht") return "Intervallo";
  if (live.status === "ft") return "Fine gara";
  if ((live.minute || 0) >= 45 || (live.clockBaseMinute || 0) >= 45) return "2° tempo";
  return "1° tempo";
}
