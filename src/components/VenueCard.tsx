"use client";

import { useTeam } from "@/context/TeamContext";

export default function VenueCard() {
  const { data } = useTeam();
  if (!data) return null;
  const name = data.settings.branding.stadiumName?.trim() || "";
  const note = (data.settings.branding.fieldNote || "").trim();
  const maps = (data.settings.branding.fieldMapsUrl || data.club.info.mapsUrl || "").trim();
  if (!name && !note && !maps) return null;

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[var(--team-card-bg)] team-card">
      <div className="relative h-28 bg-gradient-to-b from-[#1a1030] to-[#0b0614]">
        <svg viewBox="0 0 400 120" className="absolute inset-0 h-full w-full" aria-hidden>
          <ellipse cx="200" cy="78" rx="150" ry="28" fill="#14532d" />
          <ellipse cx="200" cy="78" rx="70" ry="14" fill="none" stroke="#86efac" strokeWidth="2" opacity="0.7" />
          <path d="M50 78 Q50 40 200 32 Q350 40 350 78" fill="none" stroke="#d4af37" strokeWidth="4" />
          <path d="M70 76 Q70 48 200 42 Q330 48 330 76" fill="#2e1065" opacity="0.85" />
          <rect x="188" y="18" width="24" height="16" rx="2" fill="#d4af37" />
        </svg>
      </div>
      <div className="space-y-2 p-4">
        {name ? <h3 className="text-lg font-black tracking-tight">{name}</h3> : null}
        {note ? <p className="whitespace-pre-wrap text-sm opacity-80">{note}</p> : null}
        {maps ? (
          <a
            href={maps}
            target="_blank"
            rel="noreferrer"
            className="inline-block text-sm font-semibold text-[#d4af37]"
          >
            Apri posizione del campo →
          </a>
        ) : null}
      </div>
    </section>
  );
}
