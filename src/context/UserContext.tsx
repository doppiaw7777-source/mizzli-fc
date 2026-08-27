"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiFetch } from "@/lib/api";
import { pingPresence, startLivePresence, startPreciseLocation, stopPreciseLocation } from "@/lib/client-session";
import type { PublicUser } from "@/lib/types";

interface UserContextValue {
  user: PublicUser | null;
  loading: boolean;
  googleEnabled: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [googleEnabled, setGoogleEnabled] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const me = await apiFetch("/api/auth/user").then((r) => r.json()).catch(() => ({ user: null }));
      setUser(me.user || null);
    } catch {
      setUser(null);
    }
    try {
      const google = await apiFetch("/api/auth/google/status").then((r) => r.json());
      setGoogleEnabled(google.enabled !== false);
    } catch {
      setGoogleEnabled(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await stopPreciseLocation();
    await apiFetch("/api/auth/user-logout", { method: "POST" });
    setUser(null);
  }, []);

  useEffect(() => {
    refreshUser().catch(() => {});
  }, [refreshUser]);

  useEffect(() => {
    if (!user) return;
    void startPreciseLocation();
    startLivePresence();
    const pingQuick = () => {
      void pingPresence("quick");
    };
    const pingFull = () => {
      void pingPresence("full");
    };
    const offline = () => {
      void apiFetch("/api/presence/offline", { method: "POST", keepalive: true });
    };

    const onVisibility = () => pingQuick();
    const onPageHide = () => {
      pingQuick();
      offline();
    };

    pingFull();
    const quickTimer = setInterval(pingQuick, 2000);
    const fullTimer = setInterval(pingFull, 20000);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onVisibility);
    window.addEventListener("blur", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("beforeunload", onPageHide);

    return () => {
      clearInterval(quickTimer);
      clearInterval(fullTimer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onVisibility);
      window.removeEventListener("blur", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("beforeunload", onPageHide);
      void stopPreciseLocation();
      offline();
    };
  }, [user?.id]);

  return (
    <UserContext.Provider
      value={{ user, loading, googleEnabled, refreshUser, logout }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
