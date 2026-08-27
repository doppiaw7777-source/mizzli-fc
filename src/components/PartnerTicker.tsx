"use client";

import { useMemo } from "react";
import type { Sponsor } from "@/lib/types";
import { partnerSponsors } from "@/lib/sponsors";

const PLACEHOLDERS: Sponsor[] = [
  { id: "ph1", name: "Il tuo logo qui", logoUrl: "", website: "/contatti" },
  { id: "ph2", name: "Diventa partner", logoUrl: "", website: "/contatti" },
  { id: "ph3", name: "Sostieni MIZZLI", logoUrl: "", website: "/contatti" },
  { id: "ph4", name: "Spazio disponibile", logoUrl: "", website: "/contatti" },
];

function loopItems(items: Sponsor[], min = 16) {
  if (!items.length) return [];
  const out: Sponsor[] = [];
  while (out.length < min) out.push(...items);
  return out;
}

function Chip({ sponsor }: { sponsor: Sponsor }) {
  const label = sponsor.name.trim() || "Partner";
  const inner = (
    <span className="partner-chip">
      {sponsor.logoUrl ? (
        <img src={sponsor.logoUrl} alt={label} draggable={false} />
      ) : (
        <span className="partner-chip-name">{label}</span>
      )}
    </span>
  );
  if (!sponsor.website) return inner;
  const external = sponsor.website.startsWith("http");
  return (
    <a
      href={sponsor.website}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="partner-chip-link"
      title={label}
    >
      {inner}
    </a>
  );
}

function Row({
  items,
  reverse,
}: {
  items: Sponsor[];
  reverse?: boolean;
}) {
  const loop = loopItems(items);
  return (
    <div className={`partner-row ${reverse ? "is-reverse" : ""}`}>
      <div className="partner-track">
        <div className="partner-set">
          {loop.map((s, i) => (
            <Chip key={`${s.id}-a-${i}`} sponsor={s} />
          ))}
        </div>
        <div className="partner-set" aria-hidden>
          {loop.map((s, i) => (
            <Chip key={`${s.id}-b-${i}`} sponsor={s} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PartnerTicker({
  sponsors,
  title,
}: {
  sponsors: Sponsor[];
  title?: string;
}) {
  const items = useMemo(() => partnerSponsors(sponsors), [sponsors]);
  const show = items.length ? items : PLACEHOLDERS;
  const mid = Math.ceil(show.length / 2) || 1;
  const rowA = show.length > 6 ? show.slice(0, mid) : show;
  const rowB = show.length > 6 ? show.slice(mid) : [...show].reverse();

  return (
    <section className="partner-ticker" aria-label={title || "Partner"}>
      <div className="partner-ticker-head">
        <p className="partner-ticker-label">{title || "Partner"}</p>
        <p className="partner-ticker-hint">
          {items.length
            ? `${items.length} realtà al fianco della squadra`
            : "Unisciti alla famiglia MIZZLI — il tuo logo qui"}
        </p>
      </div>
      <Row items={rowA} />
      <Row items={rowB} reverse />
    </section>
  );
}
