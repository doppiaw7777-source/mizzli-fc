"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { maskPhone } from "@/lib/phone";

export default function SmsCodeFields({
  phone,
  email,
  purpose,
  code,
  onCodeChange,
}: {
  phone: string;
  email?: string;
  purpose: "register" | "update";
  code: string;
  onCodeChange: (value: string) => void;
}) {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [wait, setWait] = useState(0);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (wait <= 0) return;
    const t = window.setTimeout(() => setWait((n) => Math.max(0, n - 1)), 1000);
    return () => window.clearTimeout(t);
  }, [wait]);

  const send = async () => {
    setSending(true);
    setError("");
    setStatus("");
    try {
      const res = await apiFetch("/api/auth/phone/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, email, purpose }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Invio SMS non riuscito");
        return;
      }
      setSent(true);
      setWait(Number(data.retryAfter) || 60);
      const demoCode = String(data.demoCode || "");
      if (demoCode) {
        setStatus(`Modalità demo attiva: codice ${demoCode}`);
        onCodeChange(demoCode);
      } else {
        setStatus(`SMS inviato a ${maskPhone(phone)}. Inserisci il codice.`);
      }
    } catch {
      setError("Connessione non riuscita. Riprova.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => void send()}
        disabled={sending || wait > 0}
        className="w-full rounded-xl border border-white/20 py-3 font-semibold disabled:opacity-50"
      >
        {sending
          ? "Invio SMS..."
          : wait > 0
            ? `Rinvia SMS tra ${wait}s`
            : sent
              ? "Rinvia SMS"
              : "Invia codice SMS"}
      </button>
      {sent && (
        <div>
          <label className="mb-1 block text-xs opacity-70">Codice SMS</label>
          <input
            value={code}
            onChange={(e) => onCodeChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="input-field tracking-[0.4em] text-center text-lg font-bold"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            required
          />
        </div>
      )}
      {status && <p className="text-xs text-green-300">{status}</p>}
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}
