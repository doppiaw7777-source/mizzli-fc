"use client";

import AppShell from "@/components/AppShell";
import SectionPage, { SoftCard } from "@/components/SectionPage";
import { useTeam } from "@/context/TeamContext";

export default function StoriaPage() {
  const { data } = useTeam();
  if (!data) return null;
  const c = data.club;

  return (
    <AppShell page="altro">
      <SectionPage title="Storia del club" subtitle={`Fondata nel ${c.info.founded}`}>
        <SoftCard>
          <p className="whitespace-pre-wrap opacity-90">{c.info.history}</p>
        </SoftCard>
        <SoftCard>
          <h2 className="font-bold">Valori</h2>
          <p className="mt-2">{c.info.values}</p>
          <p className="mt-2 text-sm opacity-70">{c.info.fairPlay}</p>
        </SoftCard>
        <h2 className="text-xl font-bold">Palmarès</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {c.honours.map((h) => (
            <SoftCard key={h.id}>
              <p className="text-sm text-[var(--team-accent)]">{h.year}</p>
              <p className="font-bold">{h.title}</p>
            </SoftCard>
          ))}
        </div>
        <h2 className="text-xl font-bold">Timeline</h2>
        <div className="space-y-3">
          {c.timeline.map((t) => (
            <SoftCard key={t.id}>
              <p className="text-sm text-[var(--team-accent)]">{t.year}</p>
              <p className="font-bold">{t.title}</p>
              <p className="text-sm opacity-80">{t.text}</p>
            </SoftCard>
          ))}
        </div>
        <h2 className="text-xl font-bold">Leggende</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {c.legends.map((l) => (
            <SoftCard key={l.id}>
              <p className="font-bold">{l.name}</p>
              <p className="text-sm opacity-60">{l.years}</p>
              <p className="mt-2 text-sm">{l.text}</p>
            </SoftCard>
          ))}
        </div>
      </SectionPage>
    </AppShell>
  );
}
