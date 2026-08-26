"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { teamCrest } from "@/lib/brand";
import { hapticLight } from "@/lib/native";
import { useUser } from "@/context/UserContext";
import { useTeam } from "@/context/TeamContext";

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const { data } = useTeam();
  const accountHref = user ? "/profilo" : "/accedi";
  const accountActive = ["/accedi", "/registrati", "/profilo"].includes(pathname);
  const b = data?.settings.branding;

  const items = [
    { href: "/", label: b?.homeLabel || "Home", icon: "🏠" },
    { href: "/rosa", label: b?.rosaLabel || "Rosa", icon: "👥" },
    { href: "/calendario", label: b?.calendarioLabel || "Partite", icon: "📅" },
    { href: "/convocati", label: "Lista", icon: "📋" },
    { href: accountHref, label: user ? "Tu" : "Accedi", icon: "👤" },
  ];

  const activeIndex = items.findIndex((tab) =>
    tab.href === "/"
      ? pathname === "/"
      : tab.href === accountHref
        ? accountActive
        : pathname.startsWith(tab.href)
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/75 pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl md:hidden">
      <div className="relative grid grid-cols-5">
        {activeIndex >= 0 && (
          <span
            className="bottom-pitch"
            style={{ transform: `translateX(${activeIndex * 100}%)` }}
          />
        )}
        {items.map((tab, i) => {
          const active = i === activeIndex;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => hapticLight()}
              className={`relative z-10 flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition-colors duration-300 ${
                active ? "text-[var(--team-accent)]" : "text-white/60"
              }`}
            >
              <span
                className={`nav-ball text-lg leading-none ${active ? "nav-ball-active" : ""}`}
              >
                {tab.href === "/" ? (
                  <img
                    src={teamCrest(data?.settings)}
                    alt=""
                    className="club-crest h-5 w-5"
                  />
                ) : (
                  tab.icon
                )}
              </span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
