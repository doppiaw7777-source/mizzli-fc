"use client";

import AppShell from "@/components/AppShell";
import SectionPage, { SoftCard } from "@/components/SectionPage";
import { useTeam } from "@/context/TeamContext";

export default function FaqPage() {
  const { data } = useTeam();
  if (!data) return null;

  return (
    <AppShell page="altro">
      <SectionPage title="FAQ" subtitle="Domande frequenti">
        {data.club.faqs.length === 0 ? (
          <p className="opacity-60">Nessuna FAQ.</p>
        ) : (
          data.club.faqs.map((f) => (
            <SoftCard key={f.id}>
              <h2 className="font-bold">{f.q}</h2>
              <p className="mt-2 opacity-80">{f.a}</p>
            </SoftCard>
          ))
        )}
      </SectionPage>
    </AppShell>
  );
}
