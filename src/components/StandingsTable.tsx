"use client";

import { useEffect, useMemo, useState } from "react";
import type { Match, StandingRow, Standings } from "@/lib/types";
import { standingGoalDiff, standingPoints, sortStandings } from "@/lib/standings";
import TeamBadge from "@/components/TeamBadge";
import { MIZZLI_CREST } from "@/lib/brand";

function Num({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <input
      type="number"
      min={0}
      inputMode="numeric"
      value={value}
      onChange={(e) => onChange(Math.max(0, Math.round(Number(e.target.value) || 0)))}
      className="mx-auto w-12 rounded-lg border border-white/15 bg-black/30 px-1 py-1 text-center text-sm"
    />
  );
}

export default function StandingsTable({
  standings,
  matches,
  teamName,
  editable = false,
  onSave,
}: {
  standings: Standings;
  matches?: Match[];
  teamName?: string;
  editable?: boolean;
  onSave?: (next: Standings) => Promise<boolean> | boolean;
}) {
  const [rows, setRows] = useState<StandingRow[]>(standings.rows);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!dirty) setRows(standings.rows);
  }, [standings.rows, dirty]);

  const visible = useMemo(
    () => sortStandings(rows, matches, teamName),
    [rows, matches, teamName]
  );

  const patch = (id: string, field: keyof StandingRow, value: number) => {
    setDirty(true);
    setRows((current) =>
      current.map((row) => {
        if (row.id !== id) return row;
        const next = { ...row, [field]: value } as StandingRow;
        next.played = next.won + next.drawn + next.lost;
        return next;
      })
    );
    setMsg("");
  };

  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true);
    setMsg("");
    const ordered = sortStandings(
      (dirty ? rows : standings.rows).map((row) => ({
        ...row,
        played: row.won + row.drawn + row.lost,
      })),
      matches,
      teamName
    );
    const ok = await onSave({
      ...standings,
      manual: true,
      live: false,
      rows: ordered,
    });
    setSaving(false);
    setMsg(ok ? "Classifica aggiornata" : "Salvataggio non riuscito");
    if (ok) {
      setRows(ordered);
      setDirty(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[var(--team-card-bg)] backdrop-blur-md">
      <div className="flex items-end justify-between gap-3 border-b border-white/10 px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--team-accent)]">
            Stagione {standings.season}
            {standings.live ? " · LIVE" : ""}
          </p>
          <h2 className="mt-1 text-2xl font-black">{standings.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
            {visible.length} squadre
          </span>
          {editable ? (
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="rounded-full bg-[var(--team-accent)] px-4 py-2 text-xs font-black text-[var(--team-secondary)]"
            >
              {saving ? "Salvo..." : "Salva classifica"}
            </button>
          ) : null}
        </div>
      </div>

      {standings.live && (
        <p className="border-b border-white/10 px-5 py-2 text-xs font-semibold text-[var(--team-accent)]">
          In corso: la classifica include il risultato live e si aggiorna da sola.
        </p>
      )}

      {editable ? (
        <p className="border-b border-white/10 px-5 py-2 text-xs opacity-60">
          Modifica V, N, P, GF e GS. I punti e l'ordine si calcolano al salvataggio.
        </p>
      ) : null}

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
            {visible.map((row, index) => {
              const pos = index + 1;
              const diff = standingGoalDiff(row);
              const zone =
                pos === 1
                  ? "border-l-4 border-l-[var(--team-accent)]"
                  : pos <= 3
                    ? "border-l-4 border-l-emerald-400/70"
                    : pos >= visible.length - 1
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
                  <td className="px-2 py-3 text-center opacity-80">{row.won + row.drawn + row.lost}</td>
                  <td className="px-2 py-3 text-center">
                    {editable ? <Num value={row.won} onChange={(n) => patch(row.id, "won", n)} /> : <span className="opacity-80">{row.won}</span>}
                  </td>
                  <td className="px-2 py-3 text-center">
                    {editable ? <Num value={row.drawn} onChange={(n) => patch(row.id, "drawn", n)} /> : <span className="opacity-80">{row.drawn}</span>}
                  </td>
                  <td className="px-2 py-3 text-center">
                    {editable ? <Num value={row.lost} onChange={(n) => patch(row.id, "lost", n)} /> : <span className="opacity-80">{row.lost}</span>}
                  </td>
                  <td className="px-2 py-3 text-center">
                    {editable ? <Num value={row.goalsFor} onChange={(n) => patch(row.id, "goalsFor", n)} /> : <span className="opacity-80">{row.goalsFor}</span>}
                  </td>
                  <td className="px-2 py-3 text-center">
                    {editable ? (
                      <Num value={row.goalsAgainst} onChange={(n) => patch(row.id, "goalsAgainst", n)} />
                    ) : (
                      <span className="opacity-80">{row.goalsAgainst}</span>
                    )}
                  </td>
                  <td className="px-2 py-3 text-center opacity-80">{diff > 0 ? `+${diff}` : diff}</td>
                  <td className="px-4 py-3 text-right text-base font-black text-[var(--team-accent)]">
                    {standingPoints(row)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-white/10 px-5 py-3 text-[11px] opacity-60">
        <span className="flex items-center gap-1">
          <i className="inline-block h-2 w-2 rounded-full bg-[var(--team-accent)]" /> 1° posto
        </span>
        <span className="flex items-center gap-1">
          <i className="inline-block h-2 w-2 rounded-full bg-emerald-400" /> Zona alta
        </span>
        <span className="flex items-center gap-1">
          <i className="inline-block h-2 w-2 rounded-full bg-red-400" /> Zona bassa
        </span>
        {msg ? <span className="font-semibold text-[var(--team-accent)]">{msg}</span> : null}
      </div>
    </section>
  );
}
