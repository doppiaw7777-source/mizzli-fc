"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import AppShell from "@/components/AppShell";
import PlayerCard, { groupPlayersByRole, roleLabels } from "@/components/PlayerCard";
import PhotoFitEditor from "@/components/PhotoFitEditor";
import { useTeam } from "@/context/TeamContext";
import type { Player } from "@/lib/types";
import { uploadImageWithFallback } from "@/lib/images";
import { autoPhotoFit } from "@/lib/auto-photo-fit";

const ROLES = ["POR", "DIF", "CEN", "ATT"] as const;

export default function RosaPage() {
  const { data, isAdmin, updateData } = useTeam();
  const [q, setQ] = useState("");
  const [role, setRole] = useState<(typeof ROLES)[number] | "ALL">("ALL");
  const [editing, setEditing] = useState<Player | null>(null);
  const [busy, setBusy] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canEdit = isAdmin;

  const players = data?.players ?? [];
  const captainId = data?.formation?.captainId || "";
  const query = q.trim().toLowerCase();
  const filtered = players.filter((p) => {
    if (role !== "ALL" && p.role !== role) return false;
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

  const groups = groupPlayersByRole(filtered);
  const rolesToShow = role === "ALL" ? ROLES : [role];

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

  const autoAll = async () => {
    setBusy(true);
    const nextPlayers = [...data.players];
    for (let i = 0; i < nextPlayers.length; i++) {
      const p = nextPlayers[i];
      if (!p.photoUrl) continue;
      nextPlayers[i] = { ...p, ...(await autoPhotoFit(p.photoUrl)) };
    }
    await updateData({ players: nextPlayers });
    setBusy(false);
  };

  return (
    <AppShell page="rosa">
      <div className="space-y-8">
        <div>
          <p className="page-kicker">{data.settings.branding.seasonLabel || "Stagione"}</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">
            {data.settings.branding.rosaTitle || "Rosa Squadra"}
          </h1>
          <p className="mt-2 opacity-70">
            {filtered.length} di {data.players.length} giocatori
          </p>
          {canEdit && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => void autoAll()}
                className="rounded-full bg-[var(--team-accent)] px-3 py-1.5 text-xs font-bold text-[var(--team-secondary)] disabled:opacity-50"
              >
                {busy ? "Ritaglio…" : "Ritaglia tutte in automatico"}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cerca nome, numero o ruolo…"
            className="input-field"
            type="search"
            inputMode="search"
            autoComplete="off"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setRole("ALL")}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                role === "ALL"
                  ? "bg-[var(--team-accent)] text-[var(--team-secondary)]"
                  : "bg-white/10"
              }`}
            >
              Tutti
            </button>
            {ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                  role === r
                    ? "bg-[var(--team-accent)] text-[var(--team-secondary)]"
                    : "bg-white/10"
                }`}
              >
                {roleLabels[r]}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-8 text-center text-sm opacity-70">
            Nessun giocatore corrisponde alla ricerca.
          </p>
        ) : (
          rolesToShow.map((r) => {
            const list = groups[r];
            if (!list?.length) return null;
            return (
              <section key={r}>
                <h2 className="mb-4 text-2xl font-bold">
                  <span className="mr-2 text-[var(--team-accent)]">●</span>
                  {roleLabels[r]}
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {list.map((player) => (
                    <div key={player.id} className="relative">
                      <Link href={`/giocatore/${player.id}`}>
                        <PlayerCard player={player} captain={player.id === captainId} />
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
              </section>
            );
          })
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
              <p className="text-sm opacity-60">Carica una foto: il ritaglio parte da solo.</p>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
