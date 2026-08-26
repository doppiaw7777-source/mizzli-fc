"use client";

import AppShell from "@/components/AppShell";
import SectionPage, { SoftCard } from "@/components/SectionPage";
import { useTeam } from "@/context/TeamContext";

export default function ShopPage() {
  const { data } = useTeam();
  if (!data) return null;
  return (
    <AppShell page="altro">
      <SectionPage title="Shop" subtitle="Merchandising ufficiale">
        {data.club.info.shopUrl && (
          <a href={data.club.info.shopUrl} className="text-[var(--team-accent)]">
            Negozio online →
          </a>
        )}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.club.merch.map((m) => (
            <SoftCard key={m.id}>
              <p className="text-xs uppercase opacity-50">{m.category}</p>
              <p className="font-bold">{m.name}</p>
              <p className="text-[var(--team-accent)]">{m.price}</p>
              {m.url && (
                <a href={m.url} className="text-sm underline">
                  Dettagli
                </a>
              )}
            </SoftCard>
          ))}
        </div>
      </SectionPage>
    </AppShell>
  );
}
