import { dateKey, pad2, todayKey } from "./dates";
import { parseScore, syncStandings } from "./standings";
import type { Match, MatchLivesStore, TeamData } from "./types";
import { getMatchKind } from "./match-kind";
import {
  appendEvent,
  emptyMatchLive,
  overlayLiveOnTeam,
  stampEvent,
} from "./match-live";

export type ParsedWhatsAppResult = {
  score: string;
  opponent: string;
  date: string;
  live: boolean;
  minute: string;
};

const SCORE_RE = /(\d{1,2})\s*[-–—:xX]\s*(\d{1,2})/;
const SCORE_A_RE = /(\d{1,2})\s*[aA]\s*(\d{1,2})/;
const ISO_DATE_RE = /(\d{4})-(\d{2})-(\d{2})/;
const IT_DATE_RE = /(\d{1,2})[/.](\d{1,2})(?:[/.](\d{2,4}))?/;
const MINUTE_RE = /(\d{1,3})\s*['′’mM](?:in(?:uto)?)?/;
const NOISE =
  /\b(risultato|risultati|finita|finito|finale|partita|score|casa|trasferta|oggi|ieri|live|minuto|minuti|aggiorna|aggiornamento|vs|contro|noi|mizzli|mister|allenatore)\b/gi;

export function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function parseWhatsAppResult(raw: string): ParsedWhatsAppResult | null {
  const text = String(raw || "").trim();
  if (!text) return null;

  const live = /\b(live|in diretta|minuto)\b/i.test(text);
  let date = "";
  if (/\boggi\b/i.test(text)) date = todayKey();
  if (/\bieri\b/i.test(text)) date = yesterdayKey();

  const iso = text.match(ISO_DATE_RE);
  if (iso) date = `${iso[1]}-${iso[2]}-${iso[3]}`;
  const it = text.match(IT_DATE_RE);
  if (!iso && it) {
    const year = it[3]
      ? it[3].length === 2
        ? `20${it[3]}`
        : it[3]
      : String(new Date().getFullYear());
    date = `${year}-${pad2(Number(it[2]))}-${pad2(Number(it[1]))}`;
  }

  const minute = text.match(MINUTE_RE)?.[1] || "";
  const scored = text.match(SCORE_RE) || text.match(SCORE_A_RE);
  if (!scored) return null;
  const score = `${Number(scored[1])}-${Number(scored[2])}`;

  const leftover = text
    .replace(ISO_DATE_RE, " ")
    .replace(IT_DATE_RE, " ")
    .replace(SCORE_RE, " ")
    .replace(SCORE_A_RE, " ")
    .replace(MINUTE_RE, " ")
    .replace(NOISE, " ")
    .replace(/[^\p{L}\p{N} .'-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  const vs = text.match(/\b(?:vs\.?|contro)\s+([^\n,]+)/i);
  const opponent = (vs?.[1] || leftover).replace(NOISE, " ").replace(/\s+/g, " ").trim();

  return { score, opponent, date, live, minute };
}

export function normalizeClubName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\b(fc|asd|us|ss|ac|calcio|united|club)\b/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function namesMatch(a: string, b: string) {
  const na = normalizeClubName(a);
  const nb = normalizeClubName(b);
  if (!na || !nb) return false;
  return na.includes(nb) || nb.includes(na);
}

function nearestMatch(matches: Match[]) {
  const today = todayKey();
  const todayMs = new Date(`${today}T12:00:00`).getTime();
  return [...matches].sort((a, b) => {
    const da = dateKey(a.date);
    const db = dateKey(b.date);
    const aPast = da <= today;
    const bPast = db <= today;
    if (aPast !== bPast) return aPast ? -1 : 1;
    const dist = (d: string) =>
      Math.abs(new Date(`${d}T12:00:00`).getTime() - todayMs);
    return dist(da) - dist(db) || db.localeCompare(da);
  })[0];
}

export function findMatchForResult(data: TeamData, parsed: ParsedWhatsAppResult) {
  let pool = data.matches.filter((m) => getMatchKind(m) !== "allenamento");
  if (parsed.date) {
    const onDay = pool.filter((m) => dateKey(m.date) === parsed.date);
    if (onDay.length) pool = onDay;
  }
  if (parsed.opponent) {
    const named = pool.filter((m) => namesMatch(m.opponent, parsed.opponent));
    if (named.length) pool = named;
  }
  const open = pool.filter((m) => !m.result);
  if (open.length) return nearestMatch(open);
  if (pool.length) return nearestMatch(pool);
  return null;
}

export function applyWhatsAppResult(data: TeamData, parsed: ParsedWhatsAppResult) {
  const match = findMatchForResult(data, parsed);
  if (!match) {
    return {
      ok: false as const,
      error: "Nessuna partita trovata. Aggiungi la gara in Calendario o indica l'avversario.",
    };
  }

  const parsedScore = parseScore(parsed.score);
  const now = new Date();
  const lives = [...(data.club.matchLives || [])];
  let live = lives.find((item) => item.matchId === match.id) || emptyMatchLive(match.id, now);
  if (parsedScore) {
    live = { ...live, scoreUs: parsedScore[0], scoreOpp: parsedScore[1] };
  }
  live = {
    ...live,
    status: parsed.live ? "live" : "ft",
    minute: Number(parsed.minute) || live.minute,
    clockBaseMinute: Number(parsed.minute) || live.clockBaseMinute,
    clockStartedAt: parsed.live ? live.clockStartedAt || now.toISOString() : null,
    updatedAt: now.toISOString(),
  };
  const note = stampEvent(
    live,
    {
      type: "note",
      team: "us",
      text: parsed.live
        ? `Aggiornamento WhatsApp ${parsed.score}`
        : `Risultato WhatsApp ${parsed.score}`,
      minute: live.minute,
    },
    data.players,
    match.opponent,
    now
  );
  note.id = `wa-${now.getTime()}`;
  live = appendEvent(live, note, now);

  const store: MatchLivesStore = {
    activeMatchId: match.id,
    lives: [...lives.filter((item) => item.matchId !== match.id), live],
  };

  const matches = data.matches.map((m) =>
    m.id === match.id
      ? {
          ...m,
          result: parsed.live ? m.result : parsed.score,
        }
      : m
  );

  const next: TeamData = syncStandings(
    overlayLiveOnTeam(
      {
        ...data,
        matches,
      },
      store
    )
  );

  return {
    ok: true as const,
    data: next,
    matchId: match.id,
    opponent: match.opponent,
    result: parsed.score,
    live: parsed.live,
    message: parsed.live
      ? `Live aggiornato: vs ${match.opponent} ${parsed.score}${parsed.minute ? ` ${parsed.minute}'` : ""}`
      : `Risultato salvato: vs ${match.opponent} ${parsed.score}`,
  };
}

export { normalizePhone } from "./phone";

export type IncomingWhatsApp = { from: string; text: string };

export function extractIncomingMessages(body: unknown, form?: URLSearchParams): IncomingWhatsApp[] {
  const found: IncomingWhatsApp[] = [];
  if (form) {
    const text = form.get("Body") || form.get("text") || form.get("message") || "";
    const from = String(form.get("From") || form.get("from") || "").replace(/^whatsapp:/i, "");
    if (text) found.push({ from, text: String(text) });
  }
  if (!body || typeof body !== "object") return found;
  const raw = body as Record<string, unknown>;

  const entries = Array.isArray(raw.entry) ? raw.entry : [];
  for (const entry of entries) {
    const changes = Array.isArray((entry as { changes?: unknown }).changes)
      ? ((entry as { changes: unknown[] }).changes)
      : [];
    for (const change of changes) {
      const value = (change as { value?: { messages?: unknown[] } }).value;
      for (const msg of value?.messages || []) {
        const m = msg as { from?: string; text?: { body?: string }; type?: string };
        if (m.text?.body) found.push({ from: m.from || "", text: m.text.body });
      }
    }
  }

  const direct =
    (typeof raw.text === "string" && raw.text) ||
    (typeof raw.body === "string" && raw.body) ||
    (typeof raw.message === "string" && raw.message) ||
    "";
  if (direct) {
    found.push({
      from: String(raw.from || raw.From || ""),
      text: direct,
    });
  }
  return found;
}
