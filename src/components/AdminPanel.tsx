"use client";

import { useState } from "react";
import { uploadImageWithFallback, isValidImageUrl } from "@/lib/images";
import { hapticLight, pickNativeImage } from "@/lib/native";
import FormationEditor from "@/components/FormationEditor";
import { PlayerKit } from "@/components/PlayerKit";
import ThemeGallery from "@/components/ThemeGallery";
import PlayerGraphicGallery from "@/components/PlayerGraphicGallery";
import CalendarGallery from "@/components/CalendarGallery";
import { FORMATION_PRESETS, FORMATION_SCHEMES } from "@/lib/formation-presets";
import ClubTab from "@/components/admin/ClubTab";
import LiveTab from "@/components/admin/LiveTab";
import CallupBoard from "@/components/CallupBoard";
import WhatsAppTab from "@/components/admin/WhatsAppTab";
import SmsTab from "@/components/admin/SmsTab";
import EventsTab from "@/components/admin/EventsTab";
import DocumentsTab from "@/components/admin/DocumentsTab";
import FinesTab from "@/components/admin/FinesTab";
import UsersTab from "@/components/admin/UsersTab";
import { apiFetch } from "@/lib/api";
import DeveloperGate from "@/components/DeveloperGate";
import ColorSwatch from "@/components/ColorSwatch";
import { todayKey } from "@/lib/dates";
import { defaultEventColor, hexAlpha } from "@/lib/event-color";
import { syncStandings } from "@/lib/standings";
import type { MatchKind, PlayerStatus, TeamData } from "@/lib/types";
import {
  MATCH_KIND_META,
  MATCH_KINDS,
  applyMatchKind,
  createMatch,
  getMatchKind,
} from "@/lib/match-kind";

export type AdminTab =
  | "impostazioni"
  | "design"
  | "rosa"
  | "staff"
  | "calendario"
  | "formazione"
  | "convocati"
  | "live"
  | "contenuti"
  | "classifica"
  | "club"
  | "eventi"
  | "documenti"
  | "multe"
  | "utenti"
  | "whatsapp"
  | "sms";

interface AdminPanelProps {
  data: TeamData;
  onSave: (data: TeamData) => Promise<boolean>;
  onLogout: () => void;
}

async function uploadFile(file: File): Promise<{ url: string | null; message?: string }> {
  return uploadImageWithFallback(file);
}

export default function AdminPanel({ data, onSave, onLogout, allowedTabs, limitedClubTab = false, title = "Pannello Admin" }: AdminPanelProps & { allowedTabs?: AdminTab[]; limitedClubTab?: boolean; title?: string; }) {
  const [draft, setDraftRaw] = useState<TeamData>(() => syncStandings(structuredClone(data)));
  const setDraft = (next: TeamData) => setDraftRaw(syncStandings(next));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const tabs: { id: AdminTab; label: string }[] = [
    { id: "impostazioni", label: "⚙️ Impostazioni" },
    { id: "design", label: "🎨 Design App" },
    { id: "rosa", label: "👥 Rosa" },
    { id: "staff", label: "👔 Staff" },
    { id: "calendario", label: "📅 Calendario" },
    { id: "formazione", label: "⚽ Formazione" },
    { id: "convocati", label: "📋 Convocati" },
    { id: "live", label: "🔴 Live" },
    { id: "contenuti", label: "📣 Contenuti" },
    { id: "classifica", label: "🏆 Classifica" },
    { id: "club", label: "🏛️ Club+" },
    { id: "eventi", label: "🎉 Eventi" },
    { id: "documenti", label: "📄 Documenti" },
    { id: "multe", label: "💶 Multe" },
    { id: "utenti", label: "🧑 Ruoli" },
    { id: "whatsapp", label: "🟢 WhatsApp" },
    { id: "sms", label: "💬 SMS" },
  ];

  const visibleTabs =
    allowedTabs && allowedTabs.length
      ? tabs.filter((t) => allowedTabs.includes(t.id))
      : tabs;
  const [tab, setTab] = useState<AdminTab>((allowedTabs && allowedTabs[0]) || "impostazioni");
  const [developerOpen, setDeveloperOpen] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    const ok = await onSave(draft);
    if (ok) await hapticLight();
    setSaving(false);
    setMessage(ok ? "✅ Salvato con successo!" : "❌ Errore nel salvataggio");
  };

  const downloadBackup = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mizzli-fc-backup-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage("✅ Backup scaricato sul telefono. Conservalo.");
  };

  const restoreBackup = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as TeamData;
      if (!parsed?.settings || !Array.isArray(parsed.players)) {
        setMessage("❌ File backup non valido");
        return;
      }
      setDraft(parsed);
      if (Array.isArray(parsed.club?.matchLives)) {
        await apiFetch("/api/live", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "import",
            lives: parsed.club.matchLives,
            activeMatchId: parsed.club.info?.liveMatchId || "",
          }),
        });
      }
      setMessage("✅ Backup caricato. Controlla e premi Salva Tutto.");
    } catch {
      setMessage("❌ Non riesco a leggere questo backup");
    }
  };

  const saveButton = (
    <button
      type="button"
      onClick={handleSave}
      disabled={saving}
      className="min-h-11 rounded-xl bg-[var(--team-accent)] px-5 py-2.5 font-bold text-[var(--team-secondary)] transition hover:opacity-90 disabled:opacity-50"
    >
      {saving ? "Salvataggio..." : "💾 Salva Tutto"}
    </button>
  );

  const handleImageUpload = async (
    file: File,
    callback: (url: string) => void
  ) => {
    setMessage("⏳ Caricamento immagine...");
    const result = await uploadFile(file);
    if (result.url) {
      callback(result.url);
      setMessage(`✅ ${result.message || "Immagine inserita"} — clicca Salva Tutto`);
    } else {
      setMessage(`❌ ${result.message || "Errore upload immagine"}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black sm:text-3xl">{title}</h1>
        <div className="hidden flex-wrap gap-2 md:flex">
          {saveButton}
          <button
            type="button"
            onClick={downloadBackup}
            className="min-h-11 rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
          >
            Scarica backup
          </button>
          <label className="flex min-h-11 cursor-pointer items-center rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-white/10">
            Ripristina
            <input
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void restoreBackup(file);
                e.target.value = "";
              }}
            />
          </label>
          <button
            type="button"
            onClick={onLogout}
            className="min-h-11 rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
          >
            Esci
          </button>
        </div>
      </div>

      {message && (
        <div className="rounded-xl bg-white/10 px-4 py-3 text-sm">{message}</div>
      )}

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
        {visibleTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`min-h-11 shrink-0 snap-start rounded-xl px-4 py-2 text-sm font-medium transition ${
              tab === t.id
                ? "bg-[var(--team-accent)] text-[var(--team-secondary)]"
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            {t.label}
          </button>
        ))}
        {!allowedTabs && (
          <button
            type="button"
            onClick={() => setDeveloperOpen(true)}
            className="min-h-11 shrink-0 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20"
          >
            🧪 Sviluppatore
          </button>
        )}
      </div>

      {developerOpen && <DeveloperGate onClose={() => setDeveloperOpen(false)} />}

      <div className="rounded-2xl border border-white/10 bg-[var(--team-card-bg)] p-4 backdrop-blur-md sm:p-6">
        {tab === "impostazioni" && (
          <SettingsTab draft={draft} setDraft={setDraft} onUpload={handleImageUpload} />
        )}
        {tab === "design" && <DesignTab draft={draft} setDraft={setDraft} />}
        {tab === "rosa" && (
          <PlayersTab draft={draft} setDraft={setDraft} onUpload={handleImageUpload} />
        )}
        {tab === "staff" && (
          <StaffTab draft={draft} setDraft={setDraft} onUpload={handleImageUpload} />
        )}
        {tab === "calendario" && (
          <MatchesTab draft={draft} setDraft={setDraft} />
        )}
        {tab === "formazione" && (
          <FormationTab draft={draft} setDraft={setDraft} />
        )}
        {tab === "convocati" && (
          <div className="space-y-4">
            <p className="text-sm opacity-70">
              Seleziona i convocati dalla rosa. La lista compare in Home, nel
              menu Convocati e nella pagina della partita.
            </p>
            <CallupBoard />
          </div>
        )}
        {tab === "live" && <LiveTab draft={draft} setDraft={setDraft} />}
        {tab === "contenuti" && (
          <ContentTab draft={draft} setDraft={setDraft} onUpload={handleImageUpload} />
        )}
        {tab === "classifica" && (
          <StandingsTab draft={draft} setDraft={setDraft} />
        )}
        {tab === "club" && <ClubTab draft={draft} setDraft={setDraft} limited={limitedClubTab} />}
        {tab === "eventi" && <EventsTab draft={draft} setDraft={setDraft} />}
        {tab === "documenti" && <DocumentsTab draft={draft} setDraft={setDraft} />}
        {tab === "multe" && <FinesTab draft={draft} setDraft={setDraft} />}
        {tab === "utenti" && <UsersTab />}
        {tab === "whatsapp" && <WhatsAppTab />}
        {tab === "sms" && <SmsTab />}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-white/15 bg-black/85 px-3 pt-2 pb-[calc(env(safe-area-inset-bottom)+3.6rem)] backdrop-blur-xl md:hidden">
        <div className="mx-auto max-w-7xl space-y-2">
          <div className="[&>button]:w-full">{saveButton}</div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={downloadBackup}
              className="min-h-11 rounded-xl border border-white/20 px-2 py-2 text-xs font-semibold"
            >
              Backup
            </button>
            <label className="flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-white/20 px-2 py-2 text-xs font-semibold">
              Ripristina
              <input
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void restoreBackup(file);
                  e.target.value = "";
                }}
              />
            </label>
            <button
              type="button"
              onClick={onLogout}
              className="min-h-11 rounded-xl border border-white/20 px-2 py-2 text-xs font-semibold"
            >
              Esci
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsTab({
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

  const [activeColorKey, setActiveColorKey] = useState<ColorKey>("primary");
  const [pickedColor, setPickedColor] = useState("#0d4f2b");
  const [pickerMessage, setPickerMessage] = useState("");

  const normalizeHex = (value: string) => {
    const v = value.trim();
    if (/^#[0-9a-f]{3}$/i.test(v)) {
      return `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`.toLowerCase();
    }
    if (/^#[0-9a-f]{6}$/i.test(v)) return v.toLowerCase();
    const rgb = v.match(
      /^rgba?\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*[0-9.]+)?\s*\)$/i
    );
    if (rgb) {
      const toHex = (n: string) =>
        Math.max(0, Math.min(255, parseInt(n, 10)))
          .toString(16)
          .padStart(2, "0");
      return `#${toHex(rgb[1])}${toHex(rgb[2])}${toHex(rgb[3])}`;
    }
    return v;
  };

  const colorInputValue = (value: string, fallback = "#1a1a2e") => {
    const hex = normalizeHex(value);
    return /^#[0-9a-f]{6}$/i.test(hex) ? hex : fallback;
  };

  const updateColor = (key: ColorKey, value: string) => {
    updateSettings({
      colors: { ...s.colors, [key]: value },
    });
  };

  const applyPickedColor = () => {
    const hex = normalizeHex(pickedColor);
    updateColor(activeColorKey, hex);
    setPickerMessage(`Applicato ${hex} a ${activeColorKey}`);
  };

  const openEyeDropper = async () => {
    const w = window as Window & {
      EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> };
    };
    if (!w.EyeDropper) {
      setPickerMessage("Contagocce di sistema non supportato su questo browser.");
      return;
    }
    try {
      const eyeDropper = new w.EyeDropper();
      const result = await eyeDropper.open();
      setPickedColor(result.sRGBHex);
      updateColor(activeColorKey, result.sRGBHex);
      setPickerMessage(`Colore catturato: ${result.sRGBHex}`);
    } catch {
      setPickerMessage("Selezione colore annullata.");
    }
  };

  const sampleImageColor = async (
    url: string,
    event: React.MouseEvent<HTMLImageElement>
  ) => {
    try {
      const rect = event.currentTarget.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = url;
      await img.decode();

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const x = Math.max(0, Math.min(img.naturalWidth - 1, Math.floor(px * img.naturalWidth)));
      const y = Math.max(0, Math.min(img.naturalHeight - 1, Math.floor(py * img.naturalHeight)));
      const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
      const hex = `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
      setPickedColor(hex);
      updateColor(activeColorKey, hex);
      setPickerMessage(`Colore campionato dall'immagine: ${hex}`);
    } catch {
      setPickerMessage("Impossibile leggere il colore da questa immagine.");
    }
  };

  const imageSources = [
    { label: "Logo squadra", url: s.logoUrl },
    { label: "Logo app", url: s.appIconUrl || s.logoUrl },
    ...bgPages.map((bg) => ({ label: `Sfondo ${bg.label}`, url: s.backgrounds[bg.key] })),
  ].filter((x): x is { label: string; url: string } => Boolean(x.url));

  const quickPalette = [
    ...Object.values(s.colors).map((c) => normalizeHex(c)),
    "#000000",
    "#ffffff",
    "#f44336",
    "#e91e63",
    "#9c27b0",
    "#673ab7",
    "#3f51b5",
    "#2196f3",
    "#03a9f4",
    "#00bcd4",
    "#009688",
    "#4caf50",
    "#8bc34a",
    "#cddc39",
    "#ffeb3b",
    "#ffc107",
    "#ff9800",
    "#ff5722",
    "#795548",
    "#607d8b",
  ].filter((value, i, arr) => /^#[0-9a-f]{6}$/i.test(value) && arr.indexOf(value) === i);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Personalizzazione Completa</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nome Squadra">
          <input
            value={s.teamName}
            onChange={(e) => updateSettings({ teamName: e.target.value })}
            className="input-field"
          />
        </Field>
        <Field label="Motto">
          <input
            value={s.motto}
            onChange={(e) => updateSettings({ motto: e.target.value })}
            className="input-field"
          />
        </Field>
        <Field label="Font">
          <select
            value={s.fontFamily}
            onChange={(e) => updateSettings({ fontFamily: e.target.value })}
            className="input-field"
          >
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
            onChange={(e) =>
              updateSettings({ navStyle: e.target.value as "solid" | "glass" })
            }
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
          {(
            [
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
            ] as const
          ).map(([key, label]) => (
            <Field key={key} label={label}>
              <input
                value={s.branding[key]}
                onChange={(e) =>
                  updateSettings({
                    branding: { ...s.branding, [key]: e.target.value },
                  })
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
                updateSettings({
                  branding: { ...s.branding, welcomeMessage: e.target.value },
                })
              }
              className="input-field min-h-20"
              placeholder="Testo sotto il motto"
            />
          </Field>
          <Field label="Chi siamo / presentazione">
            <textarea
              value={s.branding.aboutText}
              onChange={(e) =>
                updateSettings({
                  branding: { ...s.branding, aboutText: e.target.value },
                })
              }
              className="input-field min-h-24"
            />
          </Field>
          <Field label="Testo footer">
            <input
              value={s.branding.footerText}
              onChange={(e) =>
                updateSettings({
                  branding: { ...s.branding, footerText: e.target.value },
                })
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
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setActiveColorKey(key)}
                  className={`w-full rounded-lg border px-2 py-1 text-left text-xs ${
                    activeColorKey === key
                      ? "border-[var(--team-accent)] bg-[var(--team-accent)]/15"
                      : "border-white/15 bg-white/5"
                  }`}
                >
                  Campo attivo per contagocce: <b>{label}</b>
                </button>
                <div className="flex items-center gap-2">
                  <span
                    className="h-6 w-6 rounded border border-white/20"
                    style={{ backgroundColor: colorInputValue(s.colors[key]) }}
                  />
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
              </div>
            </Field>
          ))}
        </div>

        <div className="mt-4 space-y-3 rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-sm font-semibold">Strumenti colore avanzati</p>
          <p className="text-xs opacity-70">
            Scegli un campo attivo sopra, poi usa contagocce o clicca su un&apos;immagine per copiare quel colore.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="color"
              value={colorInputValue(pickedColor)}
              onChange={(e) => setPickedColor(e.target.value)}
              className="h-10 w-10 cursor-pointer rounded border-0"
            />
            <input
              value={pickedColor}
              onChange={(e) => setPickedColor(e.target.value)}
              className="input-field max-w-[180px]"
            />
            <button type="button" onClick={applyPickedColor} className="btn-add">
              Applica al campo attivo
            </button>
            <button
              type="button"
              onClick={openEyeDropper}
              className="rounded-lg border border-white/20 px-3 py-2 text-sm hover:bg-white/10"
            >
              Contagocce schermo
            </button>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(normalizeHex(pickedColor))}
              className="rounded-lg border border-white/20 px-3 py-2 text-sm hover:bg-white/10"
            >
              Copia codice
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickPalette.map((hex) => (
              <button
                key={hex}
                type="button"
                title={hex}
                onClick={() => {
                  setPickedColor(hex);
                  updateColor(activeColorKey, hex);
                }}
                className="h-7 w-7 rounded border border-white/20"
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>
          {pickerMessage && <p className="text-xs opacity-70">{pickerMessage}</p>}
        </div>

        {imageSources.length > 0 && (
          <div className="mt-4 space-y-3 rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-sm font-semibold">Copia colore da immagine esistente</p>
            <p className="text-xs opacity-70">
              Clicca dentro l&apos;immagine per campionare il colore nel punto toccato.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {imageSources.map((item) => (
                <button
                  type="button"
                  key={`${item.label}-${item.url}`}
                  className="rounded-xl border border-white/10 bg-black/20 p-2 text-left"
                >
                  <p className="mb-1 text-xs opacity-70">{item.label}</p>
                  <img
                    src={item.url}
                    alt={item.label}
                    onClick={(e) => {
                      e.preventDefault();
                      void sampleImageColor(item.url, e);
                    }}
                    className="h-28 w-full rounded-lg object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <Field label="Logo Squadra">
        <ImageUpload
          current={s.logoUrl}
          onUpload={(f) =>
            onUpload(f, (url) => updateSettings({ logoUrl: url }))
          }
          onUrlApply={(url) => updateSettings({ logoUrl: url })}
          onClear={() => updateSettings({ logoUrl: "" })}
        />
      </Field>

      <Field label="Logo App installabile (icona)">
        <ImageUpload
          current={s.appIconUrl || ""}
          onUpload={(f) =>
            onUpload(f, (url) => updateSettings({ appIconUrl: url }))
          }
          onUrlApply={(url) => updateSettings({ appIconUrl: url })}
          onClear={() => updateSettings({ appIconUrl: "" })}
        />
        <p className="mt-1 text-xs opacity-60">
          Questo logo viene usato per l&apos;icona quando l&apos;app viene installata su telefono o computer.
        </p>
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
                    updateSettings({
                      backgrounds: { ...s.backgrounds, [key]: url },
                    })
                  )
                }
                onUrlApply={(url) =>
                  updateSettings({
                    backgrounds: { ...s.backgrounds, [key]: url },
                  })
                }
                onClear={() =>
                  updateSettings({
                    backgrounds: { ...s.backgrounds, [key]: "" },
                  })
                }
              />
            </Field>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlayersTab({
  draft,
  setDraft,
  onUpload,
}: {
  draft: TeamData;
  setDraft: (d: TeamData) => void;
  onUpload: (f: File, cb: (url: string) => void) => void;
}) {
  const addPlayer = () => {
    const id = `p${Date.now()}`;
    setDraft({
      ...draft,
      players: [
        ...draft.players,
        {
          id,
          name: "Nuovo Giocatore",
          number: Math.min(100, draft.players.length + 1),
          position: "Ruolo",
          role: "CEN",
          birthDate: "2000-01-01",
          nationality: "Italia",
          photoUrl: "",
          stats: { goals: 0, assists: 0, appearances: 0 },
        },
      ],
    });
  };

  const updatePlayer = (idx: number, patch: Partial<(typeof draft.players)[0]>) => {
    const players = [...draft.players];
    players[idx] = { ...players[idx], ...patch };
    setDraft({ ...draft, players });
  };

  const removePlayer = (idx: number) => {
    setDraft({ ...draft, players: draft.players.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Gestione Rosa</h2>
        <button onClick={addPlayer} className="btn-add">
          + Aggiungi Giocatore
        </button>
      </div>
      {draft.players.map((p, i) => (
        <div key={p.id} className="rounded-xl border border-white/10 p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Nome">
              <input
                value={p.name}
                onChange={(e) => updatePlayer(i, { name: e.target.value })}
                className="input-field"
              />
            </Field>
            <Field label="Numero maglia (0–100)">
              <ShirtNumberSelect
                value={p.number}
                onChange={(number) => updatePlayer(i, { number })}
              />
            </Field>
            <Field label="Ruolo">
              <select
                value={p.role}
                onChange={(e) =>
                  updatePlayer(i, {
                    role: e.target.value as "POR" | "DIF" | "CEN" | "ATT",
                  })
                }
                className="input-field"
              >
                <option value="POR">Portiere</option>
                <option value="DIF">Difensore</option>
                <option value="CEN">Centrocampista</option>
                <option value="ATT">Attaccante</option>
              </select>
            </Field>
            <Field label="Posizione">
              <input
                value={p.position}
                onChange={(e) => updatePlayer(i, { position: e.target.value })}
                className="input-field"
              />
            </Field>
            <Field label="Nazionalità">
              <input
                value={p.nationality}
                onChange={(e) => updatePlayer(i, { nationality: e.target.value })}
                className="input-field"
              />
            </Field>
            <Field label="Data di nascita">
              <input
                type="date"
                value={p.birthDate}
                onChange={(e) => updatePlayer(i, { birthDate: e.target.value })}
                className="input-field"
              />
            </Field>
            <Field label="Stato">
              <select
                value={p.status || "available"}
                onChange={(e) =>
                  updatePlayer(i, { status: e.target.value as PlayerStatus })
                }
                className="input-field"
              >
                <option value="available">Disponibile</option>
                <option value="injured">Infortunato</option>
                <option value="suspended">Squalificato</option>
                <option value="unavailable">Indisponibile</option>
              </select>
            </Field>
            <Field label="Piede">
              <select
                value={p.foot || "destro"}
                onChange={(e) =>
                  updatePlayer(i, {
                    foot: e.target.value as "destro" | "sinistro" | "ambidestro",
                  })
                }
                className="input-field"
              >
                <option value="destro">Destro</option>
                <option value="sinistro">Sinistro</option>
                <option value="ambidestro">Ambidestro</option>
              </select>
            </Field>
            <Field label="Altezza">
              <input
                value={p.height || ""}
                onChange={(e) => updatePlayer(i, { height: e.target.value })}
                className="input-field"
              />
            </Field>
            <Field label="Peso">
              <input
                value={p.weight || ""}
                onChange={(e) => updatePlayer(i, { weight: e.target.value })}
                className="input-field"
              />
            </Field>
            <Field label="Gialli">
              <input
                type="number"
                value={p.yellowCards || 0}
                onChange={(e) =>
                  updatePlayer(i, { yellowCards: parseInt(e.target.value) || 0 })
                }
                className="input-field"
              />
            </Field>
            <Field label="Rossi">
              <input
                type="number"
                value={p.redCards || 0}
                onChange={(e) =>
                  updatePlayer(i, { redCards: parseInt(e.target.value) || 0 })
                }
                className="input-field"
              />
            </Field>
            <Field label="Minuti">
              <input
                type="number"
                value={p.minutes || 0}
                onChange={(e) =>
                  updatePlayer(i, { minutes: parseInt(e.target.value) || 0 })
                }
                className="input-field"
              />
            </Field>
            <Field label="Bio">
              <input
                value={p.bio || ""}
                onChange={(e) => updatePlayer(i, { bio: e.target.value })}
                className="input-field"
              />
            </Field>
            <Field label="Gol">
              <input
                type="number"
                value={p.stats.goals}
                onChange={(e) =>
                  updatePlayer(i, {
                    stats: { ...p.stats, goals: parseInt(e.target.value) || 0 },
                  })
                }
                className="input-field"
              />
            </Field>
            <Field label="Assist">
              <input
                type="number"
                value={p.stats.assists}
                onChange={(e) =>
                  updatePlayer(i, {
                    stats: { ...p.stats, assists: parseInt(e.target.value) || 0 },
                  })
                }
                className="input-field"
              />
            </Field>
            <Field label="Presenze">
              <input
                type="number"
                value={p.stats.appearances}
                onChange={(e) =>
                  updatePlayer(i, {
                    stats: {
                      ...p.stats,
                      appearances: parseInt(e.target.value) || 0,
                    },
                  })
                }
                className="input-field"
              />
            </Field>
          </div>
          <Field label="Foto">
            <ImageUpload
              current={p.photoUrl}
              onUpload={(f) =>
                onUpload(f, (url) => updatePlayer(i, { photoUrl: url }))
              }
              onUrlApply={(url) => updatePlayer(i, { photoUrl: url })}
              onClear={() => updatePlayer(i, { photoUrl: "" })}
            />
          </Field>
          <button
            onClick={() => removePlayer(i)}
            className="mt-2 text-sm text-red-400 hover:underline"
          >
            Elimina giocatore
          </button>
        </div>
      ))}
    </div>
  );
}

function StaffTab({
  draft,
  setDraft,
  onUpload,
}: {
  draft: TeamData;
  setDraft: (d: TeamData) => void;
  onUpload: (f: File, cb: (url: string) => void) => void;
}) {
  const addStaff = () => {
    setDraft({
      ...draft,
      staff: [
        ...draft.staff,
        { id: `s${Date.now()}`, name: "Nuovo Staff", role: "Ruolo", photoUrl: "" },
      ],
    });
  };

  const updateStaff = (idx: number, patch: Partial<(typeof draft.staff)[0]>) => {
    const staff = [...draft.staff];
    staff[idx] = { ...staff[idx], ...patch };
    setDraft({ ...draft, staff });
  };

  const removeStaff = (idx: number) => {
    setDraft({ ...draft, staff: draft.staff.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Gestione Staff</h2>
        <button onClick={addStaff} className="btn-add">
          + Aggiungi Staff
        </button>
      </div>
      {draft.staff.map((s, i) => (
        <div key={s.id} className="rounded-xl border border-white/10 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Nome">
              <input
                value={s.name}
                onChange={(e) => updateStaff(i, { name: e.target.value })}
                className="input-field"
              />
            </Field>
            <Field label="Ruolo">
              <input
                value={s.role}
                onChange={(e) => updateStaff(i, { role: e.target.value })}
                className="input-field"
              />
            </Field>
          </div>
          <Field label="Foto">
            <ImageUpload
              current={s.photoUrl}
              onUpload={(f) =>
                onUpload(f, (url) => updateStaff(i, { photoUrl: url }))
              }
              onUrlApply={(url) => updateStaff(i, { photoUrl: url })}
              onClear={() => updateStaff(i, { photoUrl: "" })}
            />
          </Field>
          <button
            onClick={() => removeStaff(i)}
            className="mt-2 text-sm text-red-400 hover:underline"
          >
            Elimina
          </button>
        </div>
      ))}
    </div>
  );
}

function MatchesTab({
  draft,
  setDraft,
}: {
  draft: TeamData;
  setDraft: (d: TeamData) => void;
}) {
  const addMatch = (kind: MatchKind) => {
    setDraft({
      ...draft,
      matches: [...draft.matches, createMatch(kind)],
    });
  };

  const updateMatch = (idx: number, patch: Partial<(typeof draft.matches)[0]>) => {
    const matches = [...draft.matches];
    matches[idx] = { ...matches[idx], ...patch };
    setDraft({ ...draft, matches });
  };

  const removeMatch = (idx: number) => {
    setDraft({ ...draft, matches: draft.matches.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-8">
      <CalendarGallery draft={draft} setDraft={setDraft} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">Gestione partite</h2>
          <p className="mt-1 text-sm opacity-60">
            Tocca un tipo per ogni voce: partita, allenamento o amichevole. In amichevole scrivi liberamente contro chi si gioca.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => addMatch("partita")} className="btn-add">
            + Partita
          </button>
          <button type="button" onClick={() => addMatch("allenamento")} className="btn-add">
            + Allenamento
          </button>
          <button type="button" onClick={() => addMatch("amichevole")} className="btn-add">
            + Amichevole
          </button>
        </div>
      </div>
      {draft.matches.map((m, i) => {
        const kind = getMatchKind(m);
        const accent = m.color || MATCH_KIND_META[kind].color;
        return (
          <div
            key={m.id}
            className="relative overflow-hidden rounded-xl border p-4 pl-5"
            style={{
              borderColor: hexAlpha(accent, 0.4),
            }}
          >
            <span
              className="absolute inset-y-0 left-0 w-1.5"
              style={{ background: accent }}
              aria-hidden
            />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {MATCH_KINDS.map((option) => {
                const meta = MATCH_KIND_META[option];
                const selected = kind === option;
                return (
                  <button
                    type="button"
                    key={option}
                    onClick={() => {
                      if (kind === option) return;
                      updateMatch(i, applyMatchKind(m, option));
                    }}
                    className={`rounded-xl border px-3 py-3 text-left transition ${
                      selected
                        ? "border-[var(--team-accent)] bg-[var(--team-accent)]/18 shadow-[0_0_0_1px_var(--team-accent)]"
                        : "border-white/10 bg-white/5 hover:bg-white/8"
                    }`}
                    aria-pressed={selected}
                  >
                    <p className="text-sm font-black tracking-tight">{meta.title}</p>
                    <p className="mt-1 text-[11px] leading-snug opacity-70">{meta.desc}</p>
                  </button>
                );
              })}
            </div>

            {kind === "amichevole" ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <Field label="Data">
                  <input
                    type="date"
                    value={m.date.slice(0, 10)}
                    onChange={(e) => updateMatch(i, { date: e.target.value })}
                    className="input-field"
                  />
                </Field>
                <Field label="Orario">
                  <input
                    type="time"
                    value={m.time}
                    onChange={(e) => updateMatch(i, { time: e.target.value })}
                    className="input-field"
                  />
                </Field>
                <Field label="Campo">
                  <input
                    value={m.location}
                    onChange={(e) => updateMatch(i, { location: e.target.value })}
                    placeholder="Campo"
                    className="input-field"
                  />
                </Field>
                <Field label="Avversario">
                  <input
                    value={m.opponent}
                    onChange={(e) => updateMatch(i, { opponent: e.target.value })}
                    placeholder="Scrivi il nome della squadra"
                    className="input-field"
                  />
                </Field>
              </div>
            ) : kind === "allenamento" ? (
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <Field label="Data">
                  <input
                    type="date"
                    value={m.date.slice(0, 10)}
                    onChange={(e) => updateMatch(i, { date: e.target.value })}
                    className="input-field"
                  />
                </Field>
                <Field label="Orario">
                  <input
                    type="time"
                    value={m.time}
                    onChange={(e) => updateMatch(i, { time: e.target.value })}
                    className="input-field"
                  />
                </Field>
                <Field label="Campo">
                  <input
                    value={m.location}
                    onChange={(e) => updateMatch(i, { location: e.target.value })}
                    placeholder="Campo"
                    className="input-field"
                  />
                </Field>
                <Field label="Focus (opzionale)">
                  <input
                    value={m.note || ""}
                    onChange={(e) => updateMatch(i, { note: e.target.value })}
                    placeholder="es. Tattica, palle inattive"
                    className="input-field"
                  />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Colore in calendario">
                    <ColorSwatch
                      value={m.color || MATCH_KIND_META.allenamento.color}
                      onChange={(color) => updateMatch(i, { color })}
                    />
                  </Field>
                </div>
              </div>
            ) : (
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <Field label="Data">
                  <input
                    type="date"
                    value={m.date.slice(0, 10)}
                    onChange={(e) => updateMatch(i, { date: e.target.value })}
                    className="input-field"
                  />
                </Field>
                <Field label="Ora">
                  <input
                    type="time"
                    value={m.time}
                    onChange={(e) => updateMatch(i, { time: e.target.value })}
                    className="input-field"
                  />
                </Field>
                <Field label="Avversario">
                  <input
                    value={m.opponent}
                    onChange={(e) => updateMatch(i, { opponent: e.target.value })}
                    className="input-field"
                  />
                </Field>
                <Field label="Luogo">
                  <input
                    value={m.location}
                    onChange={(e) => updateMatch(i, { location: e.target.value })}
                    className="input-field"
                  />
                </Field>
                <Field label="Competizione">
                  <input
                    value={m.competition}
                    onChange={(e) => updateMatch(i, { competition: e.target.value })}
                    className="input-field"
                  />
                </Field>
                <Field label="Risultato (noi-loro)">
                  <input
                    value={m.result || ""}
                    onChange={(e) => updateMatch(i, { result: e.target.value })}
                    placeholder="Noi-loro, es. 2-1"
                    className="input-field"
                  />
                </Field>
                <Field label="Priorità">
                  <select
                    value={m.priority || "media"}
                    onChange={(e) =>
                      updateMatch(i, {
                        priority: e.target.value as "alta" | "media" | "bassa",
                      })
                    }
                    className="input-field"
                  >
                    <option value="alta">Alta</option>
                    <option value="media">Media</option>
                    <option value="bassa">Bassa</option>
                  </select>
                </Field>
                <Field label="Note partita">
                  <input
                    value={m.note || ""}
                    onChange={(e) => updateMatch(i, { note: e.target.value })}
                    placeholder="es. Arrivare 90 min prima"
                    className="input-field"
                  />
                </Field>
                <Field label="Casa/Trasferta">
                  <select
                    value={m.isHome ? "home" : "away"}
                    onChange={(e) =>
                      updateMatch(i, { isHome: e.target.value === "home" })
                    }
                    className="input-field"
                  >
                    <option value="home">Casa</option>
                    <option value="away">Trasferta</option>
                  </select>
                </Field>
                <div className="md:col-span-3">
                  <Field label="Colore in calendario">
                    <ColorSwatch
                      value={m.color || defaultEventColor("match")}
                      onChange={(color) => updateMatch(i, { color })}
                    />
                  </Field>
                </div>
                <Field label="Arbitro">
                  <input
                    value={m.referee || ""}
                    onChange={(e) => updateMatch(i, { referee: e.target.value })}
                    className="input-field"
                  />
                </Field>
                <Field label="TV">
                  <input
                    value={m.tv || ""}
                    onChange={(e) => updateMatch(i, { tv: e.target.value })}
                    className="input-field"
                  />
                </Field>
                <Field label="Meteo">
                  <input
                    value={m.weather || ""}
                    onChange={(e) => updateMatch(i, { weather: e.target.value })}
                    className="input-field"
                  />
                </Field>
                <Field label="Preview">
                  <input
                    value={m.preview || ""}
                    onChange={(e) => updateMatch(i, { preview: e.target.value })}
                    className="input-field"
                  />
                </Field>
                <Field label="Cronaca">
                  <input
                    value={m.report || ""}
                    onChange={(e) => updateMatch(i, { report: e.target.value })}
                    className="input-field"
                  />
                </Field>
              </div>
            )}
            <button
              type="button"
              onClick={() => removeMatch(i)}
              className="mt-2 text-sm text-red-400 hover:underline"
            >
              {kind === "allenamento"
                ? "Elimina allenamento"
                : kind === "amichevole"
                  ? "Elimina amichevole"
                  : "Elimina partita"}
            </button>
          </div>
        );
      })}

      <EventsTab draft={draft} setDraft={setDraft} />
    </div>
  );
}

function FormationTab({
  draft,
  setDraft,
}: {
  draft: TeamData;
  setDraft: (d: TeamData) => void;
}) {
  const f = draft.formation;

  const updateFormation = (patch: Partial<typeof f>) => {
    setDraft({ ...draft, formation: { ...f, ...patch } });
  };

  const applyPreset = (scheme: string) => {
    const positions = FORMATION_PRESETS[scheme];
    if (!positions) {
      updateFormation({ scheme });
      return;
    }
    const starters = f.starters.slice(0, 11).map((slot, i) => ({
      ...slot,
      x: positions[i]?.x ?? slot.x,
      y: positions[i]?.y ?? slot.y,
    }));
    updateFormation({ scheme, starters });
  };

  const updateScheme = (scheme: string) => applyPreset(scheme);

  const toggleStarter = (playerId: string) => {
    const isStarter = f.starters.some((s) => s.playerId === playerId);
    const isBench = f.bench.includes(playerId);

    if (isStarter) {
      setDraft({
        ...draft,
        formation: {
          ...f,
          starters: f.starters.filter((s) => s.playerId !== playerId),
          bench: [...f.bench, playerId],
        },
      });
    } else if (isBench) {
      setDraft({
        ...draft,
        formation: {
          ...f,
          bench: f.bench.filter((id) => id !== playerId),
          starters: [
            ...f.starters,
            { playerId, x: 50, y: 50 },
          ],
        },
      });
    } else if (f.starters.length < 11) {
      setDraft({
        ...draft,
        formation: {
          ...f,
          starters: [...f.starters, { playerId, x: 50, y: 50 }],
        },
      });
    }
  };

  const updatePosition = (playerId: string, x: number, y: number) => {
    setDraft({
      ...draft,
      formation: {
        ...f,
        starters: f.starters.map((s) =>
          s.playerId === playerId ? { ...s, x, y } : s
        ),
      },
    });
  };

  const starterIds = new Set(f.starters.map((s) => s.playerId));
  const benchIds = new Set(f.bench);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Formazione Ufficiale</h2>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Modulo">
          <select
            value={f.scheme}
            onChange={(e) => updateScheme(e.target.value)}
            className="input-field"
          >
            {FORMATION_SCHEMES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Colore campo 1">
          <input
            type="color"
            value={f.pitchColor || "#1a7a3a"}
            onChange={(e) => updateFormation({ pitchColor: e.target.value })}
            className="h-10 w-full"
          />
        </Field>
        <Field label="Colore campo 2">
          <input
            type="color"
            value={f.pitchColor2 || "#0d5c28"}
            onChange={(e) => updateFormation({ pitchColor2: e.target.value })}
            className="h-10 w-full"
          />
        </Field>
        <Field label="Capitano">
          <select
            value={f.captainId || ""}
            onChange={(e) => updateFormation({ captainId: e.target.value })}
            className="input-field"
          >
            <option value="">Nessuno</option>
            {draft.players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.number}. {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Nota formazione (visibile a tutti)">
          <input
            value={f.note || ""}
            onChange={(e) => updateFormation({ note: e.target.value })}
            className="input-field"
            placeholder="es. Pressing alto, palla a terra"
          />
        </Field>
      </div>

      <p className="rounded-xl bg-white/5 px-4 py-3 text-sm opacity-80">
        Solo gli amministratori possono modificare la formazione. La pagina pubblica è in sola lettura.
      </p>

      <div className="flex flex-wrap gap-2">
        {FORMATION_SCHEMES.map((scheme) => (
          <button
            key={scheme}
            type="button"
            onClick={() => applyPreset(scheme)}
            className="rounded-lg bg-white/10 px-3 py-2 text-xs"
          >
            Preset {scheme}
          </button>
        ))}
      </div>

      <FormationEditor
        formation={f}
        players={draft.players}
        onUpdateSlot={updatePosition}
        settings={draft.settings}
        graphicId={draft.settings.ui.playerGraphicId}
      />

      <p className="text-sm opacity-70">
        Clicca sui giocatori sotto per titolari/panchina. Titolari: {f.starters.length}/11
      </p>

      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
        {draft.players.map((p) => {
          const isStarter = starterIds.has(p.id);
          const isBench = benchIds.has(p.id);

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => toggleStarter(p.id)}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                isStarter
                  ? "border-[var(--team-accent)] bg-[var(--team-accent)]/10"
                  : isBench
                    ? "border-white/20 bg-white/5"
                    : "border-white/10 opacity-50"
              }`}
            >
              <PlayerKit
                player={p}
                size="xs"
                animate={false}
                graphicId={draft.settings.ui.playerGraphicId}
              />
              <span className="min-w-0">
                <span className="block font-bold">
                  <span className="font-black text-[var(--team-accent)]">{p.number}</span>{" "}
                  {p.name}
                </span>
                <span className="text-xs opacity-60">
                  {isStarter ? "TITOLARE" : isBench ? "PANCHINA" : "—"}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DesignTab({
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
      <section className="space-y-4">
        <ThemeGallery draft={draft} setDraft={setDraft} />
      </section>

      <section className="space-y-4 border-t border-white/10 pt-6">
        <PlayerGraphicGallery draft={draft} setDraft={setDraft} />
      </section>

      <section className="space-y-4 border-t border-white/10 pt-6">
      <h2 className="text-xl font-bold">Controlli visivi dell&apos;app</h2>
      <p className="text-sm opacity-70">
        Dopo aver scelto un tema puoi ritoccare layout, sezioni e dettagli.
      </p>

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
        <Toggle label="Card Admin in Home (solo admin)" checked={ui.showHomeAdminCard} onChange={(v) => updateUi({ showHomeAdminCard: v })} />
      </div>
      </section>
    </div>
  );
}

function ContentTab({
  draft,
  setDraft,
  onUpload,
}: {
  draft: TeamData;
  setDraft: (d: TeamData) => void;
  onUpload: (f: File, cb: (url: string) => void) => void;
}) {
  const updateAnn = (idx: number, patch: Partial<(typeof draft.announcements)[0]>) => {
    const announcements = [...draft.announcements];
    announcements[idx] = { ...announcements[idx], ...patch };
    setDraft({ ...draft, announcements });
  };
  const updateTraining = (idx: number, patch: Partial<(typeof draft.trainings)[0]>) => {
    const trainings = [...draft.trainings];
    trainings[idx] = { ...trainings[idx], ...patch };
    setDraft({ ...draft, trainings });
  };
  const updateSponsor = (idx: number, patch: Partial<(typeof draft.sponsors)[0]>) => {
    const sponsors = [...draft.sponsors];
    sponsors[idx] = { ...sponsors[idx], ...patch };
    setDraft({ ...draft, sponsors });
  };
  const updateSocial = (idx: number, patch: Partial<(typeof draft.socialLinks)[0]>) => {
    const socialLinks = [...draft.socialLinks];
    socialLinks[idx] = { ...socialLinks[idx], ...patch };
    setDraft({ ...draft, socialLinks });
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold">News / Comunicazioni</h2>
          <button
            onClick={() =>
              setDraft({
                ...draft,
                announcements: [
                  ...draft.announcements,
                  {
                    id: `a${Date.now()}`,
                    title: "Nuova comunicazione",
                    description: "",
                    pinned: false,
                  },
                ],
              })
            }
            className="btn-add"
          >
            + Aggiungi news
          </button>
        </div>
        <div className="space-y-3">
          {draft.announcements.map((a, i) => (
            <div key={a.id} className="rounded-xl border border-white/10 p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Titolo">
                  <input
                    value={a.title}
                    onChange={(e) => updateAnn(i, { title: e.target.value })}
                    className="input-field"
                  />
                </Field>
                <Field label="In evidenza">
                  <select
                    value={a.pinned ? "yes" : "no"}
                    onChange={(e) => updateAnn(i, { pinned: e.target.value === "yes" })}
                    className="input-field"
                  >
                    <option value="yes">Sì</option>
                    <option value="no">No</option>
                  </select>
                </Field>
              </div>
              <Field label="Descrizione">
                <textarea
                  value={a.description}
                  onChange={(e) => updateAnn(i, { description: e.target.value })}
                  className="input-field min-h-20"
                />
              </Field>
              <button
                type="button"
                onClick={() =>
                  setDraft({
                    ...draft,
                    announcements: draft.announcements.filter((_, idx) => idx !== i),
                  })
                }
                className="mt-2 text-sm text-red-400 hover:underline"
              >
                Elimina news
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold">Allenamenti</h2>
          <button
            onClick={() =>
              setDraft({
                ...draft,
                trainings: [
                  ...draft.trainings,
                  {
                    id: `t${Date.now()}`,
                    day: "Lunedì",
                    time: "19:00",
                    location: "Campo",
                    focus: "Tecnica",
                  },
                ],
              })
            }
            className="btn-add"
          >
            + Aggiungi allenamento
          </button>
        </div>
        <div className="space-y-3">
          {draft.trainings.map((t, i) => (
            <div key={t.id} className="grid gap-3 rounded-xl border border-white/10 p-4 md:grid-cols-4">
              <Field label="Giorno">
                <input value={t.day} onChange={(e) => updateTraining(i, { day: e.target.value })} className="input-field" />
              </Field>
              <Field label="Ora">
                <input value={t.time} onChange={(e) => updateTraining(i, { time: e.target.value })} className="input-field" />
              </Field>
              <Field label="Luogo">
                <input value={t.location} onChange={(e) => updateTraining(i, { location: e.target.value })} className="input-field" />
              </Field>
              <Field label="Focus">
                <input value={t.focus} onChange={(e) => updateTraining(i, { focus: e.target.value })} className="input-field" />
              </Field>
              <button
                type="button"
                onClick={() =>
                  setDraft({
                    ...draft,
                    trainings: draft.trainings.filter((_, idx) => idx !== i),
                  })
                }
                className="text-sm text-red-400 hover:underline md:col-span-4"
              >
                Elimina allenamento
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-xl font-bold">Sponsor & Social</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Sponsor</h3>
              <button
                onClick={() =>
                  setDraft({
                    ...draft,
                    sponsors: [...draft.sponsors, { id: `sp${Date.now()}`, name: "Nuovo sponsor", logoUrl: "", website: "" }],
                  })
                }
                className="btn-add"
              >
                + Sponsor
              </button>
            </div>
            {draft.sponsors.map((sp, i) => (
              <div key={sp.id} className="rounded-xl border border-white/10 p-3">
                <Field label="Nome">
                  <input value={sp.name} onChange={(e) => updateSponsor(i, { name: e.target.value })} className="input-field" />
                </Field>
                <Field label="Sito web">
                  <input value={sp.website} onChange={(e) => updateSponsor(i, { website: e.target.value })} className="input-field" />
                </Field>
                <Field label="Logo">
                  <ImageUpload
                    current={sp.logoUrl}
                    onUpload={(f) => onUpload(f, (url) => updateSponsor(i, { logoUrl: url }))}
                    onUrlApply={(url) => updateSponsor(i, { logoUrl: url })}
                    onClear={() => updateSponsor(i, { logoUrl: "" })}
                  />
                </Field>
                <button
                  type="button"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      sponsors: draft.sponsors.filter((_, idx) => idx !== i),
                    })
                  }
                  className="mt-2 text-sm text-red-400 hover:underline"
                >
                  Elimina sponsor
                </button>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Social</h3>
              <button
                onClick={() =>
                  setDraft({
                    ...draft,
                    socialLinks: [...draft.socialLinks, { id: `so${Date.now()}`, label: "Nuovo social", url: "" }],
                  })
                }
                className="btn-add"
              >
                + Social
              </button>
            </div>
            {draft.socialLinks.map((sl, i) => (
              <div key={sl.id} className="rounded-xl border border-white/10 p-3">
                <Field label="Nome">
                  <input value={sl.label} onChange={(e) => updateSocial(i, { label: e.target.value })} className="input-field" />
                </Field>
                <Field label="URL">
                  <input value={sl.url} onChange={(e) => updateSocial(i, { url: e.target.value })} className="input-field" />
                </Field>
                <button
                  type="button"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      socialLinks: draft.socialLinks.filter((_, idx) => idx !== i),
                    })
                  }
                  className="mt-2 text-sm text-red-400 hover:underline"
                >
                  Elimina social
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StandingsTab({
  draft,
  setDraft,
}: {
  draft: TeamData;
  setDraft: (d: TeamData) => void;
}) {
  const s = draft.standings;

  const updateMeta = (patch: Partial<typeof s>) => {
    setDraft({ ...draft, standings: { ...s, ...patch } });
  };

  const addRow = () => {
    setDraft({
      ...draft,
      standings: {
        ...s,
        rows: [
          ...s.rows,
          {
            id: `st${Date.now()}`,
            name: "Nuova squadra",
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            isUs: false,
          },
        ],
      },
    });
  };

  const removeRow = (idx: number) => {
    setDraft({
      ...draft,
      standings: { ...s, rows: s.rows.filter((_, i) => i !== idx) },
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Classifica stagione</h2>
        <button type="button" onClick={addRow} className="btn-add">
          + Aggiungi squadra
        </button>
      </div>
      <p className="text-sm opacity-70">
        Punti, reti e posizioni si calcolano da soli dai risultati del calendario
        (formato noi-loro, es. 2-1). Coppe e amichevoli restano fuori. In diretta vale
        il punteggio live.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Titolo classifica">
          <input
            value={s.title}
            onChange={(e) => updateMeta({ title: e.target.value })}
            className="input-field"
          />
        </Field>
        <Field label="Stagione">
          <input
            value={s.season}
            onChange={(e) => updateMeta({ season: e.target.value })}
            className="input-field"
          />
        </Field>
      </div>
      <div className="space-y-3">
        {s.rows.map((row, i) => (
          <div key={row.id} className="rounded-xl border border-white/10 p-4">
            <div className="grid gap-3 md:grid-cols-4">
              <Field label="Squadra">
                <input
                  value={row.name}
                  onChange={(e) => {
                    const rows = [...s.rows];
                    rows[i] = { ...rows[i], name: e.target.value };
                    setDraft({ ...draft, standings: { ...s, rows } });
                  }}
                  className="input-field"
                />
              </Field>
              <div className="flex items-end md:col-span-2">
                <p className="text-sm opacity-80">
                  {i + 1}° · PG {row.played} · {row.won}V {row.drawn}N {row.lost}P ·{" "}
                  {row.goalsFor}-{row.goalsAgainst} · Pt {row.won * 3 + row.drawn}
                  {row.isUs ? " · NOI" : ""}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeRow(i)}
              className="mt-2 text-sm text-red-400 hover:underline"
            >
              Elimina squadra
            </button>
          </div>
        ))}
      </div>
    </div>
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
      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
        checked
          ? "border-[var(--team-accent)] bg-[var(--team-accent)]/10"
          : "border-white/15 bg-white/5"
      }`}
    >
      <span>{label}</span>
      <span className="font-bold">{checked ? "ON" : "OFF"}</span>
    </button>
  );
}

const SHIRT_NUMBERS = Array.from({ length: 101 }, (_, n) => n);

function clampShirtNumber(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function ShirtNumberSelect({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <select
      value={clampShirtNumber(value)}
      onChange={(e) => onChange(Number(e.target.value))}
      className="input-field"
      aria-label="Numero maglia da 0 a 100"
    >
      {SHIRT_NUMBERS.map((n) => (
        <option key={n} value={n}>
          {n}
        </option>
      ))}
    </select>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
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
  onUrlApply,
}: {
  current: string;
  onUpload: (file: File) => void;
  onClear?: () => void;
  onUrlApply?: (url: string) => void;
}) {
  const [urlDraft, setUrlDraft] = useState("");
  const [loading, setLoading] = useState(false);

  const pickFromCamera = async () => {
    setLoading(true);
    try {
      const file = await pickNativeImage();
      if (file) onUpload(file);
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (file?: File) => {
    if (file) onUpload(file);
  };

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-3">
      {current && (
        <img src={current} alt="Preview" className="h-24 w-24 rounded-lg object-cover ring-2 ring-[var(--team-accent)]" />
      )}

      <div className="grid grid-cols-2 gap-2">
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/25 bg-white/5 px-3 py-5 text-center">
          <span className="text-xl">🖼️</span>
          <span className="mt-1 text-xs font-semibold">Galleria</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.currentTarget.value = "";
            }}
          />
        </label>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/25 bg-white/5 px-3 py-5 text-center">
          <span className="text-xl">📷</span>
          <span className="mt-1 text-xs font-semibold">Fotocamera</span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.currentTarget.value = "";
            }}
          />
        </label>
      </div>

      <button type="button" onClick={pickFromCamera} disabled={loading} className="w-full rounded-lg bg-[var(--team-primary)] py-2 text-sm font-semibold disabled:opacity-50">
        Apri Camera / Galleria nativa
      </button>

      {onUrlApply && (
        <div className="flex gap-2">
          <input
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="Oppure incolla URL immagine"
            className="input-field flex-1"
          />
          <button
            type="button"
            onClick={() => {
              if (isValidImageUrl(urlDraft)) onUrlApply(urlDraft.trim());
            }}
            className="rounded-lg bg-white/10 px-3 text-sm"
          >
            Usa URL
          </button>
        </div>
      )}

      {current && onClear && (
        <button type="button" onClick={onClear} className="text-xs text-red-400 hover:underline">
          Rimuovi immagine
        </button>
      )}
    </div>
  );
}
