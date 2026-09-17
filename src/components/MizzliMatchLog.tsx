"use client";

import type { Match, TeamData } from "@/lib/types";
import { formatItDate, todayKey, dateKey } from "@/lib/dates";
import { parseScore } from "@/lib/standings";
import { getMatchKind } from "@/lib/match-kind";

function outcome(match: Match): "V" | "P" | "S" | null {
  const score = parseScore(match.result);
  if (!score) return null;
  if (score[0] > score[1]) return "V";
  if (score[0] < score[1]) return "S";
  return "P";
}

export default function MizzliMatchLog({ data }: { data: TeamData }) {
  const today = todayKey();
  const team = data.settings?.teamName || "MIZZLI FC";
  const list = [...(data.matches || [])]
    .filter((m) => getMatchKind(m) !== "allenamento")
    .sort((a, b) => dateKey(a.date).localeCompare(dateKey(b.date)));

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[var(--team-card-bg)]">
      <div className="border-b border-white/10 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--team-accent)]">
          {team}
        </p>
        <h2 className="mt-1 text-2xl font-black">Storico e prossime</h2>
        <p className="mt-1 text-sm opacity-60">
          Data, ora e campo. Le partite giocate hanno V verde, P giallo, S rosso.
        </p>
      </div>
      {list.length === 0 ? (
        <p className="px-5 py-6 text-sm opacity-60">Nessuna partita in elenco. Aggiungile dal calendario.</p>
      ) : (
        <ul className="divide-y divide-white/10">
          {list.map((m) => {
            const mark = outcome(m);
            const past = !!mark || (dateKey(m.date) && dateKey(m.date) < today && !!m.result);
            const badge =
              mark === "V"
                ? "bg-emerald-500 text-black"
                : mark === "P"
                  ? "bg-amber-400 text-black"
                  : mark === "S"
                    ? "bg-red-500 text-white"
                    : "bg-white/10 text-white/70";
            return (
              <li key={m.id} className="flex items-center gap-3 px-5 py-3">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black ${badge}`}>
                  {mark || "·"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">
                    {m.isHome ? `${team} – ${m.opponent || "?"}` : `${m.opponent || "?"} – ${team}`}
                  </p>
                  <p className="text-xs opacity-60">
                    {formatItDate(m.date, { weekday: "short", day: "numeric", month: "short" })}
                    {m.time ? ` · ${m.time}` : ""}
                    {m.location ? ` · ${m.location}` : ""}
                    {m.result ? ` · ${m.result}` : past ? "" : " · da giocare"}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
