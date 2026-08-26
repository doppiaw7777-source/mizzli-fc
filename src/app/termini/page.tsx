"use client";

import Link from "next/link";
import AppShell from "@/components/AppShell";

export default function TerminiPage() {
  return (
    <AppShell page="home">
      <article className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-3xl font-black">Termini di utilizzo</h1>
        <p className="text-sm opacity-60">Ultimo aggiornamento: 17 agosto 2026</p>
        <p>
          Usando MIZZLI FC accetti questi termini. L’App è destinata alla
          gestione della propria squadra di calcio (rosa, calendario,
          formazione e staff).
        </p>
        <p>
          L’area Admin è riservata all’amministratore. Sei responsabile delle
          foto e dei dati che carichi: carica solo contenuti di cui hai i
          diritti.
        </p>
        <p>
          L’App viene fornita “così com’è”. Non sostituiamo comunicazioni
          ufficiali di federazioni o campionati.
        </p>
        <Link href="/" className="inline-block text-[var(--team-accent)]">
          ← Torna alla home
        </Link>
      </article>
    </AppShell>
  );
}
