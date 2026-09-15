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
  const s = draft.settings;
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
    <div className="space-y-8">
      <ThemeGallery draft={draft} setDraft={setDraft} />
      <div className="border-t border-white/10 pt-6">
        <PlayerGraphicGallery draft={draft} setDraft={setDraft} />
      </div>
      <section className="space-y-4 border-t border-white/10 pt-6">
        <h2 className="text-xl font-bold">Controlli visivi dell&apos;app</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={`Raggio card (${ui.cardRadius}px)`}>
            <input type="range" min={4} max={36} value={ui.cardRadius} onChange={(e) => updateUi({ cardRadius: parseInt(e.target.value) })} className="w-full" />
          </Field>
          <Field label={`Oscurità sfondo (${ui.backgroundOverlay}%)`}>
            <input type="range" min={10} max={85} value={ui.backgroundOverlay} onChange={(e) => updateUi({ backgroundOverlay: parseInt(e.target.value) })} className="w-full" />
          </Field>
          <Field label={`Intensità grafica tema (${ui.graphicIntensity}%)`}>
            <input type="range" min={0} max={100} value={ui.graphicIntensity} onChange={(e) => updateUi({ graphicIntensity: parseInt(e.target.value) })} className="w-full" />
          </Field>
          <Field label="Dimensione titoli">
            <select value={ui.titleSize} onChange={(e) => updateUi({ titleSize: e.target.value as "normal" | "large" | "xl" })} className="input-field">
              <option value="normal">Normale</option>
              <option value="large">Grande</option>
              <option value="xl">Extra Large</option>
            </select>
          </Field>
          <Field label="Stile bottoni">
            <select value={ui.buttonStyle} onChange={(e) => updateUi({ buttonStyle: e.target.value as "rounded" | "pill" | "square" })} className="input-field">
              <option value="rounded">Arrotondati</option>
              <option value="pill">Pill</option>
              <option value="square">Quadrati</option>
            </select>
          </Field>
          <Field label="Hero Home">
            <select value={ui.heroStyle} onChange={(e) => updateUi({ heroStyle: e.target.value as "center" | "left" | "banner" })} className="input-field">
              <option value="center">Centrato</option>
              <option value="left">Allineato a sinistra</option>
              <option value="banner">Banner largo</option>
            </select>
          </Field>
          <Field label="Layout Home">
            <select value={ui.homeLayout} onChange={(e) => updateUi({ homeLayout: e.target.value as "classic" | "magazine" | "minimal" })} className="input-field">
              <option value="classic">Classico</option>
              <option value="magazine">Magazine</option>
              <option value="minimal">Minimal</option>
            </select>
          </Field>
          <Field label="Navbar">
            <select
              value={s.navStyle}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  settings: { ...s, navStyle: e.target.value as "solid" | "glass" },
                })
              }
              className="input-field"
            >
              <option value="glass">Vetro</option>
              <option value="solid">Solida</option>
            </select>
          </Field>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Toggle label="Mostra motto" checked={ui.showMotto} onChange={(v) => updateUi({ showMotto: v })} />
          <Toggle label="Glow sulle card" checked={ui.cardGlow} onChange={(v) => updateUi({ cardGlow: v })} />
          <Toggle label="Modo compatto" checked={ui.compactMode} onChange={(v) => updateUi({ compactMode: v })} />
          <Toggle label="Barra in basso (mobile)" checked={ui.showBottomNav} onChange={(v) => updateUi({ showBottomNav: v })} />
          <Toggle label="Card prossima partita" checked={ui.showNextMatchCard} onChange={(v) => updateUi({ showNextMatchCard: v })} />
          <Toggle label="Statistiche Home" checked={ui.showHomeStats} onChange={(v) => updateUi({ showHomeStats: v })} />
          <Toggle label="News Home" checked={ui.showNews} onChange={(v) => updateUi({ showNews: v })} />
          <Toggle label="Allenamenti Home" checked={ui.showTrainings} onChange={(v) => updateUi({ showTrainings: v })} />
          <Toggle label="Classifica Home" checked={ui.showStandings} onChange={(v) => updateUi({ showStandings: v })} />
          <Toggle label="Sponsor" checked={ui.showSponsors} onChange={(v) => updateUi({ showSponsors: v })} />
          <Toggle label="Social" checked={ui.showSocialLinks} onChange={(v) => updateUi({ showSocialLinks: v })} />
          <Toggle label="Chi siamo in Home" checked={ui.showAbout} onChange={(v) => updateUi({ showAbout: v })} />
          <Toggle label="Condivisione partite" checked={ui.enableMatchShare} onChange={(v) => updateUi({ enableMatchShare: v })} />
        </div>
      </section>
    </div>
  );
}
