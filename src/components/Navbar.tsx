"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { TeamSettings } from "@/lib/types";
import { useUser } from "@/context/UserContext";
import { useTeam } from "@/context/TeamContext";
import MoreMenu from "@/components/MoreMenu";
import { teamCrest } from "@/lib/brand";
import { isLiveActive } from "@/lib/match-live";
import { ROLE_LABELS, canAccessStaff, isFanRole } from "@/lib/roles";

export default function Navbar({ settings }: { settings: TeamSettings }) {
  const pathname = usePathname();
  const isGlass = settings.navStyle === "glass";
  const { user } = useUser();
  const { data, isAdmin } = useTeam();
  const staff = canAccessStaff(user);
  const showAdmin = !user || (isAdmin && !isFanRole(user.role));
  const liveOn = isLiveActive(
    data?.club.matchLives?.find((item) => item.matchId === data.club.info.liveMatchId) ||
      data?.club.matchLives?.find((item) => item.status === "live" || item.status === "ht")
  );
  const b = settings.branding;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/", label: b.homeLabel || "Home" },
    { href: "/rosa", label: b.rosaLabel || "Rosa" },
    { href: "/calendario", label: b.calendarioLabel || "Calendario" },
    { href: "/formazione", label: b.formazioneLabel || "Formazione" },
    { href: "/convocati", label: "Convocati" },
  ];

  return (
    <nav
      className={`nav-compact sticky top-0 z-50 border-b pt-[env(safe-area-inset-top)] ${
        isGlass
          ? "border-white/10 bg-black/30 backdrop-blur-xl"
          : "border-[var(--team-primary)] bg-[var(--team-secondary)]"
      } ${scrolled ? "nav-scrolled bg-black/55 backdrop-blur-2xl" : ""}`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <img
              src={teamCrest(settings)}
              alt="MIZZLI FC"
              className="club-crest h-11 w-11 transition-transform duration-300 hover:rotate-6"
            />
            <div className="min-w-0">
              <p className="truncate text-lg font-bold leading-tight">
                {settings.teamName}
              </p>
              {settings.ui.showMotto && (
                <p className="truncate text-xs opacity-70">{settings.motto}</p>
              )}
            </div>
          </Link>
          <a
            href="/instagram"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white"
            aria-label="@mizzlifc su Instagram"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
              <rect x="2" y="2" width="20" height="20" rx="6" fill="#E4405F" />
              <circle cx="12" cy="12" r="4.2" fill="none" stroke="#fff" strokeWidth="1.8" />
              <circle cx="17.2" cy="6.8" r="1.15" fill="#fff" />
            </svg>
          </a>
          {liveOn && (
            <Link
              href="/live"
              className="flex items-center gap-1.5 rounded-full bg-red-500/20 px-3 py-1.5 text-xs font-black tracking-wide text-red-300"
            >
              <span className="live-dot" />
              LIVE
            </Link>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <div className="hidden items-center gap-1 md:flex">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    active
                      ? "bg-[var(--team-accent)] text-[var(--team-secondary)] shadow-[0_8px_20px_rgba(0,0,0,0.25)]"
                      : "hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {staff && user && (
              <Link
                href="/staff"
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  pathname === "/staff"
                    ? "bg-[var(--team-accent)] text-[var(--team-secondary)] shadow-[0_8px_20px_rgba(0,0,0,0.25)]"
                    : "hover:bg-white/10"
                }`}
              >
                {ROLE_LABELS[user.role]}
              </Link>
            )}
            {showAdmin && (
              <Link
                href="/admin"
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  pathname === "/admin"
                    ? "bg-[var(--team-accent)] text-[var(--team-secondary)] shadow-[0_8px_20px_rgba(0,0,0,0.25)]"
                    : "hover:bg-white/10"
                }`}
              >
                Admin
              </Link>
            )}
            <Link
              href={user ? "/profilo" : "/accedi"}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                pathname === "/accedi" || pathname === "/profilo" || pathname === "/registrati"
                  ? "bg-[var(--team-accent)] text-[var(--team-secondary)] shadow-[0_8px_20px_rgba(0,0,0,0.25)]"
                  : "hover:bg-white/10"
              }`}
            >
              {user ? user.name.split(" ")[0] : "Accedi"}
            </Link>
          </div>
          <MoreMenu />
        </div>
      </div>
    </nav>
  );
}
