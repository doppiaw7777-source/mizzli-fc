"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import FormationView from "@/components/FormationView";
import { useTeam } from "@/context/TeamContext";
import { useUser } from "@/context/UserContext";
import type { Match } from "@/lib/types";
import { isLeagueFixture, matchPublicTitle } from "@/lib/match-kind";
import { canEditFormation } from "@/lib/roles";

function matchLabel(m: Match) {
  if (!isLeagueFixture(m)) {
    return `${m.date} · ${matchPublicTitle(m)}`;
  }
  const vs = m.isHome ? `vs ${m.opponent}` : `@ ${m.opponent}`;
  return `${m.date} · ${vs}${m.result ? ` (${m.result})` : ""}`;
}

function FormazioneContent() {
  const { data, isAdmin } = useTeam();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const initialMatch = searchParams.get("matchId") || "";
  const [matchId, setMatchId] = useState(initialMatch);

  const matches = useMemo(() => {
    if (!data) return [];
    return [...data.matches].sort((a, b) =>
      `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`)
    );
  }, [data]);

  if (!data) return null;

  const branding = data.settings.branding;
  const selectedMatch = matches.find((m) => m.id === matchId) || null;

  return (
    <div className="space-y-6">
      <div>
        <p className="page-kicker">Tattica</p>
        <h1 className="mt-2 flex items-center gap-3 text-4xl font-black tracking-tight">
          <img
            src={data.settings.logoUrl || "/brand/mizzli-crest.png"}
            alt=""
            className="club-crest h-12 w-12"
          />
          {branding.formazioneTitle || "Formazione Ufficiale"}
        </h1>
        <p className="mt-2 max-w-xl opacity-70">
          Titolari, panchina e staff. Scegli una partita per votare i giocatori
          da 1 a 10.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <label className="mb-2 block text-sm font-semibold opacity-80">
          Partita da votare
        </label>
        <select
          className="w-full rounded-xl border border-white/15 bg-[var(--team-secondary)] px-3 py-2.5 text-sm"
          value={matchId}
          onChange={(e) => setMatchId(e.target.value)}
        >
          <option value="">— Solo visualizza formazione —</option>
          {matches.map((m) => (
            <option key={m.id} value={m.id}>
              {matchLabel(m)}
            </option>
          ))}
        </select>
        {selectedMatch && (
          <p className="mt-2 text-sm opacity-70">
            Voti per{" "}
            <Link
              href={`/partita/${selectedMatch.id}`}
              className="font-semibold text-[var(--team-accent)] underline"
            >
              {matchLabel(selectedMatch)}
            </Link>
            . Tocca i giocatori per votare.
          </p>
        )}
      </div>

      {(isAdmin || canEditFormation(user)) && (
        <Link
          href={isAdmin ? "/admin" : "/staff"}
          className="inline-flex rounded-xl bg-[var(--team-accent)] px-5 py-2 font-bold text-[var(--team-secondary)]"
        >
          {isAdmin ? "Modifica formazione in Admin" : "Modifica formazione in Area staff"}
        </Link>
      )}

      <FormationView
        formation={data.formation}
        players={data.players}
        staff={data.staff}
        matchId={selectedMatch?.id}
        enableRatings={!!selectedMatch}
        settings={data.settings}
      />
    </div>
  );
}

export default function FormazionePage() {
  return (
    <AppShell page="formazione">
      <Suspense fallback={<p className="opacity-70">Caricamento…</p>}>
        <FormazioneContent />
      </Suspense>
    </AppShell>
  );
}
