"use client";

import AppShell from "@/components/AppShell";
import SectionPage, { SoftCard } from "@/components/SectionPage";
import { useTeam } from "@/context/TeamContext";

export default function ContattiPage() {
  const { data } = useTeam();
  if (!data) return null;
  const i = data.club.info;
  const b = data.settings.branding;

  return (
    <AppShell page="altro">
      <SectionPage title="Contatti & Stadio">
        <div className="grid gap-4 md:grid-cols-2">
          <SoftCard>
            <h2 className="font-bold">Club</h2>
            <p className="mt-2">{i.address}, {i.city}</p>
            <p>Fondato: {i.founded}</p>
            <p>Presidente: {i.president}</p>
            <p>DS: {i.sportingDirector}</p>
            <p>Email: {b.contactEmail || i.pressEmail || "—"}</p>
            <p>Tel: {b.contactPhone || "—"}</p>
            <p>Orari: {i.openingHours}</p>
          </SoftCard>
          <SoftCard>
            <h2 className="font-bold">Stadio</h2>
            <p className="mt-2">{b.stadiumName || "Campo societario"}</p>
            <p>Capienza: {i.stadiumCapacity}</p>
            <p>Parcheggio: {i.parking}</p>
            <p>Come arrivare: {i.transport}</p>
            <p>Hospitality: {i.hospitality}</p>
            <p>Accessibilità: {i.disabledAccess}</p>
            {i.mapsUrl && (
              <a href={i.mapsUrl} className="mt-2 inline-block text-[var(--team-accent)]">
                Apri mappa
              </a>
            )}
          </SoftCard>
          <SoftCard>
            <h2 className="font-bold">Biglietti</h2>
            <p className="mt-2 whitespace-pre-wrap">{i.ticketPrices}</p>
            {i.ticketUrl && (
              <a href={i.ticketUrl} className="mt-2 inline-block text-[var(--team-accent)]">
                Acquista
              </a>
            )}
          </SoftCard>
          <SoftCard>
            <h2 className="font-bold">Mascotte & Inno</h2>
            <p className="mt-2">Mascotte: {i.mascot}</p>
            <p className="mt-2 italic">{i.anthem}</p>
          </SoftCard>
        </div>
      </SectionPage>
    </AppShell>
  );
}
