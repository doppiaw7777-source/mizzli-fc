"use client";

import { useState } from "react";
import Link from "next/link";
import type { Formation, Player, StaffMember, TeamSettings } from "@/lib/types";
import PlayerRatingControl from "@/components/PlayerRatingControl";
import { PlayerCardArt, PlayerKit, PlayerToken } from "@/components/PlayerKit";
import PitchBoard from "@/components/PitchBoard";
import ClubCrest from "@/components/ClubCrest";

interface FormationViewProps {
  formation: Formation;
  players: Player[];
  staff: StaffMember[];
  hidePitch?: boolean;
  matchId?: string | null;
  enableRatings?: boolean;
  settings?: Pick<TeamSettings, "logoUrl" | "appIconUrl"> | null;
}

export default function FormationView({
  formation,
  players,
  staff,
  hidePitch = false,
  matchId = null,
  enableRatings = false,
  settings = null,
}: FormationViewProps) {
  const ratingsOn = enableRatings && !!matchId;
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const playerMap = new Map(players.map((p) => [p.id, p]));
  const benchPlayers = formation.bench
    .map((id) => playerMap.get(id))
    .filter(Boolean) as Player[];
  const c1 = formation.pitchColor || "#2f7a3a";
  const c2 = formation.pitchColor2 || "#145528";
  const selected = selectedPlayerId
    ? playerMap.get(selectedPlayerId)
    : undefined;

  return (
    <div className="space-y-8">
      {ratingsOn && (
        <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm opacity-80">
          Tocca un giocatore in campo o in panchina per assegnare un voto da 1 a
          10. Tutti gli utenti loggati possono votare; vedi la media e il tuo
          voto.
        </p>
      )}

      {!hidePitch && (
        <>
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--team-accent)] px-5 py-2 text-lg font-black text-[var(--team-secondary)]">
              <ClubCrest settings={settings} size={28} alt="" />
              Modulo {formation.scheme}
            </span>
            {formation.note && (
              <p className="mt-3 text-sm opacity-80">{formation.note}</p>
            )}
          </div>

          <PitchBoard c1={c1} c2={c2} settings={settings}>
            {formation.starters.map((slot) => {
              const player = playerMap.get(slot.playerId);
              if (!player) return null;
              const isSelected = selectedPlayerId === player.id;
              return (
                <div
                  key={slot.playerId}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 ${
                    isSelected ? "z-20" : "z-10"
                  }`}
                  style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                >
                  <div className="relative">
                    {ratingsOn && (
                      <div className="absolute -top-3 left-1/2 z-20 -translate-x-1/2">
                        <PlayerRatingControl
                          matchId={matchId!}
                          playerId={player.id}
                          compact
                        />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedPlayerId(isSelected ? null : player.id)
                      }
                      className="pressable cursor-pointer"
                    >
                      <PlayerToken
                        player={player}
                        captain={formation.captainId === player.id}
                        selected={isSelected}
                        size="sm"
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </PitchBoard>
        </>
      )}

      {selected && (
        <div className="rounded-2xl border border-[var(--team-accent)]/40 bg-[var(--team-card-bg)] p-4 backdrop-blur-md">
          <div className="mb-3 flex items-center gap-3">
            <PlayerCardArt
              player={selected}
              captain={formation.captainId === selected.id}
              className="!aspect-[3/4] w-24 shrink-0"
            />
            <div className="min-w-0">
              <p className="font-bold">{selected.name}</p>
              <p className="text-sm opacity-60">
                {selected.number} · {selected.position}
              </p>
              <Link
                href={`/giocatore/${selected.id}`}
                className="text-sm text-[var(--team-accent)] underline"
              >
                Scheda giocatore
              </Link>
            </div>
            <button
              type="button"
              className="ml-auto text-sm opacity-60 hover:opacity-100"
              onClick={() => setSelectedPlayerId(null)}
            >
              Chiudi
            </button>
          </div>
          {ratingsOn && matchId && (
            <PlayerRatingControl matchId={matchId} playerId={selected.id} />
          )}
        </div>
      )}

      <div>
        <h3 className="mb-4 text-xl font-bold">
          <span className="mr-2">🪑</span>Panchina
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {benchPlayers.length === 0 ? (
            <p className="col-span-full text-center opacity-60">
              Nessun giocatore in panchina
            </p>
          ) : (
            benchPlayers.map((player, i) => {
              const isSelected = selectedPlayerId === player.id;
              return (
                <div
                  key={player.id}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left backdrop-blur-md team-card ${
                    isSelected
                      ? "border-[var(--team-accent)] bg-[var(--team-accent)]/10"
                      : "border-white/10 bg-[var(--team-card-bg)]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedPlayerId(isSelected ? null : player.id)
                    }
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <PlayerKit
                      player={player}
                      size="sm"
                      animate={i < 8}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {player.name}
                      </p>
                      <p className="text-xs opacity-60">{player.position}</p>
                    </div>
                  </button>
                  {ratingsOn && matchId && (
                    <PlayerRatingControl
                      matchId={matchId}
                      playerId={player.id}
                      compact
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-xl font-bold">
          <span className="mr-2">👔</span>Staff Tecnico
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          {staff.map((member) => (
            <div
              key={member.id}
              className="flex flex-col items-center rounded-2xl border border-white/10 bg-[var(--team-card-bg)] p-5 text-center backdrop-blur-md team-card"
            >
              {member.photoUrl ? (
                <img
                  src={member.photoUrl}
                  alt={member.name}
                  className="mb-3 h-16 w-16 rounded-full object-cover ring-2 ring-[var(--team-accent)]"
                />
              ) : (
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--team-primary)] text-lg font-black ring-2 ring-white/20">
                  {member.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)}
                </div>
              )}
              <p className="font-bold">{member.name}</p>
              <p className="text-sm text-[var(--team-accent)]">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
