"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import InstallApp from "@/components/InstallApp";
import { useTeam } from "@/context/TeamContext";

export default function ScaricaPage() {
  const { data } = useTeam();
  const name = data?.settings.teamName || "MIZZLI FC";
  const appIcon = data?.settings.appIconUrl || data?.settings.logoUrl || "/brand/mizzli-crest.png";
  const [boxColor, setBoxColor] = useState(data?.settings.colors.primary || "#0d4f2b");

  useEffect(() => {
    let cancelled = false;

    async function pickLogoColor() {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = appIcon;
        await img.decode();
        const canvas = document.createElement("canvas");
        canvas.width = 48;
        canvas.height = 48;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, 48, 48);
        const pixels = ctx.getImageData(0, 0, 48, 48).data;
        let r = 0;
        let g = 0;
        let b = 0;
        let count = 0;
        for (let i = 0; i < pixels.length; i += 16) {
          const alpha = pixels[i + 3];
          if (alpha < 60) continue;
          r += pixels[i];
          g += pixels[i + 1];
          b += pixels[i + 2];
          count += 1;
        }
        if (!count || cancelled) return;
        setBoxColor(
          `rgb(${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(
            b / count
          )})`
        );
      } catch {
        // Keep fallback team color.
      }
    }

    void pickLogoColor();
    return () => {
      cancelled = true;
    };
  }, [appIcon]);

  return (
    <AppShell page="altro">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="text-center">
          <div
            className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl ring-2 ring-[var(--team-accent)]"
            style={{ backgroundColor: boxColor }}
          >
            <img
              src={appIcon}
              alt=""
              className="h-20 w-20 rounded-2xl object-contain"
            />
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--team-accent)]">
            Store ufficiale
          </p>
          <h1 className="mt-2 text-4xl font-black">{name}</h1>
          <p className="mt-3 opacity-70">
            Un solo link per iPhone, iPad, Android, Windows e Mac. Tocca Scarica e l&apos;icona arriva in home.
          </p>
        </div>

        <InstallApp />

        <div className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-[var(--team-card-bg)] p-5">
            <p className="text-2xl">🍎</p>
            <h2 className="mt-2 font-bold">iPhone e iPad</h2>
            <p className="mt-2 text-sm opacity-70">
              Apri questo link in Safari, poi Condividi → Aggiungi a Home. L&apos;app resta tra le altre icone.
            </p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-[var(--team-card-bg)] p-5">
            <p className="text-2xl">🤖</p>
            <h2 className="mt-2 font-bold">Android</h2>
            <p className="mt-2 text-sm opacity-70">
              Chrome propone Installa app. Dopo il download compare l&apos;icona in home e nel cassetto applicazioni.
            </p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-[var(--team-card-bg)] p-5">
            <p className="text-2xl">💻</p>
            <h2 className="mt-2 font-bold">Computer</h2>
            <p className="mt-2 text-sm opacity-70">
              Chrome ed Edge installano l&apos;app nel menu Start o nel Dock. Si apre in una finestra propria.
            </p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-[var(--team-card-bg)] p-5">
            <p className="text-2xl">💾</p>
            <h2 className="mt-2 font-bold">File da tenere</h2>
            <p className="mt-2 text-sm opacity-70">
              Con Salva il file dell&apos;app scarichi lo ZIP completo. Conservalo per riaprire il progetto in futuro.
            </p>
          </article>
        </div>
      </div>
    </AppShell>
  );
}
