"use client";

import { useMemo, useState } from "react";
import {
  CALENDAR_MODELS,
  CALENDAR_SIZES,
  getCalendarModel,
  getCalendarSize,
  type CalendarSizeId,
} from "@/lib/calendar-models";
import type { TeamData } from "@/lib/types";

export default function CalendarGallery({
  draft,
  setDraft,
}: {
  draft: TeamData;
  setDraft: (d: TeamData) => void;
}) {
  const ui = draft.settings.ui;
  const model = getCalendarModel(ui.calendarModelId);
  const size = getCalendarSize(ui.calendarSize);
  const [openModel, setOpenModel] = useState(false);
  const [openSize, setOpenSize] = useState(false);
  const [query, setQuery] = useState("");

  const updateUi = (patch: Partial<typeof ui>) => {
    setDraft({
      ...draft,
      settings: { ...draft.settings, ui: { ...ui, ...patch } },
    });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CALENDAR_MODELS;
    return CALENDAR_MODELS.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Calendario</h2>
        <p className="mt-1 text-sm opacity-70">
          Modello e grandezza in due tendine. Vale per la pagina Calendario.
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          setOpenSize((v) => !v);
          setOpenModel(false);
        }}
        className="flex w-full items-center gap-4 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-left transition hover:border-white/30"
        aria-expanded={openSize}
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-black/30 text-xs font-black">
          {size.cell}px
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs uppercase tracking-[0.16em] text-[var(--team-accent)]">Grandezza</span>
          <span className="mt-0.5 block text-lg font-black leading-tight">{size.label}</span>
          <span className="block text-sm opacity-60">Celle {size.cell}px · spazio {size.gap}px</span>
        </span>
        <span className="text-sm font-semibold opacity-60">{openSize ? "Chiudi" : "Cambia"}</span>
      </button>

      {openSize && (
        <div className="overflow-hidden rounded-2xl border border-white/12 bg-[#120818] p-2">
          {CALENDAR_SIZES.map((s) => {
            const active = size.id === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  updateUi({ calendarSize: s.id as CalendarSizeId });
                  setOpenSize(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left ${
                  active ? "bg-[var(--team-accent)]/15 ring-1 ring-[var(--team-accent)]" : "hover:bg-white/8"
                }`}
              >
                <span>
                  <span className="block text-sm font-bold">{s.label}</span>
                  <span className="block text-xs opacity-55">Cella {s.cell}px</span>
                </span>
                {active && <span className="text-xs font-black text-[var(--team-accent)]">Attiva</span>}
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          setOpenModel((v) => !v);
          setOpenSize(false);
        }}
        className="flex w-full items-center gap-4 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-left transition hover:border-white/30"
        aria-expanded={openModel}
      >
        <span className="h-16 w-16 overflow-hidden rounded-2xl" style={{ background: model.preview }} />
        <span className="min-w-0 flex-1">
          <span className="block text-xs uppercase tracking-[0.16em] text-[var(--team-accent)]">Modello</span>
          <span className="mt-0.5 block text-lg font-black leading-tight">{model.name}</span>
          <span className="block text-sm opacity-60">{model.description}</span>
        </span>
        <span className="text-sm font-semibold opacity-60">{openModel ? "Chiudi" : "Cambia"}</span>
      </button>

      {openModel && (
        <div className="overflow-hidden rounded-2xl border border-white/12 bg-[#120818]">
          <div className="border-b border-white/10 p-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input-field"
              placeholder="Cerca modello: neon, oro, campo..."
              autoFocus
            />
          </div>
          <div className="max-h-[22rem] space-y-1 overflow-y-auto p-2">
            {filtered.length === 0 && (
              <p className="px-3 py-6 text-center text-sm opacity-50">Nessun modello con questo nome</p>
            )}
            {filtered.map((m) => {
              const active = model.id === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    updateUi({ calendarModelId: m.id });
                    setOpenModel(false);
                    setQuery("");
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ${
                    active ? "bg-[var(--team-accent)]/15 ring-1 ring-[var(--team-accent)]" : "hover:bg-white/8"
                  }`}
                >
                  <span className="h-12 w-12 shrink-0 overflow-hidden rounded-xl" style={{ background: m.preview }} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold">{m.name}</span>
                    <span className="block truncate text-xs opacity-55">{m.description}</span>
                  </span>
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
