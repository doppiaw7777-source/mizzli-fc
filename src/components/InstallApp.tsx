"use client";

import { useEffect, useState } from "react";

type BeforeInstall = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export function isStandaloneApp() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && Boolean((window.navigator as { standalone?: boolean }).standalone))
  );
}

export default function InstallApp({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [deferred, setDeferred] = useState<BeforeInstall | null>(null);
  const [installed, setInstalled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstall);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferred) return;
    setBusy(true);
    await deferred.prompt();
    const choice = await deferred.userChoice;
    setBusy(false);
    if (choice.outcome === "accepted") setInstalled(true);
    setDeferred(null);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/scarica`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (installed) {
    return (
      <div className="rounded-2xl border border-green-400/30 bg-green-500/10 p-4 text-center">
        <p className="font-bold">App già installata su questo dispositivo</p>
        <p className="mt-1 text-sm opacity-70">Aprila dall&apos;icona in home, come qualsiasi altra app.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${compact ? "" : "rounded-2xl border border-[var(--team-accent)]/30 bg-[var(--team-card-bg)] p-5"}`}>
      {!compact && (
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--team-accent)]">
            Download
          </p>
          <h2 className="mt-1 text-2xl font-black">Scarica MIZZLI FC</h2>
          <p className="mt-2 text-sm opacity-70">
            Tocca il tasto del tuo telefono. L&apos;icona arriva in home.
          </p>
        </div>
      )}

      <a
        href="/api/scarica/iphone"
        className="block w-full rounded-2xl bg-[var(--team-accent)] px-5 py-4 text-center text-lg font-black text-[var(--team-secondary)]"
      >
        Scarica per iPhone
      </a>

      <a
        href="/api/scarica/app"
        className="block w-full rounded-2xl border border-[var(--team-accent)] px-5 py-4 text-center text-lg font-black"
      >
        Salva il file dell&apos;app
      </a>
      <p className="text-center text-xs opacity-60">
        ZIP da tenere sul telefono o sul computer. Lo riapri anche più avanti.
      </p>

      {deferred ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => void install()}
          className="w-full rounded-2xl border border-[var(--team-accent)] px-5 py-4 text-lg font-black"
        >
          {busy ? "Installazione..." : "Scarica per Android e computer"}
        </button>
      ) : (
        <p className="rounded-2xl border border-white/15 px-5 py-3 text-center text-sm font-semibold opacity-80">
          Android: Chrome → menu ⋮ → Installa app
        </p>
      )}

      <ol className="list-decimal space-y-2 pl-5 text-sm opacity-90">
        <li>
          <b>iPhone:</b> Scarica per iPhone → Impostazioni → profilo scaricato → Installa. Oppure Safari: Condividi → Aggiungi a Home.
        </li>
        <li>
          <b>Android:</b> Chrome → Installa app. Compare l&apos;icona in home.
        </li>
      </ol>

      <button type="button" onClick={copyLink} className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold">
        {copied ? "Link copiato" : "Copia link"}
      </button>
    </div>
  );
}
