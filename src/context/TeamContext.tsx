"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiFetch } from "@/lib/api";
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

function sameCallup(a: TeamData | null, b: TeamData) {
  if (!a) return false;
  const ac = a.club;
  const bc = b.club;
  return (
    JSON.stringify(ac?.callupPlayerIds || []) === JSON.stringify(bc?.callupPlayerIds || []) &&
    (ac?.callupNote || "") === (bc?.callupNote || "") &&
    (ac?.callupMeeting || "") === (bc?.callupMeeting || "") &&
    JSON.stringify(a.formation) === JSON.stringify(b.formation) &&
    JSON.stringify(a.standings) === JSON.stringify(b.standings)
  );
}

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await apiFetch("/api/team", { cache: "no-store" });
      if (res.ok) {
        const next = (await res.json()) as TeamData;
        setData((prev) => {
          if (prev && sameCallup(prev, next) && JSON.stringify(prev) === JSON.stringify(next)) {
            return prev;
          }
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
    try {
      const res = await apiFetch("/api/auth/me");
      const d = await res.json();
      setIsAdmin(d.isAdmin === true);
    } catch {
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => {});
    checkAuth().catch(() => {});
  }, [refresh, checkAuth]);

  useEffect(() => {
    const tick = () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      void refresh();
    };
    const id = window.setInterval(tick, 4000);
    document.addEventListener("visibilitychange", tick);
    window.addEventListener("focus", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
      window.removeEventListener("focus", tick);
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
