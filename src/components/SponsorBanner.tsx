"use client";

import { useEffect, useMemo, useRef, useState, type Ref } from "react";
import type { Sponsor } from "@/lib/types";

function visibleSponsors(list: Sponsor[]) {
  return list.filter((s) => s.logoUrl || s.name.trim());
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

function SponsorSet({
  items,
  setRef,
  hidden,
}: {
  items: Sponsor[];
  setRef?: Ref<HTMLDivElement>;
  hidden?: boolean;
}) {
  return (
    <div
      className="sponsor-marquee-set"
      ref={setRef}
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
  const items = useMemo(() => visibleSponsors(sponsors), [sponsors]);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);
  const [copies, setCopies] = useState(2);
  const hasLogos = items.some((s) => s.logoUrl);
  const shouldScroll = items.length > 0 && (hasLogos || items.length > 2);

  useEffect(() => {
    if (!shouldScroll) {
      setCopies(1);
      return;
    }
    const viewport = viewportRef.current;
    const setEl = setRef.current;
    if (!viewport || !setEl) return;

    const measure = () => {
      const width = setEl.scrollWidth;
      const view = viewport.clientWidth;
      if (width < 8) return;
      setCopies(Math.max(2, Math.ceil((view + 40) / width) + 1));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(viewport);
    ro.observe(setEl);
    const images = [...setEl.querySelectorAll("img")];
    images.forEach((img) => {
      img.addEventListener("load", measure);
      img.addEventListener("error", measure);
    });
    return () => {
      ro.disconnect();
      images.forEach((img) => {
        img.removeEventListener("load", measure);
        img.removeEventListener("error", measure);
      });
    };
  }, [items, shouldScroll]);

  useEffect(() => {
    const track = trackRef.current;
    const setEl = setRef.current;
    const viewport = viewportRef.current;
    if (!shouldScroll || !track || !setEl || !viewport) {
      if (track) track.style.transform = "translate3d(0,0,0)";
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let x = 0;
    let started = false;
    let paused = false;
    let last = performance.now();
    const speed = 42;

    const pause = () => {
      paused = true;
    };
    const resume = () => {
      paused = false;
    };
    viewport.addEventListener("pointerenter", pause);
    viewport.addEventListener("pointerleave", resume);

    const loop = (now: number) => {
      const gap = Number.parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
      const width = setEl.getBoundingClientRect().width + gap;
      if (width > 8) {
        if (!started) {
          x = -width;
          started = true;
        }
        if (!paused) {
          const dt = Math.min(0.05, (now - last) / 1000);
          x += speed * dt;
          if (x >= 0) x -= width;
        }
        track.style.transform = `translate3d(${x}px,0,0)`;
      }
      last = now;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      viewport.removeEventListener("pointerenter", pause);
      viewport.removeEventListener("pointerleave", resume);
    };
  }, [shouldScroll, copies, items]);

  if (!items.length) return null;

  return (
    <section className={`sponsor-marquee${shouldScroll ? "" : " is-static"}`} aria-label={title || "Sponsor"}>
      <p className="sponsor-marquee-label">{title || "Sponsor"}</p>
      <div className="sponsor-marquee-viewport" ref={viewportRef}>
        <div className="sponsor-marquee-track" ref={trackRef}>
          <SponsorSet items={items} setRef={setRef} />
          {shouldScroll
            ? Array.from({ length: copies - 1 }, (_, i) => (
                <SponsorSet key={`copy-${i}`} items={items} hidden />
              ))
            : null}
        </div>
      </div>
    </section>
  );
}
