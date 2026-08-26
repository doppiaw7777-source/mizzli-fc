"use client";

import AppShell from "@/components/AppShell";
import SectionPage, { SoftCard } from "@/components/SectionPage";
import { useTeam } from "@/context/TeamContext";

export default function CantiPage() {
  const { data } = useTeam();
  if (!data) return null;

  return (
    <AppShell page="altro">
      <SectionPage title="Canti" subtitle="I cori della curva">
        {data.club.chants.length === 0 ? (
          <p className="opacity-60">Nessun canto. Aggiungili da Admin → Club.</p>
        ) : (
          data.club.chants.map((c) => (
            <SoftCard key={c.id}>
              <h2 className="font-bold">{c.title}</h2>
              <p className="mt-2 whitespace-pre-wrap opacity-80">{c.lyrics}</p>
            </SoftCard>
          ))
        )}
      </SectionPage>
    </AppShell>
  );
}
