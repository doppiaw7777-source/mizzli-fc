"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import SectionPage, { SoftCard } from "@/components/SectionPage";
import { useTeam } from "@/context/TeamContext";
import { matchPublicTitle } from "@/lib/match-kind";

export default function CercaPage() {
  const { data } = useTeam();
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const results = useMemo(() => {
    if (!data || query.length < 2) return { players: [], matches: [], news: [] };
    return {
      players: data.players.filter((p) => p.name.toLowerCase().includes(query) || String(p.number) === query),
      matches: data.matches.filter(
        (m) =>
          matchPublicTitle(m).toLowerCase().includes(query) ||
          m.opponent.toLowerCase().includes(query) ||
          m.competition.toLowerCase().includes(query) ||
          (m.location || "").toLowerCase().includes(query)
      ),
      news: data.announcements.filter((n) => n.title.toLowerCase().includes(query) || n.description.toLowerCase().includes(query)),
    };
  }, [data, query]);
  if (!data) return null;

  return (
    <AppShell page="altro">
      <SectionPage title="Cerca" subtitle="Giocatori, avversari, news">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cerca..."
          className="input-field"
        />
        {query.length >= 2 && (
          <div className="space-y-4">
            <SoftCard>
              <h2 className="mb-2 font-bold">Giocatori</h2>
              {results.players.length === 0 ? (
                <p className="text-sm opacity-60">Nessuno</p>
              ) : (
                results.players.map((p) => (
                  <Link key={p.id} href={`/giocatore/${p.id}`} className="block py-1">
                    {p.number}. {p.name}
                  </Link>
                ))
              )}
            </SoftCard>
            <SoftCard>
              <h2 className="mb-2 font-bold">Partite</h2>
              {results.matches.length === 0 ? (
                <p className="text-sm opacity-60">Nessuna</p>
              ) : (
                results.matches.map((m) => (
                  <Link key={m.id} href={`/partita/${m.id}`} className="block py-1">
                    {matchPublicTitle(m)} · {m.date}
                  </Link>
                ))
              )}
            </SoftCard>
            <SoftCard>
              <h2 className="mb-2 font-bold">News</h2>
              {results.news.length === 0 ? (
                <p className="text-sm opacity-60">Nessuna</p>
              ) : (
                results.news.map((n) => (
                  <p key={n.id} className="py-1">
                    {n.title}
                  </p>
                ))
              )}
            </SoftCard>
          </div>
        )}
      </SectionPage>
    </AppShell>
  );
}
