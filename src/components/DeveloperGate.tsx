"use client";

import { useCallback, useEffect, useState } from "react";
import PresenceMonitor from "@/components/PresenceMonitor";
import AuthAuditMonitor from "@/components/AuthAuditMonitor";
import { apiFetch } from "@/lib/api";
import { hapticLight } from "@/lib/native";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

export default function DeveloperGate({ onClose }: { onClose: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const submit = useCallback(async (code: string) => {
    if (code.length !== 4) return;
    setBusy(true);
    setError("");
    try {
      const res = await apiFetch("/api/auth/developer-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: code }),
      });
      if (res.ok) {
        await hapticLight();
        setUnlocked(true);
      } else {
        setError("PIN non valido");
        setPin("");
      }
    } catch {
      setError("PIN non valido");
      setPin("");
    } finally {
      setBusy(false);
    }
  }, []);

  const addDigit = useCallback(
    (d: string) => {
      if (busy || unlocked) return;
      setError("");
      setPin((prev) => {
        if (prev.length >= 4) return prev;
        const next = prev + d;
        if (next.length === 4) void submit(next);
        return next;
      });
    },
    [busy, unlocked, submit]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (unlocked || busy) return;
      if (/^[0-9]$/.test(e.key)) addDigit(e.key);
      if (e.key === "Backspace") {
        setError("");
        setPin((p) => p.slice(0, -1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [unlocked, busy, onClose, addDigit]);

  return (
    <div className="fixed inset-0 z-[90]">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Chiudi"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="absolute inset-x-3 top-[calc(env(safe-area-inset-top)+2.5rem)] mx-auto max-h-[min(86vh,48rem)] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/15 bg-[var(--team-secondary)] p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-xl font-black">Sviluppatore</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm opacity-70 hover:bg-white/10 hover:opacity-100"
          >
            Chiudi
          </button>
        </div>

        {unlocked ? (
          <div className="space-y-4">
            <PresenceMonitor />
            <AuthAuditMonitor />
          </div>
        ) : (
          <div className="mx-auto max-w-xs py-4 text-center">
            <p className="text-sm opacity-70">Inserisci il PIN per aprire il monitor.</p>
            <div className="mt-5 flex justify-center gap-3">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-4 w-4 rounded-full border ${
                    pin.length > i
                      ? "border-[var(--team-accent)] bg-[var(--team-accent)]"
                      : "border-white/40"
                  }`}
                />
              ))}
            </div>
            {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
            {busy && <p className="mt-3 text-xs opacity-60">Verifica...</p>}
            <div className="mt-6 grid grid-cols-3 gap-2">
              {KEYS.map((key, i) =>
                key === "" ? (
                  <span key={`empty-${i}`} />
                ) : (
                  <button
                    key={key}
                    type="button"
                    disabled={busy}
                    onClick={() => (key === "⌫" ? setPin((p) => p.slice(0, -1)) : addDigit(key))}
                    className="rounded-2xl bg-white/10 py-4 text-2xl font-bold hover:bg-white/20 disabled:opacity-50"
                  >
                    {key}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
