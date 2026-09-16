"use client";

import { useTeam } from "@/context/TeamContext";

export default function VenueCard() {
  const { data } = useTeam();
  if (!data) return null;
  const name = data.settings.branding.stadiumName?.trim() || "";
  const note = ((data.settings.branding as { fieldNote?: string }).fieldNote || "").trim();
  const maps = ((data.settings.branding as { fieldMapsUrl?: string }).fieldMapsUrl || data.club.info.mapsUrl || "").trim();
  if (!name && !note && !maps) return null;

  return (
    <section className="rounded-2xl border border-white/10 bg-[var(--team-card-bg)] p-4 team-card">
      {name ? <h3 className="text-lg font-black tracking-tight">{name}</h3> : null}
      {note ? <p className={`whitespace-pre-wrap text-sm opacity-80 ${name ? "mt-1" : ""}`}>{note}</p> : null}
      {maps ? (
        <a
          href={maps}
          target="_blank"
          rel="noreferrer"
          className={`inline-block text-sm font-semibold text-[#d4af37] ${name || note ? "mt-2" : ""}`}
        >
          Apri posizione del campo →
        </a>
      ) : null}
    </section>
  );
}
