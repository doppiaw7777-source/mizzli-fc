"use client";

import { PlayerKit } from "@/components/PlayerKit";
import { PLAYER_GRAPHICS } from "@/lib/player-graphics";
import type { Player, TeamData } from "@/lib/types";

export default function PlayerGraphicGallery({
  draft,
  setDraft,
}: {
  draft: TeamData;
  setDraft: (d: TeamData) => void;
}) {
  const selected = draft.settings.ui.playerGraphicId || "orb";
  const sample: Player =
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

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">30 grafiche giocatore</h2>
        <p className="mt-1 text-sm opacity-70">
          Chip moderni per formazione, convocati e rosa. Niente omini: numero,
          foto e forme. Si applica a tutta l&apos;app dopo Salva.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-6">
        {PLAYER_GRAPHICS.map((g) => {
          const active = selected === g.id;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() =>
                setDraft({
                  ...draft,
                  settings: {
                    ...draft.settings,
                    ui: { ...draft.settings.ui, playerGraphicId: g.id },
                  },
                })
              }
              className={`rounded-xl border p-3 text-left transition ${
                active
                  ? "border-[var(--team-accent)] bg-[var(--team-accent)]/10 ring-2 ring-[var(--team-accent)]"
                  : "border-white/10 bg-white/5 hover:border-white/30"
              }`}
            >
              <div className="mb-2 flex h-14 items-center justify-center">
                <PlayerKit
                  player={sample}
                  size="md"
                  animate={g.id === "pulse"}
                  graphicId={g.id}
                />
              </div>
              <p className="text-sm font-bold leading-tight">
                {active ? "✓ " : ""}
                {g.name}
              </p>
              <p className="mt-0.5 text-[11px] leading-snug opacity-60">{g.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
