import { clubNameKey } from "@/lib/club-teams";
import { dateKey, todayKey } from "@/lib/dates";
import { getMatchKind } from "@/lib/match-kind";
import type { Match, StandingRow, Standings, TeamData } from "@/lib/types";

export function parseScore(result?: string | null): [number, number] | null {
  const m = String(result || "")
    .trim()
    .match(/^(\d{1,2})\s*[-–—:xX]\s*(\d{1,2})$/);
  if (!m) return null;
  return [Number(m[1]), Number(m[2])];
}

export function standingPoints(row: StandingRow) {
  return row.won * 3 + row.drawn;
}

export function standingGoalDiff(row: StandingRow) {
  return row.goalsFor - row.goalsAgainst;
}

export function sortStandings(rows: StandingRow[]) {
  return [...rows].sort((a, b) => {
    const pd = standingPoints(b) - standingPoints(a);
    if (pd !== 0) return pd;
    const gd = standingGoalDiff(b) - standingGoalDiff(a);
    if (gd !== 0) return gd;
    const gf = b.goalsFor - a.goalsFor;
    if (gf !== 0) return gf;
    return a.name.localeCompare(b.name, "it");
  });
}

function clubKey(name: string) {
  return clubNameKey(name);
}

export function isLeagueMatch(match: Match) {
  const kind = getMatchKind(match);
  if (kind === "allenamento" || kind === "amichevole") return false;
  const c = (match.competition || "").toLowerCase();
  if (!c) return true;
  if (/(coppa|amichevol|torneo|supercoppa|friendly)/i.test(c)) return false;
  return true;
}

function blankRow(id: string, name: string, isUs: boolean, logoUrl = ""): StandingRow {
  return {
    id,
    name,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    isUs,
    logoUrl,
  };
}

function openLeagueMatch(data: TeamData) {
  const open = (data.matches || []).filter((m) => isLeagueMatch(m) && !parseScore(m.result));
  if (!open.length) return null;
  const today = todayKey();
  const todayMs = new Date(`${today}T12:00:00`).getTime();
  const onToday = open.filter((m) => dateKey(m.date) === today);
  const pool = onToday.length ? onToday : open;
  return [...pool].sort((a, b) => {
    const da = dateKey(a.date) || today;
    const db = dateKey(b.date) || today;
    return (
      Math.abs(new Date(`${da}T12:00:00`).getTime() - todayMs) -
      Math.abs(new Date(`${db}T12:00:00`).getTime() - todayMs)
    );
  })[0];
}

function applyGame(us: StandingRow, them: StandingRow, usGoals: number, themGoals: number) {
  us.played += 1;
  them.played += 1;
  us.goalsFor += usGoals;
  us.goalsAgainst += themGoals;
  them.goalsFor += themGoals;
  them.goalsAgainst += usGoals;
  if (usGoals > themGoals) {
    us.won += 1;
    them.lost += 1;
  } else if (usGoals < themGoals) {
    us.lost += 1;
    them.won += 1;
  } else {
    us.drawn += 1;
    them.drawn += 1;
  }
}

export function syncStandings(data: TeamData): TeamData {
  const teamName = data.settings?.teamName || "MIZZLI FC";
  const prev: Standings = data.standings || {
    title: "Classifica Campionato",
    season: "",
    rows: [],
  };
  const byKey = new Map<string, StandingRow>();

  const ensure = (name: string, isUs = false) => {
    const key = clubKey(name) || name.toLowerCase();
    let row = byKey.get(key);
    if (!row) {
      const old = prev.rows.find((r) => clubKey(r.name) === key);
      const fromCatalog = (data.teams || []).find((t) => clubKey(t.name) === key);
      row = blankRow(
        old?.id || `st-${key || "x"}`,
        isUs ? teamName : old?.name || name,
        isUs,
        old?.logoUrl || fromCatalog?.logoUrl || ""
      );
      byKey.set(key, row);
    }
    if (isUs) {
      row.isUs = true;
      row.name = teamName;
      row.logoUrl = data.settings?.logoUrl || row.logoUrl;
    }
    return row;
  };

  for (const row of prev.rows) {
    const trimmed = (row.name || "").trim();
    if (/^allenamento$/i.test(trimmed)) continue;
    if (!trimmed && !row.isUs) {
      const key = `new:${row.id || Math.random().toString(36).slice(2)}`;
      byKey.set(key, blankRow(row.id || key, "", false, row.logoUrl || ""));
      continue;
    }
    ensure(trimmed || teamName, row.isUs);
  }
  ensure(teamName, true);

  const usRow = ensure(teamName, true);

  for (const match of data.matches || []) {
    if (!isLeagueMatch(match)) continue;
    const score = parseScore(match.result);
    if (!score || !match.opponent.trim()) continue;
    applyGame(usRow, ensure(match.opponent), score[0], score[1]);
  }

  let live = false;
  const info = data.club?.info;
  if (info && (info.liveStatus === "live" || info.liveStatus === "ht")) {
    const score = parseScore(info.liveScore);
    const match = openLeagueMatch(data);
    if (score && match?.opponent.trim()) {
      applyGame(usRow, ensure(match.opponent), score[0], score[1]);
      live = true;
    }
  }

  const rows = sortStandings(
    [...byKey.values()].map((row) => {
      const ours = clubKey(row.name) === clubKey(teamName);
      const fromCatalog = (data.teams || []).find((t) => clubKey(t.name) === clubKey(row.name));
      return {
        ...row,
        isUs: ours,
        name: ours ? teamName : row.name,
        logoUrl: ours
          ? data.settings?.logoUrl || row.logoUrl || fromCatalog?.logoUrl || ""
          : row.logoUrl || fromCatalog?.logoUrl || "",
      };
    })
  );

  return {
    ...data,
    standings: {
      title: prev.title || "Classifica Campionato",
      season: prev.season || "",
      rows,
      live,
    },
  };
}
