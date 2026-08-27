"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import AdminPanel from "@/components/AdminPanel";
import { apiFetch, setStoredToken } from "@/lib/api";
import { collectClientSnapshot, pingPresence, startLivePresence, startPreciseLocation, stopPreciseLocation } from "@/lib/client-session";
import { hapticLight } from "@/lib/native";
import { useTeam } from "@/context/TeamContext";
import type { TeamData } from "@/lib/types";

export default function AdminPage() {
  const { data, refresh, checkAuth } = useTeam();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setAuthenticated(d.authenticated))
      .catch(() => setAuthenticated(false));
    void startPreciseLocation();
  }, []);

  useEffect(() => {
    if (!authenticated) return;
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
  }, [authenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const device = await Promise.race([
        collectClientSnapshot(0).catch(() => ({})),
        new Promise<Record<string, never>>((resolve) =>
          setTimeout(() => resolve({}), 1200)
        ),
      ]);
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
          pin: pin.trim(),
          device,
        }),
      });
      const d = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(d.error || "Login fallito");
        return;
      }
      if (d.token) setStoredToken(d.token);
      setAuthenticated(true);
      void hapticLight();
      void checkAuth();
      void refresh();
    } catch {
      setError("Connessione non riuscita. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    setStoredToken(null);
    setAuthenticated(false);
    await checkAuth();
    router.refresh();
  };

  const handleSave = async (teamData: TeamData) => {
    const res = await apiFetch("/api/team/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(teamData),
    });
    if (res.ok) {
      await hapticLight();
      await refresh();
      router.refresh();
    }
    return res.ok;
  };

  if (authenticated === null) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#0b0614]">
        <p className="opacity-70">Verifica accesso...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <AppShell page="admin">
        <div className="mx-auto max-w-md">
          <div className="rounded-2xl border border-white/10 bg-[var(--team-card-bg)] p-5 backdrop-blur-md sm:p-8">
            <h1 className="mb-2 text-center text-3xl font-black">🔐 Admin</h1>
            <p className="mb-6 text-center text-sm opacity-60">
              Entra solo se conosci utente, password e PIN.
            </p>

            <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
              <div>
                <label className="mb-1 block text-xs opacity-70">Utente</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field min-h-11"
                  placeholder="Utente"
                  autoComplete="username"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs opacity-70">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field min-h-11"
                  placeholder="Password"
                  autoComplete="current-password"
                  required
                />
              </div>


              <div>
                <label className="mb-1 block text-xs opacity-70">PIN Admin</label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="input-field min-h-11"
                  placeholder="PIN"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  required
                />
              </div>

              {error && (
                <p className="text-center text-sm text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[var(--team-accent)] py-3 font-bold text-[var(--team-secondary)] transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Accesso..." : "Accedi"}
              </button>
            </form>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#0b0614]">
        <p className="opacity-70">Caricamento pannello...</p>
      </div>
    );
  }

  return (
    <AppShell page="admin">
      <div className="space-y-6">
        <AdminPanel data={data} onSave={handleSave} onLogout={handleLogout} />
      </div>
    </AppShell>
  );
}
