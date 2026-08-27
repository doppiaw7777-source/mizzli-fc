"use client";

import { useMemo } from "react";
import type { Sponsor } from "@/lib/types";
import { MAX_SPONSORS, visibleSponsors } from "@/lib/sponsors";

const LOOP_MIN = 12;

function loopItems(items: Sponsor[]) {
  if (!items.length) return [];
  const out: Sponsor[] = [];
  while (out.length < LOOP_MIN) out.push(...items);
  return out;
}

function SponsorChip({ sponsor }: { sponsor: Sponsor }) {
  const label = sponsor.name.trim() || "Sponsor";
  const inner = (
    <span className="sponsor-chip">
      {sponsor.logoUrl ? (
        <img src={sponsor.logoUrl} alt={label} draggable={false} />
      ) : (
        <span className="sponsor-chip-name">{label}</span>
      )}
    </span>
  );

  if (!sponsor.website) return inner;
  return (
    <a
      href={sponsor.website}
      target="_blank"
      rel="noreferrer"
      className="sponsor-chip-link"
      title={label}
    >
      {inner}
    </a>
  );
}

function SponsorGroup({ items, hidden }: { items: Sponsor[]; hidden?: boolean }) {
  return (
    <div
      className="sponsor-marquee-set"
      aria-hidden={hidden || undefined}
      {...(hidden ? { inert: true } : {})}
    >
      {items.map((sponsor, i) => (
        <SponsorChip key={`${sponsor.id}-${i}`} sponsor={sponsor} />
      ))}
    </div>
  );
}

export default function SponsorBanner({
  sponsors,
  title,
}: {
  sponsors: Sponsor[];
  title?: string;
}) {
  const items = useMemo(
    () => visibleSponsors(sponsors).slice(0, MAX_SPONSORS),
    [sponsors]
  );
  const loop = useMemo(() => loopItems(items), [items]);

  if (!items.length) return null;

  return (
    <section className="sponsor-marquee" aria-label={title || "Sponsor"}>
      <p className="sponsor-marquee-label">{title || "Sponsor"}</p>
      <div className="sponsor-marquee-viewport">
        <div className="sponsor-marquee-track">
          <SponsorGroup items={loop} />
          <SponsorGroup items={loop} hidden />
        </div>
      </div>
    </section>
  );
}
