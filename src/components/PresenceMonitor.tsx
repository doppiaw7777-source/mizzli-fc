"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import SessionDetailModal from "@/components/SessionDetailModal";
import { activityOf, appLine, lookingLine, locationLine, phoneLine, windowStateLine } from "@/lib/session-display";
import type { SessionInfo } from "@/lib/session-types";

type PresenceRow = {
  userId: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  lastSeenAt: string;
  online: boolean;
  secondsSinceSeen: number;
  session?: SessionInfo;
};

function roleLabel(role: string) {
  if (role === "admin") return "Amministratore";
  if (role === "coach") return "Mister";
  if (role === "assistant_coach") return "Vice mister";
  if (role === "team_manager") return "Dirigente";
  return "Utente";
}

function formatAgo(sec: number) {
  if (sec < 60) return `${sec}s fa`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m fa`;
  return `${Math.floor(sec / 3600)}h fa`;
}

function liveStatus(u: PresenceRow) {
  const a = activityOf(u.session);
  if (!u.online) return { label: "Offline", className: "text-zinc-400" };
  if (a?.windowState === "fuori") {
    return { label: "Fuori dall'app", className: "font-semibold text-amber-300" };
  }
  if (a?.windowState === "finestra") {
    return { label: "In finestra", className: "font-semibold text-sky-300" };
  }
  return { label: "In diretta", className: "font-semibold text-green-300" };
}

export default function PresenceMonitor() {
  const [rows, setRows] = useState<PresenceRow[]>([]);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const open = rows.find((u) => u.userId === openId) || null;

  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const res = await apiFetch("/api/presence/status");
        if (!res.ok) {
          setError("Non autorizzato al monitor presenze");
          return;
        }
        const data = await res.json();
        if (!stop) {
          setError("");
          setRows(data.users || []);
        }
      } catch {
        if (!stop) setError("Monitor non disponibile");
      }
    };

    load();
    const t = setInterval(load, 1000);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, []);

  return (
    <div className="rounded-2xl border border-white/10 bg-[var(--team-card-bg)] p-4">
      <h3 className="text-lg font-bold">Monitor utenti online</h3>
      <p className="mt-1 text-xs opacity-60">
        In diretta: schermata, tasti toccati, se è in primo piano, in finestra o ha lasciato l&apos;app.
      </p>
      {error ? (
        <p className="mt-2 text-sm text-red-300">{error}</p>
      ) : rows.length === 0 ? (
        <p className="mt-2 text-sm opacity-60">Nessun utente monitorato.</p>
      ) : (
        <div className="mt-3 space-y-2 text-sm">
          {rows.map((u) => {
            const status = liveStatus(u);
            const activity = activityOf(u.session);
            return (
              <button
                key={u.userId}
                type="button"
                onClick={() => setOpenId(u.userId)}
                className="flex w-full items-start justify-between gap-3 rounded-lg bg-black/20 px-3 py-2 text-left hover:bg-black/30"
              >
                <div className="min-w-0">
                  <p className="font-semibold">
                    {u.name} <span className="opacity-60">({roleLabel(u.role)})</span>
                  </p>
                  <p className="mt-1 text-sm font-bold text-[var(--team-accent)]">
                    {lookingLine(u.session)}
                  </p>
                  <p className="truncate text-xs opacity-80">{windowStateLine(u.session)}</p>
                  {activity?.lastAction && (
                    <p className="truncate text-xs opacity-70">Ultimo gesto: {activity.lastAction}</p>
                  )}
                  <p className="text-xs opacity-60">{u.email}</p>
                  <p className="text-xs font-semibold text-[var(--team-accent)]">
                    {phoneLine(u.session, u.phone)}
                  </p>
                  <p className="truncate text-xs opacity-70">{locationLine(u.session)}</p>
                  <p className="truncate text-xs opacity-80">
                    {u.session?.phoneModelExact || appLine(u.session)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={status.className}>{status.label}</p>
                  <p className="text-xs opacity-60">{formatAgo(u.secondsSinceSeen)}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
      {open && (
        <SessionDetailModal
          title={open.name}
          subtitle={`${roleLabel(open.role)} · ${open.email} · ${liveStatus(open).label} · visto ${formatAgo(open.secondsSinceSeen)}`}
          session={open.session}
          extra={{
            userId: open.userId,
            phone: open.phone || open.session?.phoneNumber || "",
            lastSeenAt: new Date(open.lastSeenAt).toLocaleString("it-IT"),
            online: open.online,
            looking: lookingLine(open.session),
          }}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  );
}
