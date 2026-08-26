"use client";

import Link from "next/link";
import AppShell from "@/components/AppShell";

export default function PrivacyPage() {
  return (
    <AppShell page="home">
      <article className="prose prose-invert mx-auto max-w-2xl space-y-4">
        <h1 className="text-3xl font-black">Privacy Policy</h1>
        <p className="text-sm opacity-60">Ultimo aggiornamento: 17 agosto 2026</p>
        <p>
          MIZZLI FC (“l’App”) è un’applicazione di gestione della squadra
          di calcio. Titolare del trattamento: Noldi.
        </p>
        <h2 className="text-xl font-bold">Dati raccolti</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Credenziali admin (username e password hashata)</li>
          <li>Dati della squadra: giocatori, staff, calendario, formazione</li>
          <li>Foto caricate (giocatori, staff, logo, sfondi)</li>
        </ul>
        <h2 className="text-xl font-bold">Finalità</h2>
        <p>
          I dati servono solo a mostrare e gestire la rosa, il calendario e la
          formazione ufficiale della squadra. Non vendiamo dati a terzi e non
          usiamo pubblicità tracciante.
        </p>
        <h2 className="text-xl font-bold">Conservazione</h2>
        <p>
          I dati restano sul server dell’App finché l’admin non li modifica o
          elimina. La sessione admin scade dopo 7 giorni.
        </p>
        <h2 className="text-xl font-bold">Permessi iOS</h2>
        <p>
          Fotocamera e galleria vengono usate solo se scegli di caricare una
          foto di un giocatore, dello staff o uno sfondo.
        </p>
        <h2 className="text-xl font-bold">Diritti</h2>
        <p>
          Puoi chiedere modifica o cancellazione dei dati dall’area Admin, o
          contattando il titolare. L’account admin è dell’amministratore della
          squadra: per eliminarlo, accedi ad Admin e rimuovi i contenuti, oppure
          richiedi la cancellazione al titolare.
        </p>
        <p>
          Account demo per Apple Review: utente <strong>Noldi</strong>, password{" "}
          <strong>Noninoni99@</strong>.
        </p>
        <Link href="/" className="inline-block text-[var(--team-accent)]">
          ← Torna alla home
        </Link>
      </article>
    </AppShell>
  );
}
