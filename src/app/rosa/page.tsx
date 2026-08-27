"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import PlayerCard, { groupPlayersByRole, roleLabels } from "@/components/PlayerCard";
import { useTeam } from "@/context/TeamContext";

const ROLES = ["POR", "DIF", "CEN", "ATT"] as const;

export default function RosaPage() {
  const { data } = useTeam();
  const [q, setQ] = useState("");
  const [role, setRole] = useState<(typeof ROLES)[number] | "ALL">("ALL");
  if (!data) return null;

  const query = q.trim().toLowerCase();
  const filtered = useMemo(() => {
    return data.players.filter((p) => {
      if (role !== "ALL" && p.role !== role) return false;
      if (!query) return true;
      return (
        p.name.toLowerCase().includes(query) ||
        String(p.number) === query ||
        (p.position || "").toLowerCase().includes(query)
      );
    });
  }, [data.players, query, role]);

  const groups = groupPlayersByRole(filtered);
  const rolesToShow = role === "ALL" ? ROLES : [role];

  return (
    <AppShell page="rosa">
      <div className="space-y-8">
        <div>
          <p className="page-kicker">
            {data.settings.branding.seasonLabel || "Stagione"}
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">
            {data.settings.branding.rosaTitle || "Rosa Squadra"}
          </h1>
          <p className="mt-2 opacity-70">
            {filtered.length} di {data.players.length} giocatori
          </p>
        </div>

        <div className="space-y-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cerca nome, numero o ruolo…"
            className="input-field"
            type="search"
            inputMode="search"
            autoComplete="off"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setRole("ALL")}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                role === "ALL"
                  ? "bg-[var(--team-accent)] text-[var(--team-secondary)]"
                  : "bg-white/10"
              }`}
            >
              Tutti
            </button>
            {ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                  role === r
                    ? "bg-[var(--team-accent)] text-[var(--team-secondary)]"
                    : "bg-white/10"
                }`}
              >
                {roleLabels[r]}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-8 text-center text-sm opacity-70">
            Nessun giocatore corrisponde alla ricerca.
          </p>
        ) : (
          rolesToShow.map((r) => {
            const players = groups[r];
            if (!players?.length) return null;
            return (
              <section key={r}>
                <h2 className="mb-4 text-2xl font-bold">
                  <span className="mr-2 text-[var(--team-accent)]">●</span>
                  {roleLabels[r]}
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {players.map((player) => (
                    <Link key={player.id} href={`/giocatore/${player.id}`}>
                      <PlayerCard player={player} />
                    </Link>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>
    </AppShell>
  );
}
