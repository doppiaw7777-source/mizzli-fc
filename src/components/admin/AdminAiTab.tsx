"use client";

import { useRef, useState } from "react";
import { apiFetch } from "@/lib/api";

const PROMPTS = [
  "Cosa manca sul sito?",
  "Riassumi la rosa",
  "Scrivi una news per la prossima partita",
  "Chi è infortunato o senza foto?",
  "Proponi i titolari 4-3-3",
];

type Msg = { role: "user" | "assistant"; text: string };

export default function AdminAiTab() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text: "Sono l'AI admin. Posso leggere rosa, calendario e formazione e aiutarti a scrivere testi o trovare buchi. Non pubblico da sola: tu decidi.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  async function send(raw: string) {
    const text = raw.trim();
    if (!text || busy) return;
    const next = [...messages, { role: "user" as const, text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await apiFetch("/api/admin/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: next.slice(-8).map((m) => ({ role: m.role, text: m.text })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      setMessages([
        ...next,
        { role: "assistant", text: data.text || data.error || "Nessuna risposta" },
      ]);
    } catch {
      setMessages([...next, { role: "assistant", text: "Connessione non riuscita." }]);
    } finally {
      setBusy(false);
      requestAnimationFrame(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
      });
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">AI Admin</h2>
        <p className="mt-1 text-sm opacity-60">
          Chat solo per chi entra con Noldi e PIN. Usa i dati veri del club. Per risposte più intelligenti aggiungi su Render la variabile XAI_API_KEY.
        </p>
      </div>
      <div ref={listRef} className="max-h-[28rem] space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-black/20 p-4">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <p
              className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                m.role === "user"
                  ? "bg-[var(--team-accent)] text-[var(--team-secondary)]"
                  : "border border-white/10 bg-white/10"
              }`}
            >
              {m.text}
            </p>
          </div>
        ))}
        {busy && <p className="text-xs opacity-50">Sto pensando...</p>}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {PROMPTS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => void send(p)}
            className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold hover:bg-white/10"
          >
            {p}
          </button>
        ))}
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input-field flex-1"
          placeholder="Chiedi all'AI admin..."
          maxLength={800}
        />
        <button type="submit" disabled={busy || !input.trim()} className="btn-add disabled:opacity-50">
          Invia
        </button>
      </form>
    </div>
  );
}
