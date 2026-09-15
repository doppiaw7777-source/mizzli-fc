"use client";

import type { CSSProperties, ReactNode } from "react";
import { teamCrest } from "@/lib/brand";
import type { TeamSettings } from "@/lib/types";

export default function PitchBoard({
  c1,
  c2,
  settings,
  children,
  className = "",
}: {
  c1: string;
  c2: string;
  settings?: Pick<TeamSettings, "logoUrl" | "appIconUrl"> | null;
  children: ReactNode;
  className?: string;
}) {
  const crest = teamCrest(settings);
  return (
    <div
      className={`pitch-board relative mx-auto aspect-[3/4] max-w-lg overflow-hidden rounded-3xl border-4 border-white/20 shadow-2xl ${className}`}
      style={{ "--pitch-a": c1, "--pitch-b": c2 } as CSSProperties}
    >
      <div className="pitch-stripes absolute inset-0" />
      <div className="pointer-events-none absolute inset-4 rounded-2xl border-2 border-white/35" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/35" />
      <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-0.5 bg-white/35" />
      <div className="pointer-events-none absolute bottom-4 left-1/2 h-[18%] w-[58%] -translate-x-1/2 rounded-t-lg border-2 border-b-0 border-white/35" />
      <div className="pointer-events-none absolute top-4 left-1/2 h-[18%] w-[58%] -translate-x-1/2 rounded-b-lg border-2 border-t-0 border-white/35" />
      <div className="pointer-events-none absolute bottom-[4px] left-1/2 h-2 w-16 -translate-x-1/2 bg-white/25" />
      <div className="pointer-events-none absolute top-[4px] left-1/2 h-2 w-16 -translate-x-1/2 bg-white/25" />
      <img src={crest} alt="" className="pitch-crest" />
      {children}
    </div>
  );
}
