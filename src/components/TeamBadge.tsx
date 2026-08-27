"use client";

import { teamInitials } from "@/lib/club-teams";

export default function TeamBadge({
  name,
  src,
  gold = false,
  size = 40,
  className = "",
}: {
  name: string;
  src?: string;
  gold?: boolean;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`team-badge ${gold ? "team-badge-gold" : ""} ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size,
        padding: size < 28 ? 1 : size < 48 ? 2 : 4,
        borderWidth: gold ? (size < 28 ? 1.5 : 2.5) : undefined,
      }}
      title={name}
    >
      {src ? (
        <img src={src} alt="" className="team-badge-img" />
      ) : (
        <span className="team-badge-fallback">{teamInitials(name)}</span>
      )}
    </span>
  );
}
