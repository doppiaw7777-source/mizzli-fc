"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function DemoClubBox() {
  const [name, setName] = useState("ASD Rivale FC");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const create = async () => {
    setBusy(true);
    setMsg("");
    const res = await apiFetch("/api/demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamName: name }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMsg(data.error || "Non creato");
      return;
    }
    setMsg("Creato. Apri /demo — MIZZLI non è stato toccato.");
    window.open("/demo", "_blank");
  };

  const remove = async () => {
    setBusy(true);
    await apiFetch("/api/demo", { method: "DELETE" });
    setBusy(false);
    setMsg("Prova cancellata.");
  };

  return (
    <div className="space-y-3 rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4">
      <h3 className="font-bold">Prova: nuovo club</h3>
      <p className="text-sm opacity-70">
        Crea una società finta su una copia separata. Home, rosa e convocati di MIZZLI restano identici.
      </p>
      <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={() => void create()} className="btn-add">
          Crea e apri prova
        </button>
        <button type="button" disabled={busy} onClick={() => void remove()} className="rounded-xl border border-white/20 px-4 py-2 text-sm">
          Elimina prova
        </button>
      </div>
      {msg ? <p className="text-sm opacity-80">{msg}</p> : null}
    </div>
  );
}
