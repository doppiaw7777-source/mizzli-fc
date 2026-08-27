"use client";

import TeamBadge from "@/components/TeamBadge";
import { clubLogo } from "@/lib/brand";
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
    <TeamBadge
      name={alt}
      src={clubLogo(settings)}
      gold
      size={size}
      className={`${glow ? "club-crest-glow" : ""} ${className}`}
    />
  );
}
