"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Config = {
  enabled: boolean;
  phone: string;
  allowedFrom: string[];
  ingestToken: string;
  verifyToken: string;
  cloudPhoneNumberId: string;
  hasCloudToken: boolean;
  webhookUrl: string;
  ingestUrl: string;
  waLink: string;
  log: { at: string; from: string; text: string; ok: boolean; detail: string }[];
};

export default function WhatsAppTab() {
  const [config, setConfig] = useState<Config | null>(null);
  const [phone, setPhone] = useState("");
  const [allowed, setAllowed] = useState("");
  const [cloudToken, setCloudToken] = useState("");
  const [phoneId, setPhoneId] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [testText, setTestText] = useState("risultato 2-1");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const res = await apiFetch("/api/whatsapp/config");
    if (!res.ok) {
      setStatus("Entra come admin per collegare WhatsApp.");
      return;
    }
    const data = (await res.json()) as Config;
    setConfig(data);
    setPhone(data.phone);
    setAllowed(data.allowedFrom.join("\n"));
    setPhoneId(data.cloudPhoneNumberId);
    setEnabled(data.enabled);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- initial config fetch
      load().catch(() => {});
    }
  }, [load, loaded]);

  const save = async () => {
    setSaving(true);
    setStatus("");
    const res = await apiFetch("/api/whatsapp/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enabled,
        phone,
        allowedFrom: allowed
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        cloudAccessToken: cloudToken,
        cloudPhoneNumberId: phoneId,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      setStatus("Salvataggio non riuscito.");
      return;
    }
    setCloudToken("");
    setStatus("Collegamento salvato.");
    await load();
  };

  const test = async () => {
    setStatus("Invio prova...");
    const res = await apiFetch("/api/whatsapp/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: testText }),
    });
    const data = await res.json();
    setStatus(data.message || data.error || "Fatto");
    await load();
  };

  const copy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setStatus("Copiato.");
  };

  if (!config) {
    return <p className="text-sm opacity-70">{status || "Caricamento collegamento WhatsApp..."}</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">WhatsApp → risultati automatici</h2>
        <p className="mt-1 text-sm opacity-70">
          Scrivi il risultato su WhatsApp e l&apos;app aggiorna da sola la partita in Calendario e in Home.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        Automazione attiva
      </label>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-xs opacity-70">Numero WhatsApp Business (con prefisso, es. 393331112233)</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" />
        </label>
        <label className="block space-y-1">
          <span className="text-xs opacity-70">Phone Number ID Meta</span>
          <input value={phoneId} onChange={(e) => setPhoneId(e.target.value)} className="input-field" />
        </label>
        <label className="block space-y-1 md:col-span-2">
          <span className="text-xs opacity-70">
            Token permanente WhatsApp Cloud API {config.hasCloudToken ? "(già salvato, lascia vuoto per non cambiarlo)" : ""}
          </span>
          <input
            value={cloudToken}
            onChange={(e) => setCloudToken(e.target.value)}
            className="input-field"
            placeholder="EAAG..."
          />
        </label>
        <label className="block space-y-1 md:col-span-2">
          <span className="text-xs opacity-70">Numeri autorizzati a scrivere i risultati (uno per riga). Vuoto = accetta tutti.</span>
          <textarea
            value={allowed}
            onChange={(e) => setAllowed(e.target.value)}
            className="input-field min-h-20"
            placeholder="393331112233"
          />
        </label>
      </div>

      <button type="button" onClick={save} disabled={saving} className="btn-add">
        {saving ? "Salvo..." : "Salva collegamento"}
      </button>

      <div className="space-y-3 rounded-2xl border border-white/10 p-4">
        <h3 className="font-bold">1. Collegamento ufficiale Meta WhatsApp</h3>
        <ol className="list-decimal space-y-2 pl-5 text-sm opacity-80">
          <li>Apri Meta for Developers → la tua App → WhatsApp → Configurazione.</li>
          <li>In Webhook incolla questo URL e il verify token, poi iscriviti a <b>messages</b>.</li>
          <li>Copia Phone Number ID e token permanente qui sopra e salva.</li>
          <li>Dal telefono dell&apos;allenatore scrivi al numero Business: <b>risultato 2-1</b>.</li>
        </ol>
        <CopyRow label="URL webhook" value={config.webhookUrl} onCopy={copy} />
        <CopyRow label="Verify token" value={config.verifyToken} onCopy={copy} />
      </div>

      <div className="space-y-3 rounded-2xl border border-white/10 p-4">
        <h3 className="font-bold">2. Collegamento rapido Make / Zapier / Twilio</h3>
        <p className="text-sm opacity-80">
          Se WhatsApp Business API non è ancora attiva, collega WhatsApp a questo URL HTTP. Appena arriva il messaggio, il risultato entra in app.
        </p>
        <CopyRow label="URL ingest" value={config.ingestUrl} onCopy={copy} />
        <CopyRow label="Token Bearer" value={config.ingestToken} onCopy={copy} />
        <pre className="overflow-x-auto rounded-xl bg-black/40 p-3 text-xs">
{`POST ${config.ingestUrl}
Authorization: Bearer ${config.ingestToken}
Content-Type: application/json

{ "text": "risultato 2-1 vs Nola", "from": "393331112233" }`}
        </pre>
      </div>

      {config.waLink && (
        <a
          href={config.waLink}
          className="inline-block rounded-xl bg-green-600 px-4 py-2 text-sm font-bold"
        >
          Apri WhatsApp con messaggio pronto
        </a>
      )}

      <div className="space-y-3 rounded-2xl border border-white/10 p-4">
        <h3 className="font-bold">Cosa scrivere</h3>
        <ul className="list-disc space-y-1 pl-5 text-sm opacity-80">
          <li><code>risultato 2-1</code> — aggiorna la partita più vicina senza risultato</li>
          <li><code>2-1 vs Nola</code> — sceglie la gara contro Nola</li>
          <li><code>oggi 3-0</code> oppure <code>20/08 1-1</code></li>
          <li><code>live 1-0 34&apos;</code> — aggiorna il live in Home senza chiudere la gara</li>
        </ul>
        <div className="flex flex-wrap gap-2">
          <input
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="input-field max-w-md"
          />
          <button type="button" onClick={test} className="btn-add">
            Prova ora
          </button>
        </div>
      </div>

      {status && <p className="rounded-xl bg-white/10 px-4 py-3 text-sm">{status}</p>}

      <div>
        <h3 className="mb-2 font-bold">Ultimi messaggi</h3>
        {config.log.length === 0 ? (
          <p className="text-sm opacity-60">Ancora nessun messaggio ricevuto.</p>
        ) : (
          <div className="space-y-2">
            {config.log.map((item, i) => (
              <div key={`${item.at}-${i}`} className="rounded-xl border border-white/10 px-3 py-2 text-sm">
                <p className={item.ok ? "text-green-300" : "text-red-300"}>{item.detail}</p>
                <p className="opacity-60">
                  {item.text} {item.from ? `· da ${item.from}` : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CopyRow({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="opacity-60">{label}</span>
      <code className="max-w-full truncate rounded bg-black/40 px-2 py-1">{value}</code>
      <button type="button" onClick={() => onCopy(value)} className="text-[var(--team-accent)]">
        Copia
      </button>
    </div>
  );
}
