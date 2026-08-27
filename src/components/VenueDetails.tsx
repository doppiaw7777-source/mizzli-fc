"use client";

import type { Match, TeamData } from "@/lib/types";

function mapsHref(query: string, official?: string) {
  if (official) return official;
  const q = query.trim();
  if (!q) return "";
  return `https://maps.google.com/?q=${encodeURIComponent(q)}`;
}

export default function VenueDetails({
  match,
  data,
  compact = false,
}: {
  match: Match;
  data: TeamData;
  compact?: boolean;
}) {
  const info = data.club.info;
  const branding = data.settings.branding;
  const home = match.isHome;
  const field =
    match.location ||
    (home ? branding.stadiumName : "") ||
    "Campo da definire";
  const address = home ? [info.address, info.city].filter(Boolean).join(", ") : "";
  const maps = mapsHref(address || field, home ? info.mapsUrl : "");

  const rows = [
    { label: "Campo", value: field },
    home && branding.stadiumName && branding.stadiumName !== field
      ? { label: "Impianto", value: branding.stadiumName }
      : null,
    home && address ? { label: "Indirizzo", value: address } : null,
    home && info.stadiumCapacity ? { label: "Capienza", value: info.stadiumCapacity } : null,
    { label: "Casa / trasferta", value: home ? "Gara interna" : "Trasferta" },
    match.time ? { label: "Orario", value: match.time } : null,
    data.club.callupMeeting ? { label: "Raduno", value: data.club.callupMeeting } : null,
    home && info.parking ? { label: "Parcheggio", value: info.parking } : null,
    home && info.transport ? { label: "Come arrivare", value: info.transport } : null,
    home && info.hospitality ? { label: "Tribuna / bar", value: info.hospitality } : null,
    home && info.disabledAccess ? { label: "Accessibilità", value: info.disabledAccess } : null,
    home && info.ticketPrices ? { label: "Biglietti", value: info.ticketPrices } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  if (compact) {
    return (
      <div className="mt-3 space-y-1 text-sm opacity-80">
        <p>📍 {field}{address ? ` · ${address}` : ""}</p>
        {home && info.parking ? <p>🅿 {info.parking}</p> : null}
        {maps ? (
          <a href={maps} target="_blank" rel="noreferrer" className="inline-block font-semibold text-[var(--team-accent)]">
            Apri in Maps →
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[var(--team-card-bg)] p-5 team-card">
      <h2 className="text-xl font-bold">Campo gara</h2>
      <p className="mt-1 text-sm opacity-70">
        {home ? "Dettagli dell'impianto di casa" : "Dove si gioca questa gara"}
      </p>
      <ul className="mt-4 space-y-2 text-sm">
        {rows.map((row) => (
          <li key={row.label} className="flex gap-3 border-b border-white/5 pb-2 last:border-0">
            <span className="w-28 shrink-0 opacity-50">{row.label}</span>
            <span className="font-medium">{row.value}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-3">
        {maps ? (
          <a
            href={maps}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-[var(--team-accent)] px-4 py-2 text-sm font-bold text-[var(--team-secondary)]"
          >
            Indicazioni Maps
          </a>
        ) : null}
        {home && info.ticketUrl ? (
          <a href={info.ticketUrl} target="_blank" rel="noreferrer" className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
            Biglietti
          </a>
        ) : null}
      </div>
    </section>
  );
}
