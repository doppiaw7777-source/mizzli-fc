import type { StandingRow } from "./types";

export const LEAGUE_CLUB_NAMES = [
  "PHOENIX Autofficina Riotti",
  "MIZZLI FC",
  "GS 2 Settembre 1971",
  "ZENER SO.RA.ME.",
  "GS Ospedale San Martino",
  "Real Quezzi",
  "Amatori Genova Per Torre",
  "Xeneizes",
  "Quizena",
] as const;

const PLACEHOLDER = new Set([
  "real calcio",
  "united city",
  "asd rivale",
  "fc ospite",
  "virtus nord",
  "atletico sud",
]);

export function looksLikePlaceholderStandings(rows: StandingRow[] | undefined) {
  const names = (rows || []).map((r) => (r.name || "").trim().toLowerCase());
  return names.some((n) => PLACEHOLDER.has(n));
}

export function leagueStandingRows(teamName = "MIZZLI FC"): StandingRow[] {
  return LEAGUE_CLUB_NAMES.map((name, i) => {
    const ours = name.toLowerCase() === "mizzli fc" || name === teamName;
    return {
      id: `st-league-${i + 1}`,
      name: ours ? teamName : name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      isUs: ours,
      logoUrl: "",
    };
  });
}
