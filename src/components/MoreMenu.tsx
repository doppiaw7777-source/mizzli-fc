"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { menuGroupsForUser } from "@/lib/menu";
import { hapticLight } from "@/lib/native";
import { playClickSound, setSoundEnabled } from "@/lib/sound";
import { useUser } from "@/context/UserContext";

function useClientMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export default function MoreMenu() {
  const [open, setOpen] = useState(false);
  const mounted = useClientMounted();
  const pathname = usePathname();
  const [menuPath, setMenuPath] = useState(pathname);
  const { user } = useUser();

  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const groups = menuGroupsForUser(user);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          hapticLight();
          setOpen(true);
        }}
        className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10"
        aria-label="Altro"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span className="flex flex-col items-center gap-[3px]" aria-hidden>
          <span className="h-[4px] w-[4px] rounded-full bg-current" />
          <span className="h-[4px] w-[4px] rounded-full bg-current" />
          <span className="h-[4px] w-[4px] rounded-full bg-current" />
        </span>
      </button>

      {mounted &&
        open &&
        createPortal(
        <div className="fixed inset-0 z-[80] more-overlay-in">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="Chiudi"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="more-menu-title"
            className="more-sheet-in absolute right-3 top-[calc(env(safe-area-inset-top)+3.5rem)] w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-3xl border border-white/15 bg-[var(--team-secondary)]/95 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <h2 id="more-menu-title" className="text-lg font-black">
                Altro
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-1 text-sm opacity-70 hover:bg-white/10 hover:opacity-100"
              >
                Chiudi
              </button>
            </div>
            <div className="max-h-[min(70vh,32rem)] space-y-5 overflow-y-auto p-4">
              {groups.map((group) => (
                <section key={group.title}>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] opacity-50">
                    {group.title}
                  </p>
                  <div className="grid gap-1">
                    {group.items.map((item) => {
                      const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => hapticLight()}
                          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                            active
                              ? "bg-[var(--team-accent)] text-[var(--team-secondary)]"
                              : "hover:bg-white/10"
                          }`}
                        >
                          <span className="text-xl">{item.icon}</span>
                          <span className="min-w-0">
                            <span className="block text-sm font-bold leading-tight">{item.title}</span>
                            <span className="block truncate text-xs opacity-60">{item.desc}</span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ))}
              <SoundToggle />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

function SoundToggle() {
  const [on, setOn] = useState(true);

  return (
    <button
      type="button"
      data-silent
      onClick={() => {
        const next = !on;
        setSoundEnabled(next);
        setOn(next);
        hapticLight();
        if (next) void playClickSound("tap");
      }}
      className="flex w-full items-center justify-between rounded-xl border border-white/10 px-3 py-2.5 text-left hover:bg-white/10"
    >
      <span>
        <span className="block text-sm font-bold leading-tight">Suoni dei tap</span>
        <span className="block text-xs opacity-60">
          {on ? "Click e navigazione con audio" : "Audio disattivato"}
        </span>
      </span>
      <span className="text-xs font-black uppercase tracking-wide opacity-70">{on ? "On" : "Off"}</span>
    </button>
  );
}
