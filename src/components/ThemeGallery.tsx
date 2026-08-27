"use client";

import { APP_THEMES, applyThemeToTeam, getTheme, graphicCss } from "@/lib/themes";
import type { TeamData } from "@/lib/types";

export default function ThemeGallery({
  draft,
  setDraft,
}: {
  draft: TeamData;
  setDraft: (d: TeamData) => void;
}) {
  const theme = getTheme(draft.settings.themeId);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Tema grafico</h2>
        <p className="mt-1 text-sm opacity-70">
          Scegli un tema dalla tendina. Cambia colori, font, campo e grafica di
          sfondo; dopo puoi ancora ritoccare tutto a mano.
        </p>
      </div>
      <label className="block space-y-1">
        <span className="text-xs font-medium opacity-70">Tema</span>
        <select
          value={theme.id}
          onChange={(e) => setDraft(applyThemeToTeam(draft, e.target.value))}
          className="input-field"
          aria-label="Seleziona tema grafico"
        >
          {APP_THEMES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <div
        className="overflow-hidden rounded-2xl border border-white/10"
        aria-hidden
      >
        <div
          className="relative h-20"
          style={{ background: theme.gradient, color: theme.colors.text }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: graphicCss(theme.graphicStyle, theme.colors.accent),
              opacity: 0.85,
            }}
          />
          <div className="absolute bottom-2 left-3 flex items-center gap-2">
            {[theme.colors.primary, theme.colors.accent, theme.colors.secondary].map(
              (c) => (
                <span
                  key={c}
                  className="h-4 w-4 rounded-full border border-white/40"
                  style={{ background: c }}
                />
              )
            )}
            <span className="ml-1 text-sm font-bold drop-shadow">{theme.name}</span>
          </div>
        </div>
        <p className="bg-black/30 px-3 py-2 text-xs opacity-70">{theme.description}</p>
      </div>
    </div>
  );
}
