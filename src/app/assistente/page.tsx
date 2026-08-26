"use client";

import AppShell from "@/components/AppShell";
import { AssistantThread } from "@/components/AssistantChat";
import SectionPage, { SoftCard } from "@/components/SectionPage";

export default function AssistentePage() {
  return (
    <AppShell page="altro">
      <SectionPage
        title="Assistente"
        subtitle="Rosa, calendario, formazione e stadio: domande in italiano, risposte con i dati della squadra."
      >
        <SoftCard className="overflow-hidden p-0">
          <AssistantThread variant="page" />
        </SoftCard>
      </SectionPage>
    </AppShell>
  );
}
