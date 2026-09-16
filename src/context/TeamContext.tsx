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

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await apiFetch("/api/team");
      if (res.ok) {
        setData(await res.json());
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
    const id = window.setInterval(tick, 20000);
    const onVis = () => tick();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
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
