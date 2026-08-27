"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

const SEEN_KEY = "mizzli-notice-seen";
const ENABLED_KEY = "mizzli-notice-on";

type Notice = {
  id: string;
  title: string;
  body: string;
  href: string;
};

async function showOnDevice(n: Notice) {
  const title = n.title || "MIZZLI FC";
  const body = n.body || "";
  const url = n.href || "/";
  try {
    const reg = await navigator.serviceWorker?.ready;
    if (reg?.showNotification) {
      await reg.showNotification(title, {
        body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        data: { url },
      });
      return;
    }
  } catch {
    /* fallback */
  }
  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    new Notification(title, { body, icon: "/icon-192.png" });
  }
}

async function loadNotices(attempt = 0): Promise<Notice[]> {
  try {
    const res = await apiFetch("/api/notices");
    if (!res.ok) throw new Error("bad");
    const data = await res.json().catch(() => ({ notices: [] }));
    return data.notices || [];
  } catch {
    if (attempt >= 3) return [];
    await new Promise((r) => setTimeout(r, 400 * 2 ** attempt));
    return loadNotices(attempt + 1);
  }
}

export async function enableClubNotifications() {
  if (typeof Notification === "undefined") return false;
  const perm = await Notification.requestPermission();
  const ok = perm === "granted";
  localStorage.setItem(ENABLED_KEY, ok ? "1" : "0");
  return ok;
}

export function NotifyCenter() {
  useEffect(() => {
    let stop = false;
    const tick = async () => {
      if (stop) return;
      if (localStorage.getItem(ENABLED_KEY) !== "1") return;
      if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
      const list = await loadNotices();
      const seen = localStorage.getItem(SEEN_KEY) || "";
      const fresh = seen ? list.filter((n) => n.id !== seen).slice(0, 3) : [];
      if (list[0]) localStorage.setItem(SEEN_KEY, list[0].id);
      if (!seen) return;
      for (const n of fresh.reverse()) await showOnDevice(n);
    };
    void tick();
    const id = setInterval(() => void tick(), 25000);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, []);
  return null;
}

export function NotifyToggle() {
  const [on, setOn] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setOn(localStorage.getItem(ENABLED_KEY) === "1" && Notification?.permission === "granted");
  }, []);

  const toggle = async () => {
    setBusy(true);
    try {
      if (on) {
        localStorage.setItem(ENABLED_KEY, "0");
        setOn(false);
        return;
      }
      const ok = await enableClubNotifications();
      setOn(ok);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => void toggle()}
      className="flex w-full items-center justify-between rounded-xl border border-white/10 px-3 py-2.5 text-left hover:bg-white/10"
    >
      <span>
        <span className="block text-sm font-bold leading-tight">Notifiche</span>
        <span className="block text-xs opacity-60">
          {on ? "Avvisi convocati e news sul telefono" : "Tocca per attivarle"}
        </span>
      </span>
      <span className="text-xs font-black uppercase tracking-wide opacity-70">{on ? "On" : "Off"}</span>
    </button>
  );
}
