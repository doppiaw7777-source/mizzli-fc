"use client";

import { useCallback, useRef, useState } from "react";
import type { Formation, Player, TeamSettings } from "@/lib/types";
import { PlayerToken } from "@/components/PlayerKit";
import PitchBoard from "@/components/PitchBoard";

interface FormationEditorProps {
  formation: Formation;
  players: Player[];
  onUpdateSlot: (playerId: string, x: number, y: number) => void;
  settings?: Pick<TeamSettings, "logoUrl" | "appIconUrl"> | null;
  graphicId?: string;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function FormationEditor({
  formation,
  players,
  onUpdateSlot,
  settings = null,
  graphicId,
}: FormationEditorProps) {
  const pitchRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const playerMap = new Map(players.map((p) => [p.id, p]));
  const c1 = formation.pitchColor || "#2f7a3a";
  const c2 = formation.pitchColor2 || "#145528";

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number, playerId: string) => {
      const pitch = pitchRef.current;
      if (!pitch) return;
      const rect = pitch.getBoundingClientRect();
      const x = clamp(((clientX - rect.left) / rect.width) * 100, 8, 92);
      const y = clamp(((clientY - rect.top) / rect.height) * 100, 8, 92);
      onUpdateSlot(playerId, Math.round(x), Math.round(y));
    },
    [onUpdateSlot]
  );

  const onPointerDown = (playerId: string, e: React.PointerEvent) => {
    e.preventDefault();
    setDraggingId(playerId);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingId) return;
    updateFromPointer(e.clientX, e.clientY, draggingId);
  };

  const onPointerUp = () => setDraggingId(null);

  return (
    <div className="space-y-3">
      <p className="text-sm opacity-70">
        Trascina i giocatori sul campo con dito o mouse. Posizionali dove vuoi.
      </p>
      <div
        ref={pitchRef}
        className="touch-none select-none"
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <PitchBoard c1={c1} c2={c2} settings={settings}>
          {formation.starters.map((slot) => {
            const player = playerMap.get(slot.playerId);
            if (!player) return null;
            const active = draggingId === slot.playerId;
            return (
              <button
                key={slot.playerId}
                type="button"
                onPointerDown={(e) => onPointerDown(slot.playerId, e)}
                className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing ${
                  active ? "scale-110" : ""
                }`}
                style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
              >
                <PlayerToken
                  player={player}
                  captain={formation.captainId === player.id}
                  selected={active}
                  size="sm"
                  graphicId={graphicId}
                />
              </button>
            );
          })}
        </PitchBoard>
      </div>
    </div>
  );
}
