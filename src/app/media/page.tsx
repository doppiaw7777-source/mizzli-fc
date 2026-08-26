"use client";

import AppShell from "@/components/AppShell";
import SectionPage, { SoftCard } from "@/components/SectionPage";
import { useTeam } from "@/context/TeamContext";

export default function MediaPage() {
  const { data } = useTeam();
  if (!data) return null;

  return (
    <AppShell page="altro">
      <SectionPage title="Media" subtitle="Video e highlights">
        {data.club.videos.length === 0 ? (
          <p className="opacity-60">Nessun video. Aggiungili da Admin → Club.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {data.club.videos.map((v) => (
              <SoftCard key={v.id}>
                <p className="font-bold">{v.title}</p>
                {v.url ? (
                  <a
                    href={v.url}
                    className="mt-2 inline-block text-sm text-[var(--team-accent)] underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Apri video
                  </a>
                ) : (
                  <p className="mt-2 text-sm opacity-60">Link non ancora inserito</p>
                )}
              </SoftCard>
            ))}
          </div>
        )}
      </SectionPage>
    </AppShell>
  );
}
