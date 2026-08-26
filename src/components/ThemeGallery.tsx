"use client";

import { APP_THEMES, applyThemeToTeam, graphicCss } from "@/lib/themes";
import type { TeamData } from "@/lib/types";

export default function ThemeGallery({
  draft,
  setDraft,
}: {
  draft: TeamData;
  setDraft: (d: TeamData) => void;
}) {
  const selected = draft.settings.themeId;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">20 temi grafici</h2>
        <p className="mt-1 text-sm opacity-70">
          Ogni tema cambia colori, font, campo, raggio, glow e la grafica di
          sfondo. Dopo averlo scelto puoi ancora ritoccare tutto a mano.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {APP_THEMES.map((theme) => {
          const active = selected === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => setDraft(applyThemeToTeam(draft, theme.id))}
              className={`overflow-hidden rounded-2xl border text-left transition ${
                active
                  ? "border-[var(--team-accent)] ring-2 ring-[var(--team-accent)]"
                  : "border-white/10 hover:border-white/30"
              }`}
            >
              <div
                className="relative h-24"
                style={{ background: theme.gradient, color: theme.colors.text }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: graphicCss(theme.graphicStyle, theme.colors.accent),
                    opacity: 0.85,
                  }}
                />
                <div className="absolute bottom-2 left-2 flex gap-1">
                  {[theme.colors.primary, theme.colors.accent, theme.colors.secondary].map(
                    (c) => (
                      <span
                        key={c}
                        className="h-4 w-4 rounded-full border border-white/40"
                        style={{ background: c }}
                      />
                    )
                  )}
                </div>
              </div>
              <div className="bg-black/30 p-3">
                <p className="font-bold">
                  {active ? "✓ " : ""}
                  {theme.name}
                </p>
                <p className="text-xs opacity-70">{theme.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
