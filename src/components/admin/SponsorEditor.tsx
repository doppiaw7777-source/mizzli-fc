"use client";

import { useState, type ReactNode } from "react";
import { isValidImageUrl } from "@/lib/images";
import type { Sponsor } from "@/lib/types";
import { sponsorTier } from "@/lib/sponsors";

export default function SponsorEditor({
  sponsor,
  onChange,
  onUpload,
  onRemove,
}: {
  sponsor: Sponsor;
  onChange: (patch: Partial<Sponsor>) => void;
  onUpload: (file: File, cb: (url: string) => void) => void;
  onRemove: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");
  const [error, setError] = useState("");
  const tier = sponsorTier(sponsor);

  const assign = (file?: File) => {
    if (!file) return;
    setBusy(true);
    setError("");
    onUpload(file, (next) => {
      setBusy(false);
      if (next) onChange({ logoUrl: next });
      else setError("Upload non riuscito");
    });
  };

  return (
    <article className="sponsor-editor">
      <label className="sponsor-drop">
        {sponsor.logoUrl ? (
          <img src={sponsor.logoUrl} alt={sponsor.name || "Logo sponsor"} />
        ) : (
          <span className="sponsor-drop-empty">
            {busy ? "Carico..." : "Tocca e carica il logo"}
          </span>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={busy}
          onChange={(e) => {
            assign(e.target.files?.[0]);
            e.currentTarget.value = "";
          }}
        />
      </label>
      <div className="min-w-0 flex-1 space-y-3">
        <FieldBlock label="Livello">
          <select
            value={tier}
            onChange={(e) => onChange({ tier: e.target.value as Sponsor["tier"] })}
            className="input-field"
          >
            <option value="main">Main Sponsor — banner grande</option>
            <option value="partner">Partner — fascia piccola</option>
          </select>
        </FieldBlock>
        <FieldBlock label="Nome">
          <input
            value={sponsor.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Nome sponsor"
            className="input-field"
          />
        </FieldBlock>
        <FieldBlock label="Sito (opzionale)">
          <input
            value={sponsor.website}
            onChange={(e) => onChange({ website: e.target.value })}
            placeholder="https://"
            className="input-field"
          />
        </FieldBlock>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="Oppure URL del logo"
            className="input-field min-w-0 flex-1"
          />
          <button
            type="button"
            className="min-h-11 rounded-xl bg-white/10 px-3 text-sm font-semibold"
            onClick={() => {
              const next = urlDraft.trim();
              if (!isValidImageUrl(next)) {
                setError("URL non valido");
                return;
              }
              setError("");
              onChange({ logoUrl: next });
              setUrlDraft("");
            }}
          >
            Usa
          </button>
        </div>
        {error ? <p className="text-[11px] text-red-300">{error}</p> : null}
        <div className="flex flex-wrap gap-3">
          {sponsor.logoUrl ? (
            <button
              type="button"
              className="text-sm text-white/60 underline"
              onClick={() => onChange({ logoUrl: "" })}
            >
              Togli logo
            </button>
          ) : null}
          <button type="button" className="text-sm text-red-400 underline" onClick={onRemove}>
            Elimina sponsor
          </button>
        </div>
      </div>
    </article>
  );
}

function FieldBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium opacity-70">{label}</span>
      {children}
    </label>
  );
}
