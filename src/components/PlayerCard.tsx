"use client";

import type { Player } from "@/lib/types";
import { PlayerKit } from "@/components/PlayerKit";
import { playerPhoto } from "@/lib/player-art";

const roleLabels: Record<string, string> = {
  POR: "Portieri",
  DIF: "Difensori",
  CEN: "Centrocampisti",
  ATT: "Attaccanti",
};

const statusLabels: Record<string, string> = {
  injured: "Infortunato",
  suspended: "Squalificato",
  unavailable: "Indisponibile",
};

export default function PlayerCard({ player }: { player: Player }) {
  const status = player.status && player.status !== "available" ? player.status : null;
  const art = playerPhoto(player);
  return (
    <div className="group overflow-hidden rounded-xl border border-white/10 bg-[var(--team-card-bg)] backdrop-blur-md team-card">
      <div className="relative flex h-44 items-end justify-center overflow-hidden">
        <img
          src={art}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-2 right-2">
          <PlayerKit player={player} size="sm" animate={false} photoHead={false} />
        </div>
        <div className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--team-accent)] text-sm font-black text-[var(--team-secondary)] shadow-lg">
          {player.number}
        </div>
        {status && (
          <span className="absolute right-3 top-3 rounded-full bg-red-600/95 px-2 py-1 text-[10px] font-bold uppercase tracking-wide shadow">
            {statusLabels[status]}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-bold tracking-tight">{player.name}</h3>
        <p className="text-[11px] uppercase tracking-wide opacity-55">{player.position}</p>
        <div className="mt-2 grid grid-cols-3 gap-1 text-center text-[11px]">
          <div className="rounded-md bg-white/5 p-1.5">
            <p className="font-bold text-[var(--team-accent)]">{player.stats.goals}</p>
            <p className="opacity-60">Gol</p>
          </div>
          <div className="rounded-md bg-white/5 p-1.5">
            <p className="font-bold text-[var(--team-accent)]">{player.stats.assists}</p>
            <p className="opacity-60">Assist</p>
          </div>
          <div className="rounded-md bg-white/5 p-1.5">
            <p className="font-bold text-[var(--team-accent)]">{player.stats.appearances}</p>
            <p className="opacity-60">Pres.</p>
          </div>
        </div>
        <p className="mt-2 text-xs opacity-50">
          {player.nationality} · {new Date(player.birthDate).toLocaleDateString("it-IT")}
        </p>
      </div>
    </div>
  );
}

export function groupPlayersByRole(players: Player[]) {
  const groups: Record<string, Player[]> = { POR: [], DIF: [], CEN: [], ATT: [] };
  for (const p of players) {
    groups[p.role]?.push(p);
  }
  return groups;
}

export { roleLabels };
