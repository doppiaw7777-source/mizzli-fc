"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useTeam } from "@/context/TeamContext";

import { MIZZLI_CREST, teamCrest } from "@/lib/brand";

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function KickoffBurst({ show, logo }: { show: boolean; logo: string }) {
  if (!show) return null;
  return (
    <div className="kickoff-burst" aria-hidden>
      <span className="kickoff-glow" />
      <img src={logo || MIZZLI_CREST} alt="" className="kickoff-logo" />
    </div>
  );
}

export function MatchMinuteBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const bar = barRef.current;
    if (!bar) return;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      bar.style.transform = `scaleX(${p})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="match-minute" aria-hidden>
      <div ref={barRef} className="match-minute-fill" />
    </div>
  );
}

function shouldPlayKickoff() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (window.location.pathname !== "/") return false;
  try {
    if (sessionStorage.getItem("mizzli-kickoff")) return false;
    sessionStorage.setItem("mizzli-kickoff", "1");
    return true;
  } catch {
    return false;
  }
}

export default function PageMotion({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data } = useTeam();
  const mainRef = useRef<HTMLDivElement>(null);
  const [burst, setBurst] = useState(false);
  const logo = teamCrest(data?.settings);

  useEffect(() => {
    if (!shouldPlayKickoff()) return;
    const start = window.setTimeout(() => setBurst(true), 30);
    const stop = window.setTimeout(() => setBurst(false), 920);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(stop);
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  useLayoutEffect(() => {
    const root = mainRef.current;
    if (!root) return;
    if (prefersReducedMotion()) return;

    const nodes = Array.from(
      root.querySelectorAll<HTMLElement>("section, .team-card, h1")
    );
    if (nodes.length < 2) {
      nodes.push(
        ...Array.from(root.querySelectorAll<HTMLElement>(":scope > * > *"))
      );
    }
    const unique = [...new Set(nodes)].filter(
      (node) =>
        !node.classList.contains("sponsor-marquee") &&
        !node.closest(".kickoff-burst, nav, .match-minute, .sponsor-marquee")
    );

    unique.forEach((node, i) => {
      node.classList.add("reveal-kick");
      node.style.setProperty("--reveal-delay", `${Math.min(i * 32, 240)}ms`);
      const rect = node.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) {
        node.classList.add("is-in");
      }
    });

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.08, rootMargin: "40px 0px 15% 0px" }
    );
    unique.forEach((node) => {
      if (!node.classList.contains("is-in")) io.observe(node);
    });

    const fallback = window.setTimeout(() => {
      unique.forEach((node) => node.classList.add("is-in"));
    }, 1400);

    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, [pathname]);

  return (
    <div className="page-motion">
      <KickoffBurst show={burst} logo={logo} />
      <div key={pathname} ref={mainRef} className="page-kick">
        {children}
      </div>
    </div>
  );
}
