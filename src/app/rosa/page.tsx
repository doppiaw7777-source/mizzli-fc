"use client";

import Link from "next/link";
import AppShell from "@/components/AppShell";
import PlayerCard, { groupPlayersByRole, roleLabels } from "@/components/PlayerCard";
import { useTeam } from "@/context/TeamContext";

export default function RosaPage() {
  const { data } = useTeam();
  if (!data) return null;

  const groups = groupPlayersByRole(data.players);

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
            {data.players.length} giocatori in rosa
          </p>
        </div>

        {(["POR", "DIF", "CEN", "ATT"] as const).map((role) => {
          const players = groups[role];
          if (players.length === 0) return null;
          return (
            <section key={role}>
              <h2 className="mb-4 text-2xl font-bold">
                <span className="mr-2 text-[var(--team-accent)]">●</span>
                {roleLabels[role]}
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
        })}
      </div>
    </AppShell>
  );
}
