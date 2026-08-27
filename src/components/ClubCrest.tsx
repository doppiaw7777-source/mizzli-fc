"use client";

import { MIZZLI_CREST, teamCrest } from "@/lib/brand";
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
  const src = teamCrest(settings) || MIZZLI_CREST;
  const framed =
    /logo/i.test(src) && !src.includes("mizzli-crest");

  return (
    <img
      src={framed ? MIZZLI_CREST : src}
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
