"use client";

import { MIZZLI_CREST } from "@/lib/brand";
import type { TeamSettings } from "@/lib/types";

// rebuild 2026-08-27T16:33Z — live still served 15:14 bundle
export default function ClubCrest({
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
      src={MIZZLI_CREST}
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
