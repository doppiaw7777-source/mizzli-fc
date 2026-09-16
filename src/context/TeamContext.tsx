"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiFetch, getStoredToken } from "@/lib/api";
import type { TeamData } from "@/lib/types";

interface TeamContextValue {
  data: TeamData | null;
  loading: boolean;
  isAdmin: boolean;
  refresh: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateData: (partial: Partial<TeamData>) => Promise<boolean>;
}

const TeamContext = createContext<TeamContextValue | null>(null);

function snapshot(d: TeamData) {
  return JSON.stringify({
    c: d.club?.callupPlayerIds,
    n: d.club?.callupNote,
    m: d.club?.callupMeeting,
    f: d.formation,
    s: d.standings,
    live: d.club?.info?.liveStatus,
    score: d.club?.info?.liveScore,
    logo: d.settings?.logoUrl,
    motto: d.settings?.motto,
    players: d.players?.length,
    matches: d.matches?.length,
  });
}

function pollMs() {
  if (typeof window === "undefined") return 12000;
  return window.location.pathname.startsWith("/convocati") ? 4000 : 12000;
}

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(() => !!getStoredToken());

  const refresh = useCallback(async () => {
    try {
      const res = await apiFetch("/api/team", { cache: "no-store" });
      if (res.ok) {
        const next = (await res.json()) as TeamData;
        setData((prev) => {
          if (prev && snapshot(prev) === snapshot(next)) return prev;
          return next;
        });
      }
    } catch {
      /* keep last snapshot */
    } finally {
      setLoading(false);
    }
  }, []);

  const updateData = useCallback(async (partial: Partial<TeamData>) => {
    try {
      const res = await apiFetch("/api/team/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partial),
      });
      if (res.ok) {
        setData(await res.json());
        return true;
      }
    } catch {
      /* ignore */
    }
    return false;
  }, []);

  const checkAuth = useCallback(async () => {
    const token = getStoredToken();
    if (token) setIsAdmin(true);
    try {
      const res = await apiFetch("/api/auth/me");
      const d = await res.json();
      if (d.isAdmin === true) setIsAdmin(true);
      else if (!token) setIsAdmin(false);
    } catch {
      if (!token) setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => {});
    checkAuth().catch(() => {});
  }, [refresh, checkAuth]);

  useEffect(() => {
    let id = 0;
    const tick = () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      void refresh();
    };
    const arm = () => {
      if (id) window.clearInterval(id);
      id = window.setInterval(tick, pollMs());
    };
    arm();
    const onNav = () => arm();
    document.addEventListener("visibilitychange", tick);
    window.addEventListener("focus", tick);
    window.addEventListener("popstate", onNav);
    return () => {
      if (id) window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
      window.removeEventListener("focus", tick);
      window.removeEventListener("popstate", onNav);
    };
  }, [refresh]);

  return (
    <TeamContext.Provider
      value={{ data, loading, isAdmin, refresh, checkAuth, updateData }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error("useTeam must be used within TeamProvider");
  return ctx;
}
