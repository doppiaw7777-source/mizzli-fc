"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { DemoClub } from "@/lib/demo-club";

export default function DemoClubPage() {
  const [club, setClub] = useState<DemoClub | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/demo")
      .then((r) => r.json())
      .then((d) => setClub(d.club || null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="p-8 text-center opacity-60">Carico la prova...</p>;
  }

  if (!club) {
    return (
      <div className="mx-auto max-w-lg space-y-4 p-8 text-center">
        <h1 className="text-2xl font-black">Nessun club di prova</h1>
        <p className="opacity-70">Crealo da Admin → Impostazioni. I dati di MIZZLI restano dove sono.</p>
        <Link href="/admin" className="text-[var(--team-accent,#c4b5fd)] underline">
          Torna ad Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-dvh px-4 py-10" style={{ background: club.primary, color: "#fff" }}>
      <div className="mx-auto max-w-lg space-y-6">
        <p className="rounded-full bg-amber-400 px-3 py-1 text-center text-xs font-black text-black">
          PROVA · non è il sito MIZZLI
        </p>
        <h1 className="text-4xl font-black" style={{ color: club.accent }}>
          {club.teamName}
        </h1>
        <p className="opacity-80">{club.motto}</p>
        <div className="space-y-2 rounded-2xl bg-white/10 p-4">
          {club.players.map((p) => (
            <div key={p.number} className="flex justify-between font-semibold">
              <span>
                {p.number}. {p.name}
              </span>
              <span className="opacity-60">{p.role}</span>
            </div>
          ))}
        </div>
        <Link href="/" className="inline-block text-sm underline opacity-80">
          Torna al sito vero →
        </Link>
      </div>
    </div>
  );
}
