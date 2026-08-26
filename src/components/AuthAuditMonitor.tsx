"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import SessionDetailModal from "@/components/SessionDetailModal";
import { appLine, locationLine, phoneLine } from "@/lib/session-display";
import type { SessionInfo } from "@/lib/session-types";

type Row = {
  at: string;
  channel: "admin" | "user";
  identifier: string;
  ok: boolean;
  role: string;
  reason?: string;
  phone?: string;
  ip?: string;
  userAgent?: string;
  passwordUsed: string;
  session?: SessionInfo;
};

function roleLabel(role: string) {
  if (role === "admin") return "Amministratore";
  if (role === "coach") return "Mister";
  if (role === "assistant_coach") return "Vice mister";
  if (role === "team_manager") return "Dirigente";
  return "Utente";
}

export default function AuthAuditMonitor() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<Row | null>(null);

  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const res = await apiFetch("/api/auth/audit");
        if (!res.ok) {
          if (!stop) setError("Non autorizzato ai log accessi");
          return;
        }
        const data = await res.json();
        if (!stop) {
          setError("");
          setRows(data.logs || []);
        }
      } catch {
        if (!stop) setError("Log accessi non disponibili");
      }
    };

    load();
    const t = setInterval(load, 2000);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, []);

  return (
    <div className="rounded-2xl border border-white/10 bg-[var(--team-card-bg)] p-4">
      <h3 className="text-lg font-bold">Log accessi (live)</h3>
      <p className="mt-1 text-xs opacity-60">
        Tocca un accesso per posizione, app e ogni dato. La password non viene salvata in chiaro.
      </p>
      {error ? (
        <p className="mt-2 text-sm text-red-300">{error}</p>
      ) : rows.length === 0 ? (
        <p className="mt-2 text-sm opacity-60">Nessun accesso registrato.</p>
      ) : (
        <div className="mt-3 space-y-2 text-sm">
          {rows.map((x, i) => (
            <button
              key={`${x.at}-${i}`}
              type="button"
              onClick={() => setOpen(x)}
              className="w-full rounded-lg bg-black/20 px-3 py-2 text-left hover:bg-black/30"
            >
              <p className={x.ok ? "text-green-300" : "text-red-300"}>
                {x.ok ? "Accesso riuscito" : "Accesso fallito"} · {roleLabel(x.role)}
              </p>
              <p className="text-xs opacity-70">
                {x.identifier} · {new Date(x.at).toLocaleString("it-IT")} · canale {x.channel}
              </p>
              <p className="text-xs font-semibold text-[var(--team-accent)]">
                {phoneLine(x.session, x.phone)}
              </p>
              <p className="truncate text-xs opacity-70">{locationLine(x.session)}</p>
              <p className="truncate text-xs font-semibold opacity-90">
                {x.session?.phoneModelExact || appLine(x.session)}
              </p>
            </button>
          ))}
        </div>
      )}
      {open && (
        <SessionDetailModal
          title={open.ok ? "Accesso riuscito" : "Accesso fallito"}
          subtitle={`${open.identifier} · ${roleLabel(open.role)} · ${new Date(open.at).toLocaleString("it-IT")}`}
          session={
            open.session ||
            (open.ip || open.userAgent
              ? { ip: open.ip || "sconosciuto", userAgent: open.userAgent || "sconosciuto" }
              : null)
          }
          extra={{
            identifier: open.identifier,
            phone: open.phone || open.session?.phoneNumber || "",
            role: open.role,
            channel: open.channel,
            ok: open.ok,
            reason: open.reason,
            passwordUsed: open.passwordUsed,
            at: new Date(open.at).toLocaleString("it-IT"),
          }}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}
