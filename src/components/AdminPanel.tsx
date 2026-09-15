"use client";

import { useEffect, useRef, useState } from "react";
import { uploadImageWithFallback } from "@/lib/images";
import AppDesignTab from "@/components/admin/AppDesignTab";
import {
  SettingsTab,
  PlayersTab,
  StaffTab,
  MatchesTab,
  FormationTab,
  ContentTab,
  StandingsTab,
} from "@/components/admin/AdminPanelParts";
import ClubTab from "@/components/admin/ClubTab";
import LiveTab from "@/components/admin/LiveTab";
import CallupBoard from "@/components/CallupBoard";
import WhatsAppTab from "@/components/admin/WhatsAppTab";
import SmsTab from "@/components/admin/SmsTab";
import EventsTab from "@/components/admin/EventsTab";
import DocumentsTab from "@/components/admin/DocumentsTab";
import FinesTab from "@/components/admin/FinesTab";
import UsersTab from "@/components/admin/UsersTab";
import DeveloperGate from "@/components/DeveloperGate";
import { todayKey } from "@/lib/dates";
import { syncStandings } from "@/lib/standings";
import type { TeamData } from "@/lib/types";

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

export default function AdminPanel({
  data,
  onSave,
  onLogout,
  allowedTabs,
  limitedClubTab = false,
  title = "Pannello Admin",
}: AdminPanelProps & { allowedTabs?: AdminTab[]; limitedClubTab?: boolean; title?: string }) {
  const [draft, setDraftRaw] = useState<TeamData>(() => syncStandings(structuredClone(data)));
  const setDraft = (next: TeamData) => setDraftRaw(syncStandings(next));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const tabs: { id: AdminTab; label: string }[] = [
    { id: "impostazioni", label: "Impostazioni" },
    { id: "design", label: "Design App" },
    { id: "rosa", label: "Rosa" },
    { id: "staff", label: "Staff" },
    { id: "calendario", label: "Calendario" },
    { id: "formazione", label: "Formazione" },
    { id: "convocati", label: "Convocati" },
    { id: "live", label: "Live" },
    { id: "contenuti", label: "Contenuti" },
    { id: "classifica", label: "Classifica" },
    { id: "club", label: "Club+" },
    { id: "eventi", label: "Eventi" },
    { id: "documenti", label: "Documenti" },
    { id: "multe", label: "Multe" },
    { id: "utenti", label: "Ruoli" },
    { id: "whatsapp", label: "WhatsApp" },
    { id: "sms", label: "SMS" },
  ];

  const visibleTabs =
    allowedTabs && allowedTabs.length ? tabs.filter((t) => allowedTabs.includes(t.id)) : tabs;
  const [tab, setTab] = useState<AdminTab>((allowedTabs && allowedTabs[0]) || "impostazioni");
  const [developerOpen, setDeveloperOpen] = useState(false);
  const skipAutoSave = useRef(true);
  const lastSent = useRef("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSave = async (payload = draft) => {
    setSaving(true);
    setMessage("");
    const ok = await onSave(payload);
    if (ok) lastSent.current = JSON.stringify(payload);
    setSaving(false);
    setMessage(ok ? "Pubblicato sul sito" : "Errore nel salvataggio");
    return ok;
  };

  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  useEffect(() => {
    if (skipAutoSave.current) {
      skipAutoSave.current = false;
      lastSent.current = JSON.stringify(draft);
      return;
    }
    const json = JSON.stringify(draft);
    if (json === lastSent.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setSaving(true);
      setMessage("Pubblicazione...");
      void onSaveRef.current(draft).then((ok) => {
        if (ok) lastSent.current = json;
        setSaving(false);
        setMessage(ok ? "Aggiornato sul sito" : "Non pubblicato");
      });
    }, 800);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [draft]);

  const downloadBackup = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mizzli-fc-backup-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const restoreBackup = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as TeamData;
      if (!parsed?.settings || !Array.isArray(parsed.players)) {
        setMessage("File backup non valido");
        return;
      }
      setDraft(parsed);
      setMessage("Backup caricato");
    } catch {
      setMessage("Non riesco a leggere questo backup");
    }
  };

  const saveButton = (
    <button
      type="button"
      onClick={() => void handleSave()}
      disabled={saving}
      className="min-h-11 rounded-xl bg-[var(--team-accent)] px-5 py-2.5 font-bold text-[var(--team-secondary)] disabled:opacity-50"
    >
      {saving ? "Pubblicazione..." : "Pubblica ora"}
    </button>
  );

  const handleImageUpload = async (file: File, callback: (url: string) => void) => {
    const result = await uploadImageWithFallback(file);
    if (result.url) callback(result.url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black sm:text-3xl">{title}</h1>
          <p className="mt-1 text-xs opacity-60">Ogni modifica si pubblica da sola su mizzlifc.it</p>
        </div>
        <div className="hidden flex-wrap gap-2 md:flex">
          {saveButton}
          <button type="button" onClick={downloadBackup} className="min-h-11 rounded-xl border border-white/20 px-4 py-2 text-sm">
            Scarica backup
          </button>
          <label className="flex min-h-11 cursor-pointer items-center rounded-xl border border-white/20 px-4 py-2 text-sm">
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
          <button type="button" onClick={onLogout} className="min-h-11 rounded-xl border border-white/20 px-4 py-2 text-sm">
            Esci
          </button>
        </div>
      </div>

      {message ? <div className="rounded-xl bg-white/10 px-4 py-3 text-sm">{message}</div> : null}

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
        {visibleTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`min-h-11 shrink-0 rounded-xl px-4 py-2 text-sm font-medium ${
              tab === t.id ? "bg-[var(--team-accent)] text-[var(--team-secondary)]" : "bg-white/10"
            }`}
          >
            {t.label}
          </button>
        ))}
        {!allowedTabs ? (
          <button type="button" onClick={() => setDeveloperOpen(true)} className="min-h-11 shrink-0 rounded-xl bg-white/10 px-4 py-2 text-sm">
            Sviluppatore
          </button>
        ) : null}
      </div>

      {developerOpen ? <DeveloperGate onClose={() => setDeveloperOpen(false)} /> : null}

      <div className="rounded-2xl border border-white/10 bg-[var(--team-card-bg)] p-4 sm:p-6">
        {tab === "impostazioni" && <SettingsTab draft={draft} setDraft={setDraft} onUpload={handleImageUpload} />}
        {tab === "design" && <AppDesignTab draft={draft} setDraft={setDraft} />}
        {tab === "rosa" && <PlayersTab draft={draft} setDraft={setDraft} onUpload={handleImageUpload} />}
        {tab === "staff" && <StaffTab draft={draft} setDraft={setDraft} onUpload={handleImageUpload} />}
        {tab === "calendario" && <MatchesTab draft={draft} setDraft={setDraft} onUpload={handleImageUpload} />}
        {tab === "formazione" && <FormationTab draft={draft} setDraft={setDraft} />}
        {tab === "convocati" && <CallupBoard />}
        {tab === "live" && <LiveTab draft={draft} setDraft={setDraft} />}
        {tab === "contenuti" && <ContentTab draft={draft} setDraft={setDraft} onUpload={handleImageUpload} />}
        {tab === "classifica" && <StandingsTab draft={draft} setDraft={setDraft} onUpload={handleImageUpload} />}
        {tab === "club" && <ClubTab draft={draft} setDraft={setDraft} limited={limitedClubTab} onUpload={handleImageUpload} />}
        {tab === "eventi" && <EventsTab draft={draft} setDraft={setDraft} />}
        {tab === "documenti" && <DocumentsTab draft={draft} setDraft={setDraft} />}
        {tab === "multe" && <FinesTab draft={draft} setDraft={setDraft} />}
        {tab === "utenti" && <UsersTab />}
        {tab === "whatsapp" && <WhatsAppTab />}
        {tab === "sms" && <SmsTab />}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-white/15 bg-black/85 px-3 pt-2 pb-[calc(env(safe-area-inset-bottom)+3.6rem)] md:hidden">
        <div className="[&>button]:w-full">{saveButton}</div>
      </div>
    </div>
  );
}
