import { randomUUID } from "crypto";
import type { MatchEventTeam, MatchEventType, MatchLivesStore, TeamData } from "./types";
import {
  appendEvent,
  applyMatchResult,
  applyPendingStats,
  clampMinute,
  demoteOtherLives,
  emptyMatchLive,
  ensureEventIds,
  findMatchLive,
  liveClockMinute,
  overlayLiveOnTeam,
  removeEventById,
  revertEventStats,
  setLiveClock,
  setLiveStatus,
  stampEvent,
  upsertLive,
  withScore,
} from "./match-live";

export type LiveCommand =
  | { action: "start"; matchId: string }
  | { action: "status"; matchId: string; status: "live" | "ht" | "ft" }
  | { action: "minute"; matchId: string; minute: number }
  | {
      action: "event";
      matchId: string;
      event: {
        type: MatchEventType;
        team?: MatchEventTeam;
        playerId?: string;
        assistId?: string;
        playerOutId?: string;
        playerInId?: string;
        oppName?: string;
        text?: string;
        minute?: number;
      };
    }
  | { action: "undo"; matchId: string }
  | { action: "removeEvent"; matchId: string; eventId: string }
  | { action: "close"; matchId: string }
  | { action: "import"; lives?: MatchLivesStore["lives"]; activeMatchId?: string };

function newId() {
  return randomUUID();
}

function matchOpponent(data: TeamData, matchId: string) {
  return data.matches.find((match) => match.id === matchId)?.opponent || "Avversario";
}

function liveOrCreate(store: MatchLivesStore, matchId: string) {
  return findMatchLive(store, matchId) || emptyMatchLive(matchId);
}

function commit(
  data: TeamData,
  store: MatchLivesStore,
  live: ReturnType<typeof emptyMatchLive>,
  active: boolean
) {
  const withIds = ensureEventIds(live, newId);
  const applied = applyPendingStats(data.players, withIds);
  let nextStore = upsertLive(store, applied.live);
  if (active) {
    nextStore = demoteOtherLives(nextStore, live.matchId);
    nextStore = { ...nextStore, activeMatchId: live.matchId };
  }
  let nextTeam: TeamData = {
    ...data,
    players: applied.players,
  };
  nextTeam = applyMatchResult(nextTeam, applied.live);
  nextTeam = overlayLiveOnTeam(nextTeam, nextStore);
  return { team: nextTeam, store: nextStore, live: applied.live };
}

export function applyLiveCommand(
  data: TeamData,
  store: MatchLivesStore,
  command: LiveCommand
): { team: TeamData; store: MatchLivesStore; live: ReturnType<typeof emptyMatchLive> | null } {
  if (command.action === "import") {
    const nextStore: MatchLivesStore = {
      activeMatchId: command.activeMatchId ?? store.activeMatchId,
      lives: command.lives ?? store.lives,
    };
    return {
      team: overlayLiveOnTeam(data, nextStore),
      store: nextStore,
      live: null,
    };
  }

  const matchId = command.matchId?.trim();
  if (!matchId) throw new Error("Partita obbligatoria");
  const match = data.matches.find((item) => item.id === matchId);
  if (!match) throw new Error("Partita non trovata");
  const opponent = matchOpponent(data, matchId);
  const now = new Date();

  if (command.action === "start") {
    let live = liveOrCreate(store, matchId);
    if (live.status === "live") {
      return commit(data, store, live, true);
    }
    if (live.status === "ht") {
      live = setLiveStatus(live, "live", data.players, opponent, now);
    } else if (live.status === "ft") {
      live = setLiveClock({ ...live, status: "live" }, live.minute || 90, true, now);
    } else {
      live = setLiveStatus(live, "live", data.players, opponent, now);
    }
    return commit(data, store, live, true);
  }

  if (command.action === "status") {
    const current = liveOrCreate(store, matchId);
    if (current.status === command.status) {
      return commit(data, store, current, true);
    }
    const live = setLiveStatus(current, command.status, data.players, opponent, now);
    return commit(data, store, live, true);
  }

  if (command.action === "minute") {
    const current = liveOrCreate(store, matchId);
    const live = setLiveClock(current, clampMinute(command.minute), current.status === "live", now);
    return commit(data, store, live, current.status === "live" || current.status === "ht" || current.status === "ft");
  }

  if (command.action === "event") {
    const current = liveOrCreate(store, matchId);
    const partial = command.event;
    const event = stampEvent(
      current,
      {
        type: partial.type,
        team: partial.team || "us",
        playerId: partial.playerId,
        assistId: partial.assistId,
        playerOutId: partial.playerOutId,
        playerInId: partial.playerInId,
        oppName: partial.oppName,
        text: partial.text,
        minute: partial.minute ?? liveClockMinute(current).total,
      },
      data.players,
      opponent,
      now
    );
    event.id = newId();
    let live = appendEvent(current, event, now);
    if (current.status === "idle") {
      live = { ...live, status: "live" };
      live = setLiveClock(live, event.minute, true, now);
    }
    return commit(data, store, live, true);
  }

  if (command.action === "undo") {
    const current = liveOrCreate(store, matchId);
    const last = current.events[current.events.length - 1];
    if (!last) return { team: overlayLiveOnTeam(data, store), store, live: current };
    const players = revertEventStats(data.players, last);
    const live = removeEventById(current, last.id, now);
    return commit({ ...data, players }, store, live, true);
  }

  if (command.action === "removeEvent") {
    const current = liveOrCreate(store, matchId);
    const event = current.events.find((item) => item.id === command.eventId);
    if (!event) throw new Error("Evento non trovato");
    const players = revertEventStats(data.players, event);
    const live = removeEventById(current, event.id, now);
    return commit({ ...data, players }, store, live, true);
  }

  if (command.action === "close") {
    const current = liveOrCreate(store, matchId);
    const live = withScore({
      ...current,
      status: current.status === "ft" ? "ft" : "idle",
      clockStartedAt: null,
      updatedAt: now.toISOString(),
    });
    const nextStore: MatchLivesStore = {
      ...upsertLive(store, live),
      activeMatchId: store.activeMatchId === matchId ? "" : store.activeMatchId,
    };
    return {
      team: overlayLiveOnTeam(applyMatchResult(data, live), nextStore),
      store: nextStore,
      live,
    };
  }

  throw new Error("Azione live non valida");
}

export function describeCommand(command: LiveCommand) {
  switch (command.action) {
    case "start":
      return "Diretta avviata";
    case "status":
      if (command.status === "ht") return "Intervallo";
      if (command.status === "ft") return "Fine partita";
      return "Diretta in corso";
    case "minute":
      return `Minuto ${command.minute}`;
    case "event":
      return "Evento pubblicato";
    case "undo":
      return "Ultimo evento annullato";
    case "removeEvent":
      return "Evento rimosso";
    case "close":
      return "Diretta chiusa";
    case "import":
      return "Live importata";
    default:
      return "Live aggiornata";
  }
}
