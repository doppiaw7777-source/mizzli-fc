import assert from "node:assert/strict";
import {
  appendEvent,
  applyPendingStats,
  boardScore,
  clubScore,
  emptyMatchLive,
  eventStatPatches,
  removeEventById,
  revertEventStats,
  scoreFromEvents,
  setLiveStatus,
  stampEvent,
} from "../src/lib/match-live";
import type { Player } from "../src/lib/types";

const players: Player[] = [
  {
    id: "p1",
    name: "Marco Rossi",
    number: 9,
    position: "Punta",
    role: "ATT",
    birthDate: "1999-01-01",
    nationality: "Italia",
    photoUrl: "",
    yellowCards: 0,
    redCards: 0,
    stats: { goals: 4, assists: 1, appearances: 10 },
  },
  {
    id: "p2",
    name: "Luca Bianchi",
    number: 10,
    position: "Trequartista",
    role: "CEN",
    birthDate: "2000-01-01",
    nationality: "Italia",
    photoUrl: "",
    yellowCards: 2,
    redCards: 0,
    stats: { goals: 2, assists: 5, appearances: 10 },
  },
];

let live = emptyMatchLive("m1", new Date("2026-08-26T18:00:00"));
live = setLiveStatus(live, "live", players, "ASD Rivale", new Date("2026-08-26T18:00:00"));
assert.equal(live.status, "live");
assert.equal(live.events[0].type, "kickoff");

const goal = stampEvent(
  live,
  { type: "goal", team: "us", playerId: "p1", assistId: "p2", minute: 12 },
  players,
  "ASD Rivale",
  new Date("2026-08-26T18:12:00")
);
goal.id = "e-goal";
live = appendEvent(live, goal);
assert.deepEqual(scoreFromEvents(live.events), { us: 1, opp: 0 });
assert.equal(clubScore(live), "1-0");
assert.equal(boardScore({ ...live, scoreUs: 1, scoreOpp: 0 }, false), "0–1");

const og = stampEvent(
  live,
  { type: "own_goal", team: "us", playerId: "p1", minute: 30 },
  players,
  "ASD Rivale"
);
og.id = "e-og";
live = appendEvent(live, og);
assert.deepEqual(scoreFromEvents(live.events), { us: 1, opp: 1 });

const applied = applyPendingStats(players, live);
assert.equal(applied.players.find((p: Player) => p.id === "p1")?.stats.goals, 5);
assert.equal(applied.players.find((p: Player) => p.id === "p2")?.stats.assists, 6);
assert.ok(applied.live.events.find((e) => e.id === "e-goal")?.statsApplied);

const reverted = revertEventStats(applied.players, applied.live.events.find((e) => e.id === "e-goal")!);
assert.equal(reverted.find((p: Player) => p.id === "p1")?.stats.goals, 4);
assert.equal(reverted.find((p: Player) => p.id === "p2")?.stats.assists, 5);

const withoutGoal = removeEventById(applied.live, "e-goal");
assert.deepEqual(scoreFromEvents(withoutGoal.events), { us: 0, opp: 1 });

assert.deepEqual(eventStatPatches({ ...goal, team: "opp" }), []);

console.log("match-live checks ok");
