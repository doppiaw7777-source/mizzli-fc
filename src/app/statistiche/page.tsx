"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import SectionPage from "@/components/SectionPage";
import { PlayerKit } from "@/components/PlayerKit";
import { formGuide, ranking } from "@/lib/club";
import { parseScore, standingPoints } from "@/lib/standings";
import { getMatchKind } from "@/lib/match-kind";
import { useTeam } from "@/context/TeamContext";
import type { PlayerRole } from "@/lib/types";

type Tab = "goals" | "assists" | "appearances" | "minutes" | "motm" | "cards";

const TABS: { id: Tab; label: string }[] = [
  { id: "goals", label: "Gol" },
  { id: "assists", label: "Assist" },
  { id: "appearances", label: "Presenze" },
  { id: "minutes", label: "Minuti" },
  { id: "motm", label: "MVP" },
  { id: "cards", label: "Cartellini" },
];

const ROLES: { id: "ALL" | PlayerRole; label: string }[] = [
  { id: "ALL", label: "Tutti" },
  { id: "POR", label: "Por" },
  { id: "DIF", label: "Dif" },
  { id: "CEN", label: "Cen" },
  { id: "ATT", label: "Att" },
];

function valueOf(
  p: {
    stats?: { goals?: number; assists?: number; appearances?: number };
    minutes?: number;
    motm?: number;
    yellowCards?: number;
    redCards?: number;
  },
  tab: Tab
) {
  if (tab === "goals") return p.stats?.goals ?? 0;
  if (tab === "assists") return p.stats?.assists ?? 0;
  if (tab === "appearances") return p.stats?.appearances ?? 0;
  if (tab === "minutes") return p.minutes ?? 0;
  if (tab === "motm") return p.motm ?? 0;
  return (p.yellowCards ?? 0) + (p.redCards ?? 0) * 2;
}

export default function StatistichePage() {
  const { data } = useTeam();
  const [tab, setTab] = useState<Tab>("goals");
  const [role, setRole] = useState<"ALL" | PlayerRole>("ALL");

  const rows = useMemo(() => {
    if (!data) return [];
    return [...(data.players || [])]
      .filter((p) => role === "ALL" || p.role === role)
      .map((player) => ({ player, value: valueOf(player, tab) }))
      .sort((a, b) => b.value - a.value || a.player.number - b.player.number);
  }, [data, role, tab]);

  if (!data) return null;

  const league = (data.matches || []).filter((m) => getMatchKind(m) === "partita" && parseScore(m.result));
  let gf = 0;
  let ga = 0;
  let w = 0;
  let d = 0;
  let l = 0;
  for (const m of league) {
    const s = parseScore(m.result);
    if (!s) continue;
    gf += s[0];
    ga += s[1];
    if (s[0] > s[1]) w += 1;
    else if (s[0] < s[1]) l += 1;
    else d += 1;
  }
  const us = data.standings?.rows?.find((r) => r.isUs);
  const form = formGuide(data);
  const goals = ranking(data, "goals").filter((r) => r.value > 0).slice(0, 3);
  const assists = ranking(data, "assists").filter((r) => r.value > 0).slice(0, 3);
  const max = Math.max(1, rows[0]?.value || 0);

  return (
    <AppShell page="altro">
      <SectionPage title="Statistiche" subtitle={data.settings.branding.seasonLabel || "Stagione in corso"}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wider opacity-50">Partite</p>
            <p className="mt-1 text-3xl font-black">{league.length || us?.played || 0}</p>
            <p className="text-xs opacity-60">{w}V {d}N {l}P</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wider opacity-50">Punti</p>
            <p className="mt-1 text-3xl font-black text-[var(--team-accent)]">
              {us ? standingPoints(us) : w * 3 + d}
            </p>
            <p className="text-xs opacity-60">classifica</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wider opacity-50">Gol fatti</p>
            <p className="mt-1 text-3xl font-black">{gf || us?.goalsFor || 0}</p>
            <p className="text-xs opacity-60">subiti {ga || us?.goalsAgainst || 0}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wider opacity-50">Forma</p>
            <p className="mt-2 flex gap-1">
              {(form.length ? form : ["-"]).map((f, i) => (
                <span
                  key={i}
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${
                    f === "V" ? "bg-green-600" : f === "P" ? "bg-red-600" : "bg-white/20"
                  }`}
                >
                  {f}
                </span>
              ))}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wider opacity-50">Top marcatori</p>
            <div className="mt-3 space-y-2">
              {goals.length === 0 && <p className="text-sm opacity-50">Nessun gol ancora</p>}
              {goals.map((r, i) => (
                <Link key={r.player.id} href={`/giocatore/${r.player.id}`} className="flex items-center gap-3">
                  <span className="w-4 text-sm opacity-40">{i + 1}</span>
                  <PlayerKit player={r.player} size="xs" animate={false} />
                  <span className="flex-1 truncate font-semibold">{r.player.name}</span>
                  <span className="font-black text-[var(--team-accent)]">{r.value}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wider opacity-50">Top assist</p>
            <div className="mt-3 space-y-2">
              {assists.length === 0 && <p className="text-sm opacity-50">Nessun assist ancora</p>}
              {assists.map((r, i) => (
                <Link key={r.player.id} href={`/giocatore/${r.player.id}`} className="flex items-center gap-3">
                  <span className="w-4 text-sm opacity-40">{i + 1}</span>
                  <PlayerKit player={r.player} size="xs" animate={false} />
                  <span className="flex-1 truncate font-semibold">{r.player.name}</span>
                  <span className="font-black text-[var(--team-accent)]">{r.value}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                tab === t.id ? "bg-[var(--team-accent)] text-[var(--team-secondary)]" : "bg-white/10"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRole(r.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                role === r.id ? "bg-white/20" : "bg-white/5 opacity-70"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="space-y-2 rounded-2xl border border-white/10 bg-[var(--team-card-bg)] p-3">
          {rows.every((row) => !row.value) && (
            <p className="py-4 text-center text-sm opacity-60">Ancora nessun dato per questa voce.</p>
          )}
          {rows.map((row, i) => (
            <Link key={row.player.id} href={`/giocatore/${row.player.id}`} className="block rounded-xl bg-white/5 px-3 py-2.5">
              <div className="flex items-center gap-3">
                <span className="w-5 text-sm font-black opacity-40">{i + 1}</span>
                <PlayerKit player={row.player} size="xs" animate={false} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{row.player.name}</span>
                  <span className="text-xs opacity-50">
                    {row.player.number} · {row.player.position}
                  </span>
                </span>
                <span className="font-black text-[var(--team-accent)]">{row.value}</span>
              </div>
              <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-white/10">
                <span
                  className="block h-full rounded-full bg-[var(--team-accent)]"
                  style={{ width: `${Math.round((row.value / max) * 100)}%` }}
                />
              </span>
            </Link>
          ))}
        </div>
      </SectionPage>
    </AppShell>
  );
}
