"use client";

import AppShell from "@/components/AppShell";
import SectionPage, { SoftCard } from "@/components/SectionPage";
import { useTeam } from "@/context/TeamContext";

export default function DocumentiPage() {
  const { data } = useTeam();
  if (!data) return null;
  const docs = data.club.documents || [];

  return (
    <AppShell page="altro">
      <SectionPage
        title="Documenti"
        subtitle="Regolamento, codice etico e carte del club"
      >
        {docs.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm opacity-60">
            Nessun documento pubblicato.
          </p>
        ) : (
          docs.map((doc) => (
            <SoftCard key={doc.id}>
              <p className="font-bold">{doc.title}</p>
              {doc.url ? (
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm font-semibold text-[var(--team-accent)]"
                >
                  Apri documento
                </a>
              ) : (
                <p className="mt-2 text-sm opacity-60">Link in arrivo dallo staff.</p>
              )}
            </SoftCard>
          ))
        )}
      </SectionPage>
    </AppShell>
  );
}
