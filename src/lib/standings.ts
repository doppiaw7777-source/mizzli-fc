import { clubNameKey } from "@/lib/club-teams";
import { getMatchKind } from "./match-kind";
import { leagueStandingRows, looksLikePlaceholderStandings } from "./league-clubs";
import type { Match, StandingRow, Standings, TeamData } from "./types";

export type StandingTiebreaker =
  | "points"
  | "goalDifference"
  | "goalsFor"
  | "headToHead"
  | "name";

export const DEFAULT_TIEBREAKERS: StandingTiebreaker[] = [
  "points",
  "goalDifference",
  "goalsFor",
  "name",
];

export type ResolvedFixture = {
  matchId: string;
  homeKey: string;
  awayKey: string;
  homeName: string;
  awayName: string;
  homeScore: number;
  awayScore: number;
};

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

const SKIP_STATUS = new Set([
  "scheduled",
  "programmata",
  "postponed",
  "rinviata",
  "rinviat",
  "suspended",
  "sospesa",
  "cancelled",
  "canceled",
  "annullata",
]);

const DONE_STATUS = new Set(["finished", "completed", "played", "conclusa", "ft"]);

export function isFinishedMatch(match: Match) {
  const st = String(match.status || "").trim().toLowerCase();
  if (SKIP_STATUS.has(st)) return false;
  if (DONE_STATUS.has(st)) return hasRecordedScore(match);
  return hasRecordedScore(match);
}

export function hasRecordedScore(match: Match) {
  if (isFiniteScore(match.homeScore) && isFiniteScore(match.awayScore)) return true;
  return parseScore(match.result) !== null;
}

function isFiniteScore(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function nameFromId(
  id: string | undefined,
  rows: StandingRow[],
  catalog: { id: string; name: string }[]
) {
  if (!id) return "";
  const row = rows.find((r) => r.id === id);
  if (row?.name) return row.name;
  const team = catalog.find((t) => t.id === id);
  return team?.name || "";
}

export function resolveFixture(
  match: Match,
  teamName: string,
  seedRows: StandingRow[] = [],
  catalog: { id: string; name: string }[] = []
): ResolvedFixture | null {
  if (!isLeagueMatch(match)) return null;
  if (!isFinishedMatch(match)) return null;

  const us = teamName || "MIZZLI FC";
  const namedHome = (match.homeTeam || "").trim() || nameFromId(match.homeTeamId, seedRows, catalog);
  const namedAway = (match.awayTeam || "").trim() || nameFromId(match.awayTeamId, seedRows, catalog);
  const opponent = (match.opponent || "").trim();

  let homeName = namedHome;
  let awayName = namedAway;

  if (!homeName || !awayName) {
    if (!opponent) return null;
    homeName = homeName || (match.isHome ? us : opponent);
    awayName = awayName || (match.isHome ? opponent : us);
  }

  const homeKey = clubKey(homeName);
  const awayKey = clubKey(awayName);
  if (!homeKey || !awayKey || homeKey === awayKey) return null;

  let homeScore: number | null = null;
  let awayScore: number | null = null;

  if (isFiniteScore(match.homeScore) && isFiniteScore(match.awayScore)) {
    homeScore = Math.round(match.homeScore);
    awayScore = Math.round(match.awayScore);
  } else {
    const parsed = parseScore(match.result);
    if (!parsed) return null;
    const involvesUs = homeKey === clubKey(us) || awayKey === clubKey(us);
    if (involvesUs && !namedHome && !namedAway) {
      const [usGoals, themGoals] = parsed;
      if (match.isHome) {
        homeScore = usGoals;
        awayScore = themGoals;
      } else {
        homeScore = themGoals;
        awayScore = usGoals;
      }
    } else {
      homeScore = parsed[0];
      awayScore = parsed[1];
    }
  }

  if (homeScore === null || awayScore === null) return null;

  return {
    matchId: match.id,
    homeKey,
    awayKey,
    homeName,
    awayName,
    homeScore,
    awayScore,
  };
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

function applyFixture(home: StandingRow, away: StandingRow, homeGoals: number, awayGoals: number) {
  home.played += 1;
  away.played += 1;
  home.goalsFor += homeGoals;
  home.goalsAgainst += awayGoals;
  away.goalsFor += awayGoals;
  away.goalsAgainst += homeGoals;
  if (homeGoals > awayGoals) {
    home.won += 1;
    away.lost += 1;
  } else if (homeGoals < awayGoals) {
    away.won += 1;
    home.lost += 1;
  } else {
    home.drawn += 1;
    away.drawn += 1;
  }
}

function headToHeadDelta(
  a: StandingRow,
  b: StandingRow,
  fixtures: ResolvedFixture[]
) {
  const ka = clubKey(a.name);
  const kb = clubKey(b.name);
  let aPts = 0;
  let bPts = 0;
  for (const fix of fixtures) {
    const pair =
      (fix.homeKey === ka && fix.awayKey === kb) || (fix.homeKey === kb && fix.awayKey === ka);
    if (!pair) continue;
    const aHome = fix.homeKey === ka;
    const aGoals = aHome ? fix.homeScore : fix.awayScore;
    const bGoals = aHome ? fix.awayScore : fix.homeScore;
    if (aGoals > bGoals) aPts += 3;
    else if (aGoals < bGoals) bPts += 3;
    else {
      aPts += 1;
      bPts += 1;
    }
  }
  return aPts - bPts;
}

export function sortStandings(
  rows: StandingRow[],
  matches?: Match[],
  teamName?: string,
  tiebreakers: StandingTiebreaker[] = DEFAULT_TIEBREAKERS
) {
  const fixtures =
    matches && teamName
      ? completedFixtures(matches, teamName, rows)
      : ([] as ResolvedFixture[]);
  return [...rows].sort((a, b) => {
    for (const rule of tiebreakers) {
      if (rule === "points") {
        const d = standingPoints(b) - standingPoints(a);
        if (d) return d;
      } else if (rule === "goalDifference") {
        const d = standingGoalDiff(b) - standingGoalDiff(a);
        if (d) return d;
      } else if (rule === "goalsFor") {
        const d = b.goalsFor - a.goalsFor;
        if (d) return d;
      } else if (rule === "headToHead") {
        const d = headToHeadDelta(b, a, fixtures);
        if (d) return d;
      } else if (rule === "name") {
        return a.name.localeCompare(b.name, "it");
      }
    }
    return a.name.localeCompare(b.name, "it");
  });
}

function completedFixtures(
  matches: Match[],
  teamName: string,
  seedRows: StandingRow[] = [],
  catalog: { id: string; name: string }[] = []
) {
  const seen = new Set<string>();
  const out: ResolvedFixture[] = [];
  for (const match of matches || []) {
    if (!match?.id || seen.has(match.id)) continue;
    seen.add(match.id);
    const fix = resolveFixture(match, teamName, seedRows, catalog);
    if (fix) out.push(fix);
  }
  return out;
}

export function calculateStandings(
  teamName: string,
  matches: Match[],
  seedRows: StandingRow[] = [],
  catalog: { id: string; name: string; logoUrl?: string }[] = [],
  logoUrl = "",
  tiebreakers: StandingTiebreaker[] = DEFAULT_TIEBREAKERS,
  excludedKeys: string[] = []
): StandingRow[] {
  const us = teamName || "MIZZLI FC";
  const byKey = new Map<string, StandingRow>();
  const excluded = new Set(
    (excludedKeys || []).map((k) => clubKey(k) || k.toLowerCase()).filter(Boolean)
  );
  const usKey = clubKey(us);

  const ensure = (name: string, isUs = false, id?: string, logo = "") => {
    const key = clubKey(name) || name.toLowerCase();
    if (!key) return null;
    if (!isUs && key !== usKey && excluded.has(key)) return null;
    let row = byKey.get(key);
    if (!row) {
      row = blankRow(id || `st-${key}`, isUs ? us : name, isUs, logo);
      byKey.set(key, row);
    }
    if (isUs) {
      row.isUs = true;
      row.name = us;
      if (logoUrl) row.logoUrl = logoUrl;
    } else if (name && !row.name) {
      row.name = name;
    }
    if (logo && !row.logoUrl) row.logoUrl = logo;
    return row;
  };

  for (const row of seedRows) {
    const trimmed = (row.name || "").trim();
    if (/^allenamento$/i.test(trimmed)) continue;
    if (!trimmed && !row.isUs) continue;
    const rowKey = clubKey(trimmed);
    if (rowKey && rowKey !== usKey && excluded.has(rowKey)) continue;
    const fromCatalog = catalog.find((t) => clubKey(t.name) === clubKey(trimmed));
    ensure(
      trimmed || us,
      row.isUs || clubKey(trimmed) === clubKey(us),
      row.id || fromCatalog?.id,
      row.logoUrl || fromCatalog?.logoUrl || ""
    );
  }
  ensure(us, true, undefined, logoUrl);

  const fixtures = completedFixtures(matches, us, seedRows, catalog);
  for (const fix of fixtures) {
    const home = ensure(fix.homeName, fix.homeKey === clubKey(us));
    const away = ensure(fix.awayName, fix.awayKey === clubKey(us));
    if (!home || !away) continue;
    applyFixture(home, away, fix.homeScore, fix.awayScore);
  }

  return sortStandings([...byKey.values()], matches, us, tiebreakers).map((row) => ({
    ...row,
    isUs: clubKey(row.name) === clubKey(us),
    name: clubKey(row.name) === clubKey(us) ? us : row.name,
    logoUrl:
      clubKey(row.name) === clubKey(us)
        ? logoUrl || row.logoUrl || ""
        : row.logoUrl || catalog.find((t) => clubKey(t.name) === clubKey(row.name))?.logoUrl || "",
  }));
}

const PLACEHOLDER_NAME = new Set([
  "real calcio",
  "united city",
  "asd rivale",
  "fc ospite",
  "virtus nord",
  "atletico sud",
]);

export function syncStandings(data: TeamData): TeamData {
  const teamName = data.settings?.teamName || "MIZZLI FC";
  let prev: Standings = data.standings || {
    title: "Classifica Campionato",
    season: "",
    rows: [],
  };

  if (looksLikePlaceholderStandings(prev.rows)) {
    const cleaned = (prev.rows || []).filter(
      (r) => !PLACEHOLDER_NAME.has((r.name || "").trim().toLowerCase())
    );
    prev = {
      ...prev,
      rows: cleaned.length ? cleaned : leagueStandingRows(teamName),
    };
  } else if (!prev.rows?.length) {
    if (!(prev.excludedKeys && prev.excludedKeys.length)) {
      prev = { ...prev, rows: leagueStandingRows(teamName) };
    }
  }

  const excludedKeys = prev.excludedKeys || [];
  const rows = calculateStandings(
    teamName,
    data.matches || [],
    prev.rows || [],
    data.teams || [],
    data.settings?.logoUrl || "",
    DEFAULT_TIEBREAKERS,
    excludedKeys
  );

  return {
    ...data,
    standings: {
      title: prev.title || "Classifica Campionato",
      season: data.settings?.branding?.seasonLabel || prev.season || "",
      rows,
      excludedKeys,
      live: false,
      manual: false,
    },
  };
}
