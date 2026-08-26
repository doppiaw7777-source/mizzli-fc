"use client";

import Link from "next/link";
import AppShell from "@/components/AppShell";
import SectionPage, { SoftCard } from "@/components/SectionPage";
import { useTeam } from "@/context/TeamContext";

const labels: Record<string, string> = {
  injured: "Infortunato",
  suspended: "Squalificato",
  unavailable: "Indisponibile",
};

export default function InfortuniPage() {
  const { data } = useTeam();
  if (!data) return null;
  const out = data.players.filter((p) => p.status && p.status !== "available");

  return (
    <AppShell page="altro">
      <SectionPage title="Infermeria" subtitle="Infortunati, squalificati e indisponibili">
        {out.length === 0 ? (
          <p className="opacity-60">Tutti i giocatori sono disponibili.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {out.map((p) => (
              <Link key={p.id} href={`/giocatore/${p.id}`}>
                <SoftCard>
                  <p className="font-bold">
                    {p.number}. {p.name}
                  </p>
                  <p className="text-sm opacity-70">{p.position}</p>
                  <p className="mt-2 text-sm font-semibold text-red-300">
                    {labels[p.status || ""] || p.status}
                  </p>
                </SoftCard>
              </Link>
            ))}
          </div>
        )}
      </SectionPage>
    </AppShell>
  );
}
