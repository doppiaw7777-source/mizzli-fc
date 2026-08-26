"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CALLUP_ROLE_LABELS,
  CALLUP_VISIBLE_DAYS,
  callupDaysLeft,
  isCallupLive,
  publishCallups,
  sortCalledPlayers,
} from "@/lib/club";
import { canEditCallups } from "@/lib/roles";
import { hapticLight } from "@/lib/native";
import { groupPlayersByRole, roleLabels } from "@/components/PlayerCard";
import { PlayerCardArt, PlayerKit, PlayerToken } from "@/components/PlayerKit";
import ClubCrest from "@/components/ClubCrest";
import { useTeam } from "@/context/TeamContext";
import { useUser } from "@/context/UserContext";
import type { Player } from "@/lib/types";

export function CallupGrid({
  players,
  captainId,
  compact = false,
}: {
  players: Player[];
  captainId?: string;
  compact?: boolean;
}) {
  if (players.length === 0) {
    return (
      <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-center text-sm opacity-60">
        Nessun convocato in lista.
      </p>
    );
  }
  return (
    <div
      className={`grid gap-3 ${
        compact
          ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-6"
          : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
      }`}
    >
      {players.map((p, i) => (
        <Link
          key={p.id}
          href={`/giocatore/${p.id}`}
          className="pressable block"
        >
          <PlayerCardArt
            player={p}
            captain={captainId === p.id}
            delay={Math.min(i * 40, 280)}
          />
        </Link>
      ))}
    </div>
  );
}

export function CallupStrip({ players, captainId }: { players: Player[]; captainId?: string }) {
  return (
    <div className="flex flex-wrap justify-center gap-x-2 gap-y-3">
      {players.map((p) => (
        <Link key={p.id} href={`/giocatore/${p.id}`} className="pressable">
          <PlayerToken
            player={p}
            captain={captainId === p.id}
            size="sm"
          />
        </Link>
      ))}
    </div>
  );
}

export function CallupTable({
  players,
}: {
  players: Player[];
  emptyRows?: number;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[var(--team-card-bg)] team-card">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-xs uppercase tracking-wider opacity-60">
            <th className="px-3 py-3 font-semibold"> </th>
            <th className="px-3 py-3 font-semibold">N°</th>
            <th className="px-3 py-3 font-semibold">Nome</th>
            <th className="px-3 py-3 font-semibold">Ruolo</th>
            <th className="px-3 py-3 font-semibold">Posizione</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p) => (
            <tr key={p.id} className="border-b border-white/5">
              <td className="px-2 py-1.5">
                <PlayerKit player={p} size="xs" animate={false} />
              </td>
              <td className="px-3 py-2.5 font-black text-[var(--team-accent)]">
                {p.number}
              </td>
              <td className="px-3 py-2.5 font-semibold">
                <Link href={`/giocatore/${p.id}`} className="hover:underline">
                  {p.name}
                </Link>
              </td>
              <td className="px-3 py-2.5 opacity-80">
                {CALLUP_ROLE_LABELS[p.role] || p.role}
              </td>
              <td className="px-3 py-2.5 opacity-70">{p.position}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CallupBoard() {
  const { data, isAdmin, updateData } = useTeam();
  const { user } = useUser();
  const canEdit = isAdmin || canEditCallups(user);
  const [saving, setSaving] = useState(false);
  const [listView, setListView] = useState(false);

  if (!data) return null;

  const live = isCallupLive(data.club);
  const daysLeft = callupDaysLeft(data.club);
  const visibleIds = canEdit || live ? data.club.callupPlayerIds : [];
  const called = sortCalledPlayers(data.players, visibleIds);
  const groups = groupPlayersByRole(data.players);
  const captainId = data.formation.captainId;

  const toggle = async (playerId: string) => {
    if (!canEdit || saving) return;
    const on = data.club.callupPlayerIds.includes(playerId);
    const ids = on
      ? data.club.callupPlayerIds.filter((id) => id !== playerId)
      : [...data.club.callupPlayerIds, playerId];
    setSaving(true);
    void hapticLight();
    try {
      await updateData({
        club: {
          ...data.club,
          ...publishCallups(ids),
        },
      });
    } finally {
      setSaving(false);
    }
  };

  const clearAll = async () => {
    if (!canEdit || saving || data.club.callupPlayerIds.length === 0) return;
    setSaving(true);
    try {
      await updateData({
        club: {
          ...data.club,
          ...publishCallups([]),
        },
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-start gap-3">
            <ClubCrest settings={data.settings} size={52} glow />
            <div>
              <h2 className="text-xl font-bold">Lista convocati</h2>
              {called.length > 0 && live && (
                <p className="mt-1 text-sm opacity-70">
                  {called.length} convocati · in Home ancora {daysLeft}{" "}
                  {daysLeft === 1 ? "giorno" : "giorni"}
                </p>
              )}
              {canEdit && called.length > 0 && !live && (
                <p className="mt-1 text-sm text-amber-300">
                  Lista scaduta: pubblicala di nuovo per {CALLUP_VISIBLE_DAYS}{" "}
                  giorni in Home.
                </p>
              )}
              {!canEdit && !live && (
                <p className="mt-1 text-sm opacity-60">
                  Nessuna lista pubblicata in questo momento.
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {called.length > 0 && (
              <button
                type="button"
                onClick={() => setListView((v) => !v)}
                className="text-sm text-[var(--team-accent)] hover:underline"
              >
                {listView ? "Vista grafiche" : "Vista tabella"}
              </button>
            )}
            {canEdit && called.length > 0 && (
              <>
                {!live && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      updateData({
                        club: {
                          ...data.club,
                          ...publishCallups(data.club.callupPlayerIds),
                        },
                      })
                    }
                    className="text-sm text-[var(--team-accent)] hover:underline"
                  >
                    Pubblica in Home
                  </button>
                )}
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-sm text-red-400 hover:underline"
                >
                  Svuota tabella
                </button>
              </>
            )}
          </div>
        </div>
        {data.club.callupMeeting && (
          <p className="text-sm opacity-70">📍 {data.club.callupMeeting}</p>
        )}
        {listView ? (
          <CallupTable players={called} />
        ) : (
          <CallupGrid players={called} captainId={captainId} />
        )}
      </div>

      {canEdit ? (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold">Rosa</h2>
            <p className="mt-1 text-sm opacity-70">
              Tocca un giocatore per inserirlo nella lista. I convocati restano
              in Home per {CALLUP_VISIBLE_DAYS} giorni.
              {saving ? " Salvataggio…" : ""}
            </p>
          </div>
          {(["POR", "DIF", "CEN", "ATT"] as const).map((role) => {
            const list = groups[role] || [];
            if (list.length === 0) return null;
            return (
              <section key={role}>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider opacity-60">
                  {roleLabels[role]}
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {list.map((p) => {
                    const on = data.club.callupPlayerIds.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        disabled={saving}
                        onClick={() => toggle(p.id)}
                        className={`pressable flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                          on
                            ? "border-[var(--team-accent)] bg-[var(--team-accent)]/15"
                            : "border-white/10 bg-white/5 hover:border-white/30"
                        }`}
                      >
                        <PlayerKit player={p} size="sm" animate={false} />
                        <span className="min-w-0">
                          <span className="block font-semibold">{p.name}</span>
                          <span className="text-sm opacity-60">{p.position}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <p className="text-sm opacity-50">
          Solo l&apos;allenatore può selezionare i convocati dalla rosa.
        </p>
      )}
    </div>
  );
}

export function HomeCallupCard() {
  const { data, isAdmin } = useTeam();
  const { user } = useUser();
  if (!data) return null;
  const canEdit = isAdmin || canEditCallups(user);
  const live = isCallupLive(data.club);
  const called = sortCalledPlayers(data.players, data.club.callupPlayerIds);
  const daysLeft = callupDaysLeft(data.club);
  const show = called.length > 0 && (live || canEdit);

  return (
    <section className="space-y-4 rounded-2xl border border-[var(--team-accent)]/30 bg-[var(--team-card-bg)] p-5 team-card">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/convocati"
          className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[var(--team-accent)]"
        >
          <ClubCrest settings={data.settings} size={28} alt="" />
          Convocati
        </Link>
        {live ? (
          <p className="text-xs opacity-60">
            in evidenza ancora {daysLeft} {daysLeft === 1 ? "giorno" : "giorni"}
          </p>
        ) : (
          <p className="text-xs opacity-60">Apri la lista</p>
        )}
      </div>
      {show ? (
        <CallupStrip players={called} captainId={data.formation.captainId} />
      ) : (
        <p className="text-sm opacity-70">
          {data.club.callupNote || "Lista convocati della prossima gara."}
        </p>
      )}
      {data.club.callupMeeting && (
        <p className="text-sm opacity-70">📍 {data.club.callupMeeting}</p>
      )}
      <Link href="/convocati" className="inline-block text-sm text-[var(--team-accent)]">
        Apri la lista completa →
      </Link>
    </section>
  );
}
