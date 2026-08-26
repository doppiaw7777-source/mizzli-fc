"use client";

import { CALENDAR_MODELS, CALENDAR_SIZES } from "@/lib/calendar-models";
import type { TeamData } from "@/lib/types";

export default function CalendarGallery({
  draft,
  setDraft,
}: {
  draft: TeamData;
  setDraft: (d: TeamData) => void;
}) {
  const ui = draft.settings.ui;
  const selected = ui.calendarModelId || "griglia-classica";
  const size = ui.calendarSize || "md";

  const updateUi = (patch: Partial<typeof ui>) => {
    setDraft({
      ...draft,
      settings: { ...draft.settings, ui: { ...ui, ...patch } },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Modello e grandezza calendario</h2>
        <p className="mt-1 text-sm opacity-70">
          20 grafiche diverse e 5 grandezze. La scelta vale per la pagina Calendario.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {CALENDAR_SIZES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => updateUi({ calendarSize: s.id })}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              size === s.id
                ? "bg-[var(--team-accent)] text-[var(--team-secondary)]"
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {CALENDAR_MODELS.map((model) => {
          const active = selected === model.id;
          return (
            <button
              key={model.id}
              type="button"
              onClick={() => updateUi({ calendarModelId: model.id })}
              className={`overflow-hidden rounded-2xl border text-left transition ${
                active
                  ? "border-[var(--team-accent)] ring-2 ring-[var(--team-accent)]"
                  : "border-white/10 hover:border-white/30"
              }`}
            >
              <div className="relative h-20 p-2" style={{ background: model.preview }}>
                <div className="grid h-full grid-cols-7 gap-0.5">
                  {Array.from({ length: 14 }, (_, i) => (
                    <span key={i} className="rounded-[2px] bg-white/30" />
                  ))}
                </div>
              </div>
              <div className="bg-black/30 p-3">
                <p className="font-bold">
                  {active ? "✓ " : ""}
                  {model.name}
                </p>
                <p className="text-xs opacity-70">{model.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
