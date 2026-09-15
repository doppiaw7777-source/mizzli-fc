"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import type { StandingRow, TeamData } from "@/lib/types";

export default function StandingsPhotoImport({
  draft,
  setDraft,
}: {
  draft: TeamData;
  setDraft: (d: TeamData) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<StandingRow[] | null>(null);

  const readFile = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("file"));
      reader.readAsDataURL(file);
    });

  const onPick = async (file: File) => {
    setError("");
    setPreview(null);
    setBusy(true);
    try {
      const image = await readFile(file);
      const res = await apiFetch("/api/admin/standings-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Foto non letta");
        return;
      }
      setPreview(data.rows || []);
    } catch {
      setError("Caricamento non riuscito");
    } finally {
      setBusy(false);
    }
  };

  const apply = () => {
    if (!preview?.length) return;
    const team = draft.settings.teamName;
    const rows = preview.map((row, i) => {
      const old = draft.standings.rows.find(
        (r) => r.name.trim().toLowerCase() === row.name.trim().toLowerCase()
      );
      const ours = /mizzli/i.test(row.name) || row.name.trim().toLowerCase() === team.trim().toLowerCase();
      return {
        ...row,
        id: old?.id || row.id || `st-photo-${i + 1}`,
        logoUrl: old?.logoUrl || "",
        isUs: ours,
        name: ours ? team : row.name,
      };
    });
    setDraft({
      ...draft,
      standings: {
        ...draft.standings,
        rows,
        manual: true,
        live: false,
      },
    });
    setPreview(null);
  };

  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold">Aggiorna da foto</h3>
          <p className="text-sm opacity-60">
            Scatta o carica la classifica. L&apos;AI legge le righe, tu controlli e pubblichi.
          </p>
        </div>
        <label className="btn-add cursor-pointer">
          {busy ? "Lettura..." : "Carica foto"}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onPick(file);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      {draft.standings.manual && (
        <button
          type="button"
          className="text-sm text-[var(--team-accent)] underline"
          onClick={() =>
            setDraft({
              ...draft,
              standings: { ...draft.standings, manual: false },
            })
          }
        >
          Torna al calcolo automatico dalle partite
        </button>
      )}
      {error && <p className="text-sm text-red-300">{error}</p>}
      {preview && (
        <div className="space-y-2">
          <p className="text-sm opacity-70">Ho letto {preview.length} squadre. Controlla e applica.</p>
          <div className="max-h-56 overflow-auto text-sm">
            {preview.map((r) => (
              <p key={r.id}>
                {r.name} · {r.played}G {r.won}V {r.drawn}N {r.lost}P · {r.goalsFor}-{r.goalsAgainst}
              </p>
            ))}
          </div>
          <button type="button" onClick={apply} className="btn-add">
            Applica alla classifica
          </button>
        </div>
      )}
    </div>
  );
}
