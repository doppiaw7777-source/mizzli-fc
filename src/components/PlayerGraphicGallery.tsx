"use client";

import { useMemo, useState } from "react";
import { PlayerKit } from "@/components/PlayerKit";
import { PLAYER_GRAPHICS, getPlayerGraphic } from "@/lib/player-graphics";
import type { Player, TeamData } from "@/lib/types";

export default function PlayerGraphicGallery({
  draft,
  setDraft,
}: {
  draft: TeamData;
  setDraft: (d: TeamData) => void;
}) {
  const selectedId = draft.settings.ui.playerGraphicId || "orb";
  const selected = getPlayerGraphic(selectedId);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const sample: Player =
    draft.players.find((p) => p.photoUrl && p.role !== "POR") ||
    draft.players.find((p) => p.role !== "POR") ||
    draft.players[0] || {
      id: "preview",
      name: "Preview",
      number: 10,
      position: "Centrocampista",
      role: "CEN",
      birthDate: "1998-01-01",
      nationality: "Italia",
      photoUrl: "",
      stats: { goals: 0, assists: 0, appearances: 0 },
    };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PLAYER_GRAPHICS;
    return PLAYER_GRAPHICS.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.id.toLowerCase().includes(q)
    );
  }, [query]);

  const pick = (id: string) => {
    setDraft({
      ...draft,
      settings: {
        ...draft.settings,
        ui: { ...draft.settings.ui, playerGraphicId: id },
      },
    });
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Grafica giocatore</h2>
        <p className="mt-1 text-sm opacity-70">
          Una forma per tutta l&apos;app: formazione, convocati e rosa. Scegli dalla tendina.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-4 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-left transition hover:border-white/30"
        aria-expanded={open}
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-black/30">
          <PlayerKit player={sample} size="md" animate={selectedId === "pulse"} graphicId={selectedId} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs uppercase tracking-[0.16em] text-[var(--team-accent)]">In uso</span>
          <span className="mt-0.5 block text-lg font-black leading-tight">{selected.name}</span>
          <span className="block text-sm opacity-60">{selected.description}</span>
        </span>
        <span className="text-sm font-semibold opacity-60">{open ? "Chiudi" : "Cambia"}</span>
      </button>

      {open && (
        <div className="overflow-hidden rounded-2xl border border-white/12 bg-[#120818]">
          <div className="border-b border-white/10 p-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input-field"
              placeholder="Cerca grafica: sfera, neon, scudo..."
              autoFocus
            />
          </div>
          <div className="max-h-[22rem] space-y-1 overflow-y-auto p-2">
            {filtered.length === 0 && (
              <p className="px-3 py-6 text-center text-sm opacity-50">Nessuna grafica con questo nome</p>
            )}
            {filtered.map((g) => {
              const active = selectedId === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => pick(g.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ${
                    active ? "bg-[var(--team-accent)]/15 ring-1 ring-[var(--team-accent)]" : "hover:bg-white/8"
                  }`}
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center">
                    <PlayerKit player={sample} size="sm" animate={false} graphicId={g.id} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold">{g.name}</span>
                    <span className="block truncate text-xs opacity-55">{g.description}</span>
                  </span>
                  {g.photo && <span className="text-[10px] font-bold uppercase tracking-wide opacity-40">Foto</span>}
                  {active && <span className="text-xs font-black text-[var(--team-accent)]">Attiva</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
