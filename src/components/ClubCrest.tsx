"use client";

import { teamCrest } from "@/lib/brand";
import type { TeamSettings } from "@/lib/types";

export default function ClubCrest({
  settings,
  size = 40,
  alt = "MIZZLI FC",
  glow = false,
  className = "",
}: {
  settings?: Pick<TeamSettings, "logoUrl" | "appIconUrl"> | null;
  size?: number;
  alt?: string;
  glow?: boolean;
  className?: string;
}) {
  return (
    <img
      src={teamCrest(settings)}
      alt={alt}
      width={size}
      height={size}
      className={`club-crest ${glow ? "club-crest-glow" : ""} ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
