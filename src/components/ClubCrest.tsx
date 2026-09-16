"use client";

import { clubLogo } from "@/lib/brand";
import { useTeam } from "@/context/TeamContext";
import type { TeamSettings } from "@/lib/types";

export default function ClubCrest({
  settings,
  size = 40,
  alt = "MIZZLI FC",
  glow = false,
  goldRing,
  className = "",
}: {
  settings?: Pick<TeamSettings, "logoUrl" | "appIconUrl"> | null;
  size?: number;
  alt?: string;
  glow?: boolean;
  goldRing?: boolean;
  className?: string;
}) {
  const { data } = useTeam();
  const allowed =
    (data?.settings?.ui as { showCrestGoldRing?: boolean } | undefined)?.showCrestGoldRing !== false;
  const ring = allowed && (goldRing ?? (glow && size >= 96));
  const img = (
    <img
      src={clubLogo(settings)}
      alt={alt}
      width={size}
      height={size}
      className={`club-crest club-crest-plain ${glow && !ring ? "club-crest-glow" : ""} ${className}`.trim()}
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

  if (!ring) return img;

  const wrap = size + 14;
  return (
    <span className="crest-gold-ring" style={{ width: wrap, height: wrap }}>
      <span className="crest-gold-ring-spin" aria-hidden />
      <span className="crest-gold-ring-inner">{img}</span>
    </span>
  );
}
