"use client";

import AppShell from "@/components/AppShell";
import SectionPage, { SoftCard } from "@/components/SectionPage";
import { useTeam } from "@/context/TeamContext";

export default function KitPage() {
  const { data } = useTeam();
  if (!data) return null;
  return (
    <AppShell page="altro">
      <SectionPage title="Kit" subtitle="Maglie della stagione">
        <div className="grid gap-3 md:grid-cols-3">
          {data.club.kits.map((k) => (
            <SoftCard key={k.id} className="text-center">
              <p className="text-4xl">👕</p>
              <p className="mt-2 font-black">{k.name}</p>
              <p className="text-sm opacity-70">{k.season}</p>
              <p className="mt-1">{k.colors}</p>
            </SoftCard>
          ))}
        </div>
      </SectionPage>
    </AppShell>
  );
}
