"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import PlayerRatingControl from "@/components/PlayerRatingControl";
import { PlayerCardArt } from "@/components/PlayerKit";
import SectionPage, { SoftCard } from "@/components/SectionPage";
import { playerAge } from "@/lib/club";
import { useTeam } from "@/context/TeamContext";
import type { Match } from "@/lib/types";
import { isLeagueFixture, matchPublicTitle } from "@/lib/match-kind";

function matchLabel(m: Match) {
  if (!isLeagueFixture(m)) {
    return `${m.date} · ${matchPublicTitle(m)}`;
  }
  const vs = m.isHome ? `vs ${m.opponent}` : `@ ${m.opponent}`;
  return `${m.date} · ${vs}${m.result ? ` (${m.result})` : ""}`;
}

function GiocatoreContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { data } = useTeam();
  const [matchId, setMatchId] = useState(searchParams.get("matchId") || "");

  const matches = useMemo(() => {
    if (!data) return [];
    return [...data.matches].sort((a, b) =>
      `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`)
    );
  }, [data]);

  if (!data) return null;
  const player = data.players.find((p) => p.id === id);
  if (!player) {
    return (
      <p>
        Giocatore non trovato. <Link href="/rosa">Torna alla rosa</Link>
      </p>
    );
  }
  const isCaptain = data.formation.captainId === player.id;
  const club = data.club.info;
  const selectedMatch = matches.find((m) => m.id === matchId) || null;

  return (
    <SectionPage
      title={player.name}
      subtitle={`${player.position} · ${player.nationality}`}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <SoftCard className="text-center md:col-span-1">
          <div className="mx-auto max-w-[220px]">
            <PlayerCardArt player={player} captain={isCaptain} />
          </div>
          <p className="mt-3 text-sm opacity-70">{player.role}</p>
          {isCaptain && (
            <p className="mt-1 font-bold text-[var(--team-accent)]">Capitano</p>
          )}
          {player.status && player.status !== "available" && (
            <p className="mt-2 text-sm text-red-300">{player.status}</p>
          )}
        </SoftCard>
        <SoftCard className="md:col-span-2">
          <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
            <Stat k="Età" v={playerAge(player.birthDate)} />
            <Stat k="Gol" v={String(player.stats.goals)} />
            <Stat k="Assist" v={String(player.stats.assists)} />
            <Stat k="Presenze" v={String(player.stats.appearances)} />
            <Stat k="Minuti" v={String(player.minutes || 0)} />
            <Stat k="Gialli" v={String(player.yellowCards || 0)} />
            <Stat k="Rossi" v={String(player.redCards || 0)} />
            <Stat k="MOTM" v={String(player.motm || 0)} />
            <Stat k="Piede" v={player.foot || "—"} />
            <Stat k="Altezza" v={player.height || "—"} />
            <Stat k="Peso" v={player.weight || "—"} />
            <Stat k="N." v={String(player.number)} />
          </div>
        </SoftCard>
      </div>

      <SoftCard>
        <h2 className="font-bold">Voto partita (1–10)</h2>
        <p className="mt-1 text-sm opacity-70">
          Scegli la partita e assegna il tuo voto. La media è visibile a tutti.
        </p>
        <select
          className="mt-3 w-full rounded-xl border border-white/15 bg-[var(--team-secondary)] px-3 py-2.5 text-sm"
          value={matchId}
          onChange={(e) => setMatchId(e.target.value)}
        >
          <option value="">— Seleziona partita —</option>
          {matches.map((m) => (
            <option key={m.id} value={m.id}>
              {matchLabel(m)}
            </option>
          ))}
        </select>
        {selectedMatch ? (
          <div className="mt-4">
            <p className="mb-2 text-sm opacity-70">
              Partita:{" "}
              <Link
                href={`/partita/${selectedMatch.id}`}
                className="text-[var(--team-accent)] underline"
              >
                {matchLabel(selectedMatch)}
              </Link>
            </p>
            <PlayerRatingControl
              matchId={selectedMatch.id}
              playerId={player.id}
            />
          </div>
        ) : (
          <p className="mt-3 text-sm opacity-60">
            Seleziona una partita per votare questo giocatore.
          </p>
        )}
      </SoftCard>

      {player.bio && (
        <SoftCard>
          <h2 className="font-bold">Biografia</h2>
          <p className="mt-2 whitespace-pre-wrap opacity-80">{player.bio}</p>
        </SoftCard>
      )}
      {player.previousClubs && (
        <SoftCard>
          <h2 className="font-bold">Club precedenti</h2>
          <p className="mt-2 opacity-80">{player.previousClubs}</p>
        </SoftCard>
      )}
      <SoftCard>
        <h2 className="font-bold">Ruoli speciali</h2>
        <p className="mt-2 text-sm opacity-80">
          {club.penaltyTakerId === player.id ? "Rigori · " : ""}
          {club.freeKickTakerId === player.id ? "Punizioni · " : ""}
          {club.cornerTakerId === player.id ? "Calci d'angolo · " : ""}
          {club.viceCaptainId === player.id ? "Vice capitano" : ""}
          {club.penaltyTakerId !== player.id &&
          club.freeKickTakerId !== player.id &&
          club.cornerTakerId !== player.id &&
          club.viceCaptainId !== player.id
            ? "Nessun incarico speciale"
            : ""}
        </p>
      </SoftCard>
    </SectionPage>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl bg-white/5 p-3">
      <p className="text-xs opacity-50">{k}</p>
      <p className="font-bold">{v}</p>
    </div>
  );
}

export default function GiocatorePage() {
  return (
    <AppShell page="rosa">
      <Suspense fallback={<p className="opacity-70">Caricamento…</p>}>
        <GiocatoreContent />
      </Suspense>
    </AppShell>
  );
}
