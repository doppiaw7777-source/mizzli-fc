"use client";

import AppShell from "@/components/AppShell";
import CallupBoard from "@/components/CallupBoard";
import SectionPage from "@/components/SectionPage";
import { useTeam } from "@/context/TeamContext";

export default function ConvocatiPage() {
  const { data } = useTeam();
  if (!data) return null;

  return (
    <AppShell page="altro">
      <SectionPage
        title="Convocati"
        subtitle="L'allenatore seleziona i giocatori dalla rosa: entrano nella tabella e restano in Home per 3 giorni."
      >
        <CallupBoard />
      </SectionPage>
    </AppShell>
  );
}
