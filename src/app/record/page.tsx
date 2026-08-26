"use client";

import AppShell from "@/components/AppShell";
import SectionPage, { SoftCard } from "@/components/SectionPage";
import { useTeam } from "@/context/TeamContext";

export default function RecordPage() {
  const { data } = useTeam();
  if (!data) return null;
  return (
    <AppShell page="altro">
      <SectionPage title="Record" subtitle="I numeri del club">
        <div className="grid gap-3 md:grid-cols-2">
          {data.club.records.map((r) => (
            <SoftCard key={r.id}>
              <p className="text-sm opacity-60">{r.label}</p>
              <p className="text-2xl font-black text-[var(--team-accent)]">{r.value}</p>
            </SoftCard>
          ))}
        </div>
        <SoftCard>
          <h2 className="font-bold">Citazioni</h2>
          {data.club.quotes.map((q) => (
            <blockquote key={q.id} className="mt-3 border-l-2 border-[var(--team-accent)] pl-3">
              “{q.text}” — {q.author}
            </blockquote>
          ))}
        </SoftCard>
      </SectionPage>
    </AppShell>
  );
}
