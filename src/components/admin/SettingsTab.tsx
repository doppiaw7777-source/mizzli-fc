"use client";

import LogoPicker from "@/components/LogoPicker";
import DemoClubBox from "@/components/admin/DemoClubBox";
import { resolveTeamLogo, setTeamLogo } from "@/lib/club-teams";
import type { TeamData } from "@/lib/types";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium opacity-70">{label}</span>
      {children}
    </label>
  );
}

function ImageUpload({
  current,
  onUpload,
  onClear,
}: {
  current: string;
  onUpload: (file: File) => void;
  onClear?: () => void;
}) {
  return (
    <div className="space-y-2">
      {current ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={current} alt="" className="h-20 w-20 rounded-lg object-cover" />
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-white/20 text-xl opacity-50">
          —
        </div>
      )}
      <label className="inline-flex cursor-pointer rounded-xl border border-white/20 px-3 py-2 text-sm">
        Carica
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            e.currentTarget.value = "";
          }}
        />
      </label>
      {current && onClear ? (
        <button type="button" onClick={onClear} className="ml-2 text-xs text-red-400">
          Rimuovi
        </button>
      ) : null}
    </div>
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
  type ColorKey = keyof typeof s.colors;
  const updateSettings = (patch: Partial<typeof s>) => {
    setDraft({ ...draft, settings: { ...s, ...patch } });
  };

  const bgPages = [
    { key: "global" as const, label: "Globale" },
    { key: "home" as const, label: "Home" },
    { key: "rosa" as const, label: "Rosa" },
    { key: "calendario" as const, label: "Calendario" },
    { key: "formazione" as const, label: "Formazione" },
    { key: "admin" as const, label: "Admin" },
  ];

  const colorFields: Array<[ColorKey, string]> = [
    ["primary", "Primario"],
    ["secondary", "Secondario"],
    ["accent", "Accent"],
    ["text", "Testo"],
    ["cardBg", "Card BG"],
  ];

  const colorInputValue = (value: string, fallback = "#1a1a2e") =>
    /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;

  const updateColor = (key: ColorKey, value: string) => {
    updateSettings({ colors: { ...s.colors, [key]: value } });
  };

  const brandFields = [
    ["stadiumName", "Stadio / campo"],
    ["leagueName", "Campionato / coppa"],
    ["seasonLabel", "Stagione"],
    ["nextMatchLabel", "Etichetta prossima partita"],
    ["contactEmail", "Email contatto"],
    ["contactPhone", "Telefono"],
    ["rosaTitle", "Titolo Rosa"],
    ["calendarioTitle", "Titolo Calendario"],
    ["formazioneTitle", "Titolo Formazione"],
    ["newsTitle", "Titolo News"],
    ["trainingsTitle", "Titolo Allenamenti"],
    ["sponsorsTitle", "Titolo Sponsor"],
    ["homeLabel", "Menu Home"],
    ["rosaLabel", "Menu Rosa"],
    ["calendarioLabel", "Menu Calendario"],
    ["formazioneLabel", "Menu Formazione"],
  ] as const;

  return (
    <div className="space-y-6">
      <DemoClubBox />
      <h2 className="text-xl font-bold">Personalizzazione Completa</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nome Squadra">
          <input value={s.teamName} onChange={(e) => updateSettings({ teamName: e.target.value })} className="input-field" />
        </Field>
        <Field label="Motto">
          <input value={s.motto} onChange={(e) => updateSettings({ motto: e.target.value })} className="input-field" />
        </Field>
        <Field label="Font">
          <select value={s.fontFamily} onChange={(e) => updateSettings({ fontFamily: e.target.value })} className="input-field">
            <option value="Inter, system-ui, sans-serif">Inter</option>
            <option value="'Georgia', serif">Georgia</option>
            <option value="'Courier New', monospace">Courier New</option>
            <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
            <option value="'Palatino Linotype', serif">Palatino</option>
            <option value="'Impact', sans-serif">Impact</option>
            <option value="'Arial Black', sans-serif">Arial Black</option>
            <option value="'Times New Roman', serif">Times New Roman</option>
            <option value="'Verdana', sans-serif">Verdana</option>
          </select>
        </Field>
        <Field label="Stile Navbar">
          <select
            value={s.navStyle}
            onChange={(e) => updateSettings({ navStyle: e.target.value as "solid" | "glass" })}
            className="input-field"
          >
            <option value="glass">Vetro (Glass)</option>
            <option value="solid">Solido</option>
          </select>
        </Field>
      </div>

      <div>
        <h3 className="mb-3 font-semibold">Identità e testi dell&apos;app</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {brandFields.map(([key, label]) => (
            <Field key={key} label={label}>
              <input
                value={s.branding[key]}
                onChange={(e) =>
                  updateSettings({ branding: { ...s.branding, [key]: e.target.value } })
                }
                className="input-field"
              />
            </Field>
          ))}
        </div>
        <div className="mt-4 grid gap-4">
          <Field label="Messaggio di benvenuto (Home)">
            <textarea
              value={s.branding.welcomeMessage}
              onChange={(e) =>
                updateSettings({ branding: { ...s.branding, welcomeMessage: e.target.value } })
              }
              className="input-field min-h-20"
            />
          </Field>
          <Field label="Chi siamo / presentazione">
            <textarea
              value={s.branding.aboutText}
              onChange={(e) =>
                updateSettings({ branding: { ...s.branding, aboutText: e.target.value } })
              }
              className="input-field min-h-24"
            />
          </Field>
          <Field label="Testo footer">
            <input
              value={s.branding.footerText}
              onChange={(e) =>
                updateSettings({ branding: { ...s.branding, footerText: e.target.value } })
              }
              className="input-field"
            />
          </Field>
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-semibold">Colori</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {colorFields.map(([key, label]) => (
            <Field key={key} label={label}>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colorInputValue(s.colors[key])}
                  onChange={(e) => updateColor(key, e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded border-0"
                />
                <input
                  value={s.colors[key]}
                  onChange={(e) => updateColor(key, e.target.value)}
                  className="input-field flex-1"
                />
              </div>
            </Field>
          ))}
        </div>
      </div>

      <Field label="Logo Squadra">
        <LogoPicker
          name={s.teamName}
          url={resolveTeamLogo(draft, s.teamName)}
          gold
          onChange={(url) => setDraft(setTeamLogo(draft, s.teamName, url))}
          onUpload={onUpload}
        />
      </Field>

      <Field label="Logo App installabile (icona)">
        <ImageUpload
          current={s.appIconUrl || ""}
          onUpload={(f) => onUpload(f, (url) => updateSettings({ appIconUrl: url }))}
          onClear={() => updateSettings({ appIconUrl: "" })}
        />
      </Field>

      <div>
        <h3 className="mb-3 font-semibold">Immagini di Sfondo</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {bgPages.map(({ key, label }) => (
            <Field key={key} label={`Sfondo ${label}`}>
              <ImageUpload
                current={s.backgrounds[key]}
                onUpload={(f) =>
                  onUpload(f, (url) =>
                    updateSettings({ backgrounds: { ...s.backgrounds, [key]: url } })
                  )
                }
                onClear={() =>
                  updateSettings({ backgrounds: { ...s.backgrounds, [key]: "" } })
                }
              />
            </Field>
          ))}
        </div>
      </div>
    </div>
  );
}
