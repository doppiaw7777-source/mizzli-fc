import type { Match, MatchKind } from "./types";
import { todayKey } from "./dates";

export type { MatchKind };

export const MATCH_KINDS: MatchKind[] = ["partita", "allenamento", "amichevole"];

export const MATCH_KIND_META: Record<
  MatchKind,
  { title: string; desc: string; color: string; competition: string }
> = {
  partita: {
    title: "Partita",
    desc: "Campionato o coppa: avversario, casa/trasferta, risultato e tutti i dettagli.",
    color: "#3b82f6",
    competition: "Campionato",
  },
  allenamento: {
    title: "Allenamento",
    desc: "Sessione in calendario: data, orario e campo.",
    color: "#22c55e",
    competition: "Allenamento",
  },
  amichevole: {
    title: "Amichevole",
    desc: "Data, orario, campo e avversario a scrittura libera.",
    color: "#f97316",
    competition: "Amichevole",
  },
};

export function isMatchKind(value: unknown): value is MatchKind {
  return value === "partita" || value === "allenamento" || value === "amichevole";
}

export function inferMatchKind(
  m: Pick<Match, "kind" | "competition" | "opponent">
): MatchKind {
  if (isMatchKind(m.kind)) return m.kind;
  const blob = `${m.competition || ""} ${m.opponent || ""}`.toLowerCase();
  if (/allenament/.test(blob)) return "allenamento";
  if (/amichevol|friendly/.test(blob)) return "amichevole";
  return "partita";
}

export function getMatchKind(m: Match): MatchKind {
  return inferMatchKind(m);
}

export function isLeagueFixture(m: Match): boolean {
  return getMatchKind(m) === "partita";
}

export function isCalendarSession(m: Match): boolean {
  return getMatchKind(m) === "allenamento";
}

/** Allenamento, or amichevole without a named opponent yet. */
export function isSimpleCalendarEvent(m: Match): boolean {
  if (isCalendarSession(m)) return true;
  return getMatchKind(m) === "amichevole" && !friendlyOpponent(m);
}

export function friendlyOpponent(m: Match): string {
  if (getMatchKind(m) !== "amichevole") return (m.opponent || "").trim();
  const name = (m.opponent || "").trim();
  if (!name || /^amichevole$/i.test(name) || /^allenamento$/i.test(name)) return "";
  return name;
}

export function matchPublicTitle(m: Match): string {
  const k = getMatchKind(m);
  if (k === "allenamento") return "Allenamento";
  if (k === "amichevole") {
    const opp = friendlyOpponent(m);
    return opp ? `Amichevole vs ${opp}` : "Amichevole";
  }
  return (m.opponent || "").trim() || "Partita";
}

export function matchPageTitle(m: Match, teamName: string): string {
  const k = getMatchKind(m);
  if (k === "allenamento") return "Allenamento";
  const us = teamName || "Noi";
  const opp =
    k === "amichevole" ? friendlyOpponent(m) : (m.opponent || "").trim() || "Avversario";
  if (k === "amichevole" && !opp) return "Amichevole";
  return m.isHome ? `${us} vs ${opp}` : `${opp} vs ${us}`;
}

export function matchPublicDetail(m: Match): string {
  const k = getMatchKind(m);
  if (k === "allenamento") {
    return [m.time, m.location].filter(Boolean).join(" · ");
  }
  if (k === "amichevole") {
    return [friendlyOpponent(m), m.time, m.location].filter(Boolean).join(" · ");
  }
  return `${m.competition || "Campionato"}${m.isHome ? " · Casa" : " · Trasferta"}`;
}

export function matchShareText(m: Match, teamName: string): { title: string; body: string } {
  const when = [m.date, m.time].filter(Boolean).join(" ore ");
  const where = m.location ? ` a ${m.location}` : "";
  if (getMatchKind(m) === "allenamento") {
    return { title: "Allenamento", body: `Allenamento — ${when}${where}` };
  }
  const title = matchPageTitle(m, teamName);
  const label = getMatchKind(m) === "amichevole" ? "Amichevole" : `Partita ${m.competition || ""}`;
  return {
    title,
    body: `${label}: ${title} — ${when}${where}`.trim(),
  };
}

export function applyMatchKind(m: Match, kind: MatchKind): Match {
  const meta = MATCH_KIND_META[kind];
  const prev = inferMatchKind(m);
  const color = prev === kind && m.color ? m.color : meta.color;

  if (kind === "amichevole") {
    const keepOpp = (m.opponent || "").trim();
    return {
      ...m,
      kind,
      competition: meta.competition,
      opponent: /^allenamento$/i.test(keepOpp) ? "" : keepOpp,
      isHome: true,
      result: "",
      note: "",
      referee: "",
      tv: "",
      weather: "",
      preview: "",
      report: "",
      attendance: "",
      ticketUrl: "",
      motmId: "",
      priority: "media",
      color,
    };
  }

  if (kind === "allenamento") {
    return {
      ...m,
      kind,
      competition: meta.competition,
      opponent: "Allenamento",
      isHome: true,
      result: "",
      referee: "",
      tv: "",
      weather: "",
      preview: "",
      report: "",
      attendance: "",
      ticketUrl: "",
      motmId: "",
      color,
    };
  }

  const keepCompetition =
    prev === "partita" &&
    m.competition &&
    m.competition !== "Allenamento" &&
    m.competition !== "Amichevole";

  return {
    ...m,
    kind,
    competition: keepCompetition ? m.competition : meta.competition,
    opponent: m.opponent === "Allenamento" ? "" : m.opponent,
    color,
  };
}

export function createMatch(kind: MatchKind): Match {
  const meta = MATCH_KIND_META[kind];
  return applyMatchKind(
    {
      id: `m${Date.now()}-${kind.slice(0, 3)}`,
      date: todayKey(),
      time: kind === "allenamento" ? "19:00" : kind === "amichevole" ? "18:00" : "15:00",
      opponent: "",
      location: "",
      isHome: true,
      competition: meta.competition,
      result: "",
      note: "",
      priority: "media",
      color: meta.color,
      kind,
    },
    kind
  );
}

export function withInferredKind(m: Match): Match {
  return { ...m, kind: inferMatchKind(m) };
}
