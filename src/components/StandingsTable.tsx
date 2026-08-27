"use client";

import type { Standings } from "@/lib/types";
import { standingGoalDiff, standingPoints, sortStandings } from "@/lib/standings";
import TeamBadge from "@/components/TeamBadge";
import { MIZZLI_CREST } from "@/lib/brand";

export default function StandingsTable({ standings }: { standings: Standings }) {
  const rows = sortStandings(standings.rows);

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[var(--team-card-bg)] backdrop-blur-md">
      <div className="flex items-end justify-between border-b border-white/10 px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--team-accent)]">
            Stagione {standings.season}
            {standings.live ? " · LIVE" : ""}
          </p>
          <h2 className="mt-1 text-2xl font-black">{standings.title}</h2>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
          {rows.length} squadre
        </span>
      </div>

      {standings.live && (
        <p className="border-b border-white/10 px-5 py-2 text-xs font-semibold text-[var(--team-accent)]">
          In corso: la classifica include il risultato live e si aggiorna da sola.
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider opacity-50">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-2 py-3 font-medium">Squadra</th>
              <th className="px-2 py-3 text-center font-medium">PG</th>
              <th className="px-2 py-3 text-center font-medium">V</th>
              <th className="px-2 py-3 text-center font-medium">N</th>
              <th className="px-2 py-3 text-center font-medium">P</th>
              <th className="px-2 py-3 text-center font-medium">GF</th>
              <th className="px-2 py-3 text-center font-medium">GS</th>
              <th className="px-2 py-3 text-center font-medium">DR</th>
              <th className="px-4 py-3 text-right font-medium">Pt</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const pos = index + 1;
              const diff = standingGoalDiff(row);
              const zone =
                pos === 1
                  ? "border-l-4 border-l-[var(--team-accent)]"
                  : pos <= 3
                    ? "border-l-4 border-l-emerald-400/70"
                    : pos >= rows.length - 1
                      ? "border-l-4 border-l-red-400/60"
                      : "border-l-4 border-l-transparent";
              return (
                <tr
                  key={row.id}
                  className={`${zone} ${
                    row.isUs
                      ? "bg-[var(--team-accent)]/15 font-bold"
                      : index % 2 === 0
                        ? "bg-white/[0.03]"
                        : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${
                        pos === 1
                          ? "bg-[var(--team-accent)] text-[var(--team-secondary)]"
                          : "bg-white/10"
                      }`}
                    >
                      {pos}
                    </span>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">
                      <TeamBadge
                        name={row.name}
                        src={row.logoUrl || (row.isUs ? MIZZLI_CREST : "")}
                        gold={row.isUs}
                        size={28}
                      />
                      <span>{row.name}</span>
                      {row.isUs && (
                        <span className="rounded-full bg-[var(--team-accent)] px-2 py-0.5 text-[10px] font-black text-[var(--team-secondary)]">
                          NOI
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-3 text-center opacity-80">{row.played}</td>
                  <td className="px-2 py-3 text-center opacity-80">{row.won}</td>
                  <td className="px-2 py-3 text-center opacity-80">{row.drawn}</td>
                  <td className="px-2 py-3 text-center opacity-80">{row.lost}</td>
                  <td className="px-2 py-3 text-center opacity-80">{row.goalsFor}</td>
                  <td className="px-2 py-3 text-center opacity-80">{row.goalsAgainst}</td>
                  <td className="px-2 py-3 text-center opacity-80">
                    {diff > 0 ? `+${diff}` : diff}
                  </td>
                  <td className="px-4 py-3 text-right text-base font-black text-[var(--team-accent)]">
                    {standingPoints(row)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-4 border-t border-white/10 px-5 py-3 text-[11px] opacity-60">
        <span className="flex items-center gap-1">
          <i className="inline-block h-2 w-2 rounded-full bg-[var(--team-accent)]" /> 1° posto
        </span>
        <span className="flex items-center gap-1">
          <i className="inline-block h-2 w-2 rounded-full bg-emerald-400" /> Zona alta
        </span>
        <span className="flex items-center gap-1">
          <i className="inline-block h-2 w-2 rounded-full bg-red-400" /> Zona bassa
        </span>
        <span>Si aggiorna dai risultati del calendario (noi-loro).</span>
      </div>
    </section>
  );
}
