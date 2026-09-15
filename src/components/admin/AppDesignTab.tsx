"use client";

import ThemeGallery from "@/components/ThemeGallery";
import PlayerGraphicGallery from "@/components/PlayerGraphicGallery";
import type { TeamData } from "@/lib/types";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs opacity-70">{label}</span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm ${
        checked ? "border-[var(--team-accent)] bg-[var(--team-accent)]/10" : "border-white/10"
      }`}
    >
      <span>{label}</span>
      <span className="text-xs font-black uppercase opacity-60">{checked ? "On" : "Off"}</span>
    </button>
  );
}

export default function AppDesignTab({
  draft,
  setDraft,
}: {
  draft: TeamData;
  setDraft: (d: TeamData) => void;
}) {
  const ui = draft.settings.ui;
  const updateUi = (patch: Partial<typeof ui>) => {
    setDraft({
      ...draft,
      settings: {
        ...draft.settings,
        ui: { ...ui, ...patch },
      },
    });
  };

  return (
    <div className="space-y-6">
      <ThemeGallery draft={draft} setDraft={setDraft} />
      <PlayerGraphicGallery draft={draft} setDraft={setDraft} />
      <section className="space-y-3 border-t border-white/10 pt-5">
        <h2 className="text-lg font-black">Home</h2>
        <Field label="Layout">
          <select
            value={ui.homeLayout}
            onChange={(e) =>
              updateUi({ homeLayout: e.target.value as "classic" | "magazine" | "minimal" })
            }
            className="input-field"
          >
            <option value="classic">Classico</option>
            <option value="magazine">Magazine</option>
            <option value="minimal">Minimal</option>
          </select>
        </Field>
        <Field label={`Oscurità sfondo (${ui.backgroundOverlay}%)`}>
          <input
            type="range"
            min={10}
            max={85}
            value={ui.backgroundOverlay}
            onChange={(e) => updateUi({ backgroundOverlay: parseInt(e.target.value) })}
            className="w-full"
          />
        </Field>
        <div className="grid gap-2">
          <Toggle label="Motto" checked={ui.showMotto} onChange={(v) => updateUi({ showMotto: v })} />
          <Toggle label="Prossima partita" checked={ui.showNextMatchCard} onChange={(v) => updateUi({ showNextMatchCard: v })} />
          <Toggle label="Sponsor" checked={ui.showSponsors} onChange={(v) => updateUi({ showSponsors: v })} />
          <Toggle label="Barra in basso" checked={ui.showBottomNav} onChange={(v) => updateUi({ showBottomNav: v })} />
          <Toggle label="News" checked={ui.showNews} onChange={(v) => updateUi({ showNews: v })} />
          <Toggle label="Classifica" checked={ui.showStandings} onChange={(v) => updateUi({ showStandings: v })} />
        </div>
      </section>
    </div>
  );
}
