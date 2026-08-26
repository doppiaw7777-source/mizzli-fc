"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Config = {
  enabled: boolean;
  fromNumber: string;
  accountSid: string;
  hasAuthToken: boolean;
  hasTextbeltKey: boolean;
  configured: boolean;
};

export default function SmsTab() {
  const [config, setConfig] = useState<Config | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [textbeltKey, setTextbeltKey] = useState("");
  const [accountSid, setAccountSid] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [fromNumber, setFromNumber] = useState("");
  const [testTo, setTestTo] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let stop = false;
    const load = async () => {
      const res = await apiFetch("/api/sms/config");
      if (stop) return;
      if (!res.ok) {
        setStatus("Entra come admin per collegare gli SMS.");
        return;
      }
      const data = (await res.json()) as Config;
      if (stop) return;
      setConfig(data);
      setEnabled(data.enabled);
      setAccountSid(data.accountSid);
      setFromNumber(data.fromNumber);
    };
    void load();
    return () => {
      stop = true;
    };
  }, []);

  const save = async () => {
    setSaving(true);
    setStatus("");
    const res = await apiFetch("/api/sms/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled, textbeltKey, accountSid, authToken, fromNumber }),
    });
    setSaving(false);
    if (!res.ok) {
      setStatus("Salvataggio non riuscito.");
      return;
    }
    const data = (await res.json()) as Config;
    setAuthToken("");
    setTextbeltKey("");
    setConfig(data);
    setEnabled(data.enabled);
    setAccountSid(data.accountSid);
    setFromNumber(data.fromNumber);
    setStatus("SMS salvato.");
  };

  const test = async () => {
    setStatus("Invio prova...");
    const res = await apiFetch("/api/sms/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: testTo }),
    });
    const data = await res.json().catch(() => ({}));
    setStatus(data.message || data.error || "Fatto");
  };

  if (!config) {
    return <p className="text-sm opacity-70">{status || "Caricamento SMS..."}</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">SMS di verifica</h2>
        <p className="mt-1 text-sm opacity-70">
          In registrazione il cellulare riceve un codice. Senza quel codice l&apos;account non si crea.
        </p>
      </div>

      <p className={`text-sm ${config.configured ? "text-green-300" : "text-amber-300"}`}>
        {config.configured ? "Invio SMS attivo." : "Invio SMS spento."}
      </p>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        Invio SMS attivo
      </label>

      <label className="block space-y-1">
        <span className="text-xs opacity-70">
          Chiave SMS {config.hasTextbeltKey ? "(già salvata, lascia vuoto per non cambiarla)" : "(opzionale, per più invii)"}
        </span>
        <input
          type="password"
          value={textbeltKey}
          onChange={(e) => setTextbeltKey(e.target.value)}
          className="input-field"
          autoComplete="off"
        />
      </label>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="block space-y-1 md:col-span-2">
          <span className="text-xs opacity-70">Twilio Account SID (opzionale)</span>
          <input value={accountSid} onChange={(e) => setAccountSid(e.target.value)} className="input-field" />
        </label>
        <label className="block space-y-1 md:col-span-2">
          <span className="text-xs opacity-70">
            Twilio Auth Token {config.hasAuthToken ? "(già salvato, lascia vuoto per non cambiarlo)" : ""}
          </span>
          <input
            type="password"
            value={authToken}
            onChange={(e) => setAuthToken(e.target.value)}
            className="input-field"
            autoComplete="off"
          />
        </label>
        <label className="block space-y-1 md:col-span-2">
          <span className="text-xs opacity-70">Numero mittente Twilio (opzionale)</span>
          <input value={fromNumber} onChange={(e) => setFromNumber(e.target.value)} className="input-field" />
        </label>
      </div>

      <button type="button" onClick={() => void save()} disabled={saving} className="btn-add">
        {saving ? "Salvo..." : "Salva SMS"}
      </button>

      <div className="space-y-3 rounded-2xl border border-white/10 p-4">
        <h3 className="font-bold">Prova invio</h3>
        <input
          value={testTo}
          onChange={(e) => setTestTo(e.target.value)}
          className="input-field"
          placeholder="+39 333 123 4567"
        />
        <button type="button" onClick={() => void test()} className="rounded-xl bg-white/10 px-4 py-2 text-sm">
          Invia SMS di prova
        </button>
      </div>

      {status && <p className="text-sm opacity-80">{status}</p>}
    </div>
  );
}
