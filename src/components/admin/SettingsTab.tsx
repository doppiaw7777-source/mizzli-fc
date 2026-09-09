"use client";

import type { TeamData } from "@/lib/types";

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
      <div>
        <h3 className="text-sm font-bold tracking-wide">{title}</h3>
        {hint ? <p className="mt-1 text-xs opacity-55">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

export default function SettingsTab({
  draft,
  setDraft,
  onUpload,
}: {
  draft: TeamData;
  setDraft: (d: TeamData) => void;
  onUpload: (f: File, cb: (url: string) => void) => void;
}) {
  const s = draft.settings;
  const updateSettings = (patch: Partial<typeof s>) => {
    setDraft({ ...draft, settings: { ...s, ...patch } });
  };

  const bgPages = [
    { key: "global" as const, label: "Tutte le pagine" },
    { key: "home" as const, label: "Home" },
    { key: "rosa" as const, label: "Rosa" },
    { key: "calendario" as const, label: "Calendario" },
    { key: "formazione" as const, label: "Formazione" },
    { key: "admin" as const, label: "Admin" },
  ] as const;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-black">Impostazioni generali</h2>
        <p className="mt-1 text-sm opacity-60">
          Nome, logo e testi pubblici. Colori e tema stanno nella tab Design App.
        </p>
      </div>
      <Section title="Identità" hint="Questi testi compaiono in home e nell’intestazione.">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-xs opacity-70">Nome squadra</span>
            <input value={s.teamName} onChange={(e) => updateSettings({ teamName: e.target.value })} className="input-field" />
          </label>
          <label className="block space-y-1">
            <span className="text-xs opacity-70">Motto</span>
            <input value={s.motto} onChange={(e) => updateSettings({ motto: e.target.value })} className="input-field" />
          </label>
        </div>
        <label className="block space-y-1">
          <span className="text-xs opacity-70">Font app</span>
          <select value={s.fontFamily} onChange={(e) => updateSettings({ fontFamily: e.target.value })} className="input-field">
            {["Inter", "Georgia", "Trebuchet MS", "Verdana", "Arial Black", "Times New Roman"].map((f) => (
              <option key={f} value={f} className="bg-[#1a1024]">{f}</option>
            ))}
          </select>
        </label>
      </Section>
      <Section title="Logo e icona" hint="Logo in alto e icona per l’app sul telefono.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs opacity-70">Logo squadra</p>
            {s.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.logoUrl} alt="" className="h-20 w-20 rounded-2xl bg-white/5 object-contain p-1" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 text-2xl">🛡️</div>
            )}
            <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-white/25 py-2 text-sm">
              Carica logo
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) onUpload(file, (url) => updateSettings({ logoUrl: url })); e.currentTarget.value = ""; }} />
            </label>
          </div>
          <div className="space-y-2">
            <p className="text-xs opacity-70">Icona app</p>
            {s.appIconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.appIconUrl} alt="" className="h-20 w-20 rounded-2xl bg-white/5 object-contain p-1" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 text-2xl">📱</div>
            )}
            <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-white/25 py-2 text-sm">
              Carica icona
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) onUpload(file, (url) => updateSettings({ appIconUrl: url })); e.currentTarget.value = ""; }} />
            </label>
          </div>
        </div>
      </Section>
      <Section title="Sfondi pagine" hint="Opzionale. Lo sfondo tema resta sotto.">
        <div className="grid gap-3 sm:grid-cols-2">
          {bgPages.map((page) => (
            <div key={page.key} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="mb-2 text-xs font-semibold opacity-80">{page.label}</p>
              <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-white/25 py-2 text-sm">
                Carica
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) onUpload(file, (url) => updateSettings({ backgrounds: { ...s.backgrounds, [page.key]: url } })); e.currentTarget.value = ""; }} />
              </label>
              {s.backgrounds?.[page.key] ? (
                <button type="button" className="mt-2 text-xs text-red-300" onClick={() => updateSettings({ backgrounds: { ...s.backgrounds, [page.key]: "" } })}>
                  Rimuovi
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
