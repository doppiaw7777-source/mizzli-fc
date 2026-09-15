"use client";

import type { CSSProperties, ReactNode } from "react";
import { teamCrest } from "@/lib/brand";
import type { TeamSettings } from "@/lib/types";

/** Maps flat pitch % (x,y) onto a trapezoid like a broadcast lineup graphic. */
export function slotToPerspective(x: number, y: number) {
  const t = Math.min(1, Math.max(0, y / 100));
  const topW = 96;
  const botW = 58;
  const width = topW + (botW - topW) * t;
  const left = (100 - width) / 2;
  const px = left + (x / 100) * width;
  const py = 8 + t * 80;
  const scale = 0.82 + t * 0.28;
  return { left: px, top: py, scale };
}

export default function LineupPerspective({
  c1,
  c2,
  settings,
  children,
}: {
  c1: string;
  c2: string;
  settings?: Pick<TeamSettings, "logoUrl" | "appIconUrl"> | null;
  children: ReactNode;
}) {
  const crest = teamCrest(settings);
  return (
    <div
      className="relative mx-auto aspect-[4/5] w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 shadow-2xl"
      style={
        {
          "--pitch-a": c1,
          "--pitch-b": c2,
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(40,20,70,0.45), transparent 55%), linear-gradient(180deg, #1a1030 0%, #0b0614 100%)",
        } as CSSProperties
      }
    >
      <svg viewBox="0 0 100 125" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </linearGradient>
          <clipPath id="trap">
            <polygon points="4,8 96,8 79,116 21,116" />
          </clipPath>
        </defs>
        <polygon points="4,8 96,8 79,116 21,116" fill="url(#grass)" />
        <g clipPath="url(#trap)" stroke="rgba(255,255,255,0.38)" fill="none" strokeWidth="0.55">
          <polygon points="4,8 96,8 79,116 21,116" />
          <line x1="50" y1="8" x2="50" y2="116" />
          <ellipse cx="50" cy="62" rx="11" ry="8" />
          <path d="M18,28 H82" />
          <path d="M28,28 Q50,42 72,28" />
          <path d="M24,100 H76" />
          <path d="M32,100 Q50,88 68,100" />
          <path d="M34,116 H66 V108 H34 Z" />
          <path d="M30,8 H70 V16 H30 Z" />
        </g>
      </svg>
      <img
        src={crest}
        alt=""
        className="pointer-events-none absolute left-[8%] top-[6%] h-10 w-10 object-contain opacity-90 drop-shadow-lg"
      />
      <img
        src={crest}
        alt=""
        className="pointer-events-none absolute right-[8%] top-[6%] h-10 w-10 object-contain opacity-90 drop-shadow-lg"
      />
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}
