"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import AppShell from "@/components/AppShell";
import RosaShieldCard from "@/components/RosaShieldCard";
import PhotoFitEditor from "@/components/PhotoFitEditor";
import { useTeam } from "@/context/TeamContext";
import type { Player } from "@/lib/types";
import { uploadImageWithFallback } from "@/lib/images";
import { autoPhotoFit } from "@/lib/auto-photo-fit";
import { getStoredToken } from "@/lib/api";
import { ROSA_FILTERS, matchesRosaFilter, type RosaFilter } from "@/lib/rosa-filters";
import "../rosa-card.css";

export default function RosaPage() {
  const { data, isAdmin, updateData } = useTeam();
  const [q, setQ] = useState("");
  const [role, setRole] = useState<RosaFilter>("ALL");
  const [editing, setEditing] = useState<Player | null>(null);
  const [busy, setBusy] = useState(false);
  const [frameBusy, setFrameBusy] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canEdit = isAdmin || !!getStoredToken();

  const players = data?.players ?? [];
  const query = q.trim().toLowerCase();
  const frameUrl = data?.settings.branding.playerCardFrameUrl || "";
  const filtered = players.filter((p) => {
    if (!matchesRosaFilter(p, role)) return false;
    if (!query) return true;
    return (
      p.name.toLowerCase().includes(query) ||
      String(p.number) === query ||
      (p.position || "").toLowerCase().includes(query)
    );
  });

  if (!data) {
    return (
      <AppShell page="rosa">
        <p className="opacity-70">Caricamento rosa…</p>
      </AppShell>
    );
  }

  const savePlayer = async (next: Player, immediate = false) => {
    setEditing(next);
    const run = async () => {
      const list = data.players.map((p) => (p.id === next.id ? next : p));
      await updateData({ players: list });
    };
    if (immediate) {
      setBusy(true);
      await run();
      setBusy(false);
      return;
    }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void run();
    }, 350);
  };

  const saveFrame = async (file: File) => {
    setFrameBusy(true);
    const result = await uploadImageWithFallback(file);
    if (result.url) {
      await updateData({
        settings: {
          ...data.settings,
          branding: { ...data.settings.branding, playerCardFrameUrl: result.url },
        },
      });
    }
    setFrameBusy(false);
  };

  return (
    <AppShell page="rosa">
      <div className="space-y-8">
        <div className="text-center">
          <p className="page-kicker">MIZZLI FC</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">ROSA 2026/27</h1>
          <p className="mt-2 opacity-70">{filtered.length} giocatori</p>
          {canEdit && (
            <div className="mt-3 flex flex-col items-center gap-2">
              <p className="text-sm text-[var(--team-accent)]">
                Tocca «Foto» sulla card per la foto giocatore.
              </p>
              <label className="cursor-pointer rounded-full bg-[var(--team-accent)] px-4 py-2 text-xs font-bold text-[var(--team-secondary)]">
                {frameBusy ? "Carico cornice…" : frameUrl ? "Cambia cornice card" : "Carica cornice card"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={frameBusy}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (file) void saveFrame(file);
                  }}
                />
              </label>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cerca nome o numero…"
            className="input-field"
            type="search"
            inputMode="search"
            autoComplete="off"
            aria-label="Cerca giocatore"
          />
          <div className="flex flex-wrap justify-center gap-2" role="tablist" aria-label="Filtra per ruolo">
            {ROSA_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={role === f.id}
                onClick={() => setRole(f.id)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                  role === f.id
                    ? "bg-[var(--team-accent)] text-[var(--team-secondary)]"
                    : "bg-white/10"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-8 text-center text-sm opacity-70">
            Nessun giocatore corrisponde alla ricerca.
          </p>
        ) : (
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-x-4 gap-y-8 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {filtered.map((player) => (
              <div key={player.id} className="relative">
                <Link href={`/giocatore/${player.id}`} className="block rosa-card-lift">
                  <RosaShieldCard player={player} frameUrl={frameUrl} />
                </Link>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => setEditing(player)}
                    className="absolute right-2 top-2 z-10 rounded-full bg-black/70 px-2 py-1 text-[11px] font-bold uppercase tracking-wide"
                  >
                    Foto
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-4 sm:items-center">
          <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/15 bg-[#1a0b24] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider opacity-60">Foto rosa</p>
                <h3 className="text-lg font-black">{editing.name}</h3>
              </div>
              <button type="button" onClick={() => setEditing(null)} className="text-sm opacity-70">
                Chiudi
              </button>
            </div>
            <label className="mb-3 flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-white/25 bg-white/5 px-3 py-4 text-center text-sm">
              {busy ? "Caricamento…" : "Carica o cambia foto"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={busy}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  setBusy(true);
                  const result = await uploadImageWithFallback(file);
                  if (result.url) {
                    const fit = await autoPhotoFit(result.url);
                    await savePlayer({ ...editing, photoUrl: result.url, ...fit }, true);
                  }
                  setBusy(false);
                }}
              />
            </label>
            {editing.photoUrl ? (
              <PhotoFitEditor
                src={editing.photoUrl}
                player={editing}
                onChange={(fit) => {
                  const next = { ...editing, ...fit };
                  setEditing(next);
                  void savePlayer(next);
                }}
              />
            ) : (
              <p className="text-sm opacity-60">Senza foto la card resta vuota.</p>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
