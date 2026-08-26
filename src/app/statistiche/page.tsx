"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import SectionPage, { SoftCard } from "@/components/SectionPage";
import { ranking } from "@/lib/club";
import { useTeam } from "@/context/TeamContext";

export default function StatistichePage() {
  const { data } = useTeam();
  const [tab, setTab] = useState<"goals" | "assists" | "appearances" | "yellowCards" | "minutes">("goals");
  const rows = useMemo(() => (data ? ranking(data, tab) : []), [data, tab]);
  if (!data) return null;

  const labels = {
    goals: "Marcatori",
    assists: "Assistman",
    appearances: "Presenze",
    yellowCards: "Cartellini",
    minutes: "Minuti",
  };

  return (
    <AppShell page="altro">
      <SectionPage title="Statistiche" subtitle="Classifiche individuali della stagione">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(labels) as Array<keyof typeof labels>).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                tab === k ? "bg-[var(--team-accent)] text-[var(--team-secondary)]" : "bg-white/10"
              }`}
            >
              {labels[k]}
            </button>
          ))}
        </div>
        <SoftCard>
          <div className="space-y-2">
            {rows.map((row, i) => (
              <Link
                key={row.player.id}
                href={`/giocatore/${row.player.id}`}
                className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2"
              >
                <span>
                  <span className="mr-3 opacity-50">{i + 1}</span>
                  {row.player.number}. {row.player.name}
                </span>
                <span className="font-black text-[var(--team-accent)]">{row.value}</span>
              </Link>
            ))}
          </div>
        </SoftCard>
      </SectionPage>
    </AppShell>
  );
}
