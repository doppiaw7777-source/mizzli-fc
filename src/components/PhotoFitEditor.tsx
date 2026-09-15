"use client";

import { useRef } from "react";
import type { Player } from "@/lib/types";
import { clampPhoto, photoFitStyle, photoFocus } from "@/lib/player-art";

export default function PhotoFitEditor({
  src,
  player,
  onChange,
}: {
  src: string;
  player: Player;
  onChange: (patch: Pick<Player, "photoFocusX" | "photoFocusY" | "photoZoom">) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; fx: number; fy: number } | null>(null);
  const { x, y, zoom } = photoFocus(player);

  const move = (clientX: number, clientY: number) => {
    const box = boxRef.current;
    const start = drag.current;
    if (!box || !start) return;
    const rect = box.getBoundingClientRect();
    const dx = ((clientX - start.x) / rect.width) * 100;
    const dy = ((clientY - start.y) / rect.height) * 100;
    onChange({
      photoFocusX: Math.round(clampPhoto(start.fx - dx, 0, 100)),
      photoFocusY: Math.round(clampPhoto(start.fy - dy, 0, 100)),
      photoZoom: zoom,
    });
  };

  return (
    <div className="space-y-2 rounded-xl border border-white/10 bg-black/25 p-3">
      <p className="text-xs font-semibold uppercase tracking-wider opacity-60">
        Inquadra la foto
      </p>
      <div
        ref={boxRef}
        className="relative h-48 w-full cursor-grab overflow-hidden rounded-xl active:cursor-grabbing"
        onPointerDown={(e) => {
          (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
          drag.current = { x: e.clientX, y: e.clientY, fx: x, fy: y };
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          move(e.clientX, e.clientY);
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
        <img
          src={src}
          alt=""
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
          style={photoFitStyle(player)}
        />
        <p className="absolute bottom-2 left-2 rounded-md bg-black/55 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide">
          Trascina per spostare
        </p>
      </div>
      <label className="block text-xs opacity-70">
        Grandezza {zoom}%
        <input
          type="range"
          min={80}
          max={280}
          step={1}
          value={zoom}
          onChange={(e) =>
            onChange({
              photoFocusX: x,
              photoFocusY: y,
              photoZoom: Number(e.target.value),
            })
          }
          className="mt-1 w-full"
        />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs opacity-70">
          Orizzontale {x}%
          <input
            type="range"
            min={0}
            max={100}
            value={x}
            onChange={(e) =>
              onChange({
                photoFocusX: Number(e.target.value),
                photoFocusY: y,
                photoZoom: zoom,
              })
            }
            className="mt-1 w-full"
          />
        </label>
        <label className="text-xs opacity-70">
          Verticale {y}%
          <input
            type="range"
            min={0}
            max={100}
            value={y}
            onChange={(e) =>
              onChange({
                photoFocusX: x,
                photoFocusY: Number(e.target.value),
                photoZoom: zoom,
              })
            }
            className="mt-1 w-full"
          />
        </label>
      </div>
      <button
        type="button"
        className="text-xs text-[var(--team-accent)] hover:underline"
        onClick={() =>
          onChange({ photoFocusX: 50, photoFocusY: 18, photoZoom: 100 })
        }
      >
        Reimposta inquadratura
      </button>
    </div>
  );
}
