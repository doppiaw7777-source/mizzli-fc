"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Ping = { path: string; ok: boolean; ms: number; status: number };

export default function PannelloPage() {
  const [pings, setPings] = useState<Ping[]>([]);
  const [players, setPlayers] = useState<number | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    const paths = ["/", "/rosa", "/calendario", "/formazione", "/api/team"];
    void Promise.all(
      paths.map(async (path) => {
        const t = performance.now();
        try {
          const res = await fetch(path, { cache: "no-store" });
          if (path === "/api/team" && res.ok) {
            const data = await res.json();
            setName(data.settings?.teamName || "");
            setPlayers((data.players || []).length);
          }
          return { path, ok: res.ok, ms: Math.round(performance.now() - t), status: res.status };
        } catch {
          return { path, ok: false, ms: Math.round(performance.now() - t), status: 0 };
        }
      })
    ).then(setPings);
  }, []);

  return (
    <div className="min-h-dvh bg-[#07030c] px-4 py-10 text-[#f4f0ff]">
      <div className="mx-auto max-w-lg space-y-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">Pannello società</p>
        <h1 className="text-3xl font-black">{name || "MIZZLI FC"}</h1>
        <p className="text-sm opacity-70">
          Questo schermo è separato dalla vetrina. Le modifiche si fanno da Admin e partono sulle stesse API del sito.
          Grok non serve per far funzionare l&apos;app.
        </p>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="mb-3 font-bold">Stato ora</h2>
          {pings.length === 0 ? (
            <p className="text-sm opacity-60">Controllo...</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {pings.map((p) => (
                <li key={p.path} className="flex justify-between">
                  <span>{p.path}</span>
                  <span className={p.ok ? "text-emerald-400" : "text-red-400"}>
                    {p.status || "err"} · {p.ms} ms
                  </span>
                </li>
              ))}
            </ul>
          )}
          {players != null ? <p className="mt-3 text-sm opacity-70">{players} giocatori in rosa</p> : null}
        </div>

        <div className="grid gap-3">
          <Link href="/admin" className="rounded-2xl bg-[#c4b5fd] px-4 py-3 text-center font-black text-[#1a1030]">
            Apri Admin e modifica
          </Link>
          <Link href="/" className="rounded-2xl border border-white/20 px-4 py-3 text-center font-semibold">
            Vetrina pubblica
          </Link>
        </div>

        <div className="text-sm opacity-60">
          <p>Rosa, convocati, calendario, classifica, formazione, ruoli: tutto da Admin dopo il login.</p>
          <p className="mt-2">Indirizzo da salvare: mizzlifc.it/pannello e mizzlifc.it/admin</p>
        </div>
      </div>
    </div>
  );
}
