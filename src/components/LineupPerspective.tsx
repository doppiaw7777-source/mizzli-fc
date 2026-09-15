"use client";

import type { CSSProperties, ReactNode } from "react";
import { teamCrest } from "@/lib/brand";
import type { TeamSettings } from "@/lib/types";

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
      className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-[#120818] shadow-2xl"
      style={{ "--pitch-a": c1, "--pitch-b": c2 } as CSSProperties}
    >
      <svg viewBox="0 0 100 133" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="grass3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c1} />
            <stop offset="50%" stopColor={c2} />
            <stop offset="100%" stopColor={c1} />
          </linearGradient>
        </defs>
        <polygon points="8,6 92,6 72,127 28,127" fill="url(#grass3)" />
        <g fill="none" stroke="rgba(255,255,255,0.42)" strokeWidth="0.45">
          <polygon points="8,6 92,6 72,127 28,127" />
          <line x1="50" y1="6" x2="50" y2="127" />
          <ellipse cx="50" cy="64" rx="10" ry="7.2" />
          <path d="M18,24 H82" />
          <path d="M27,24 Q50,38 73,24" />
          <path d="M32,24 H68 V14 H32 Z" />
          <path d="M22,108 H78" />
          <path d="M33,108 Q50,96 67,108" />
          <path d="M38,127 H62 V118 H38 Z" />
        </g>
      </svg>
      <img src={crest} alt="" className="pointer-events-none absolute left-[11%] top-[7%] h-8 w-8 object-contain drop-shadow" />
      <img src={crest} alt="" className="pointer-events-none absolute right-[11%] top-[7%] h-8 w-8 object-contain drop-shadow" />
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}
