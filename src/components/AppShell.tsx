"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { ThemeStyles, PageBackground } from "@/components/ThemeProvider";
import { useTeam } from "@/context/TeamContext";
import PageMotion, { MatchMinuteBar } from "@/components/PageMotion";
import AssistantChat from "@/components/AssistantChat";
import { teamCrest } from "@/lib/brand";
import { notePath } from "@/lib/live-activity";

export default function AppShell({
  children,
  page,
}: {
  children: React.ReactNode;
  page: "home" | "rosa" | "calendario" | "formazione" | "admin" | "altro";
}) {
  const { data, loading, refresh } = useTeam();
  const pathname = usePathname();

  useEffect(() => {
    notePath(pathname);
  }, [pathname]);

  if (!loading && !data) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#0b0614] px-6 text-center">
        <div>
          <img
            src="/brand/mizzli-crest.png"
            alt="MIZZLI FC"
            className="club-crest mx-auto mb-4 h-24 w-24"
          />
          <p className="font-bold">Non riesco a caricare la squadra.</p>
          <button
            type="button"
            onClick={() => refresh()}
            className="mt-4 rounded-xl bg-[var(--team-accent,#f4f0ff)] px-5 py-2 font-bold text-[#0b0614]"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#0b0614]">
        <div className="text-center">
          <img
            src={teamCrest(data?.settings)}
            alt=""
            className="club-crest club-crest-glow mx-auto mb-4 h-24 w-24"
          />
          <p className="text-sm font-semibold uppercase tracking-[0.22em] opacity-60">
            Caricamento
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ThemeStyles settings={data.settings} />
      <MatchMinuteBar />
      <PageBackground settings={data.settings} page={page}>
        <Navbar settings={data.settings} />
        <main
          className={`mx-auto max-w-7xl px-4 pt-8 ${
            page === "admin"
              ? "pb-[calc(11rem+env(safe-area-inset-bottom,0px))] md:pb-8"
              : "pb-[calc(3.75rem+env(safe-area-inset-bottom,0px))] md:pb-8"
          }`}
        >
          <PageMotion>{children}</PageMotion>
        </main>
        {data.settings.ui.showBottomNav && <BottomNav />}
        <AssistantChat />
      </PageBackground>
    </>
  );
}
