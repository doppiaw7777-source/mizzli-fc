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
        {data.club.info.shopUrl && !["#", "/", "http://", "https://"].includes(data.club.info.shopUrl.trim()) && (
          <a href={data.club.info.shopUrl} className="text-[var(--team-accent)]">
            Negozio online →
          </a>
        )}
        {data.club.merch.length === 0 ? (
          <SoftCard className="text-center text-sm opacity-70">
            Lo shop ufficiale arriverà a breve.
          </SoftCard>
        ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.club.merch.map((m) => (
            <SoftCard key={m.id}>
              <p className="text-xs uppercase opacity-50">{m.category}</p>
              <p className="font-bold">{m.name}</p>
              <p className="text-[var(--team-accent)]">{m.price}</p>
              {m.url && !["#", "/"].includes(m.url.trim()) && (
                <a href={m.url} className="text-sm underline">
                  Dettagli
                </a>
              )}
            </SoftCard>
          ))}
        </div>
        )}
      </SectionPage>
    </AppShell>
  );
}
