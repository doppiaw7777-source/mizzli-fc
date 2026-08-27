"use client";

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
    <img
      src={clubLogo(settings)}
      alt={alt}
      width={size}
      height={size}
      className={`club-crest club-crest-plain ${glow ? "club-crest-glow" : ""} ${className}`.trim()}
      style={{
        width: size,
        height: size,
        background: "transparent",
        border: "none",
        boxShadow: "none",
        borderRadius: "50%",
        objectFit: "contain",
      }}
    />
  );
}
