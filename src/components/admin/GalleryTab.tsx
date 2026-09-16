"use client";

import { useState } from "react";
import type { GalleryItem, TeamData } from "@/lib/types";
import { uploadImageWithFallback } from "@/lib/images";

export default function GalleryTab({
  draft,
  setDraft,
}: {
  draft: TeamData;
  setDraft: (d: TeamData) => void;
}) {
  const [album, setAlbum] = useState("Generale");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setMsg("Caricamento...");
    const added: GalleryItem[] = [];
    const errors: string[] = [];
    for (const file of Array.from(files)) {
      const result = await uploadImageWithFallback(file);
      if (result.url) {
        added.push({
          id: `g${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          url: result.url,
          caption: file.name.replace(/\.\w+$/, ""),
          album: album.trim() || "Generale",
        });
      } else {
        errors.push(`${file.name}: ${result.message || "non caricata"}`);
      }
    }
    if (added.length) {
      const previous = draft.club.gallery.filter((g) => g.url);
      setDraft({
        ...draft,
        club: { ...draft.club, gallery: [...added, ...previous] },
      });
    }
    setMsg(
      added.length
        ? `${added.length} foto pronte. ${errors.length ? errors.join(" ") : "Si pubblicano da sole."}`
        : errors.join(" ") || "Nessuna foto caricata. Rientra in Admin e riprova."
    );
    setBusy(false);
  };

  const patch = (id: string, change: Partial<GalleryItem>) => {
    setDraft({
      ...draft,
      club: {
        ...draft.club,
        gallery: draft.club.gallery.map((g) => (g.id === id ? { ...g, ...change } : g)),
      },
    });
  };

  const remove = (id: string) => {
    setDraft({
      ...draft,
      club: { ...draft.club, gallery: draft.club.gallery.filter((g) => g.id !== id) },
    });
  };

  const visible = draft.club.gallery.filter((g) => g.url);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Galleria / Album</h2>
      <p className="text-sm opacity-70">
        Scegli l&apos;album, poi carica. Se esce “sessione scaduta” esci e rientra in Admin.
      </p>
      <div className="flex flex-wrap items-end gap-3">
        <label className="block min-w-[12rem] space-y-1">
          <span className="text-xs opacity-70">Album</span>
          <input value={album} onChange={(e) => setAlbum(e.target.value)} className="input-field" placeholder="es. Partita vs …" />
        </label>
        <label className="inline-flex min-h-11 cursor-pointer items-center rounded-xl bg-[var(--team-accent)] px-4 font-bold text-[var(--team-secondary)]">
          {busy ? "Carico…" : "Carica foto"}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              void addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      {msg ? <p className="text-sm text-amber-200">{msg}</p> : null}
      {visible.length === 0 ? (
        <p className="text-sm opacity-60">Ancora nessuna foto con file.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {visible.map((g) => (
            <div key={g.id} className="rounded-xl border border-white/10 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.url} alt="" className="mb-2 h-36 w-full rounded-lg object-cover" />
              <input value={g.album} onChange={(e) => patch(g.id, { album: e.target.value })} className="input-field mb-2" placeholder="Album" />
              <input value={g.caption} onChange={(e) => patch(g.id, { caption: e.target.value })} className="input-field mb-2" placeholder="Didascalia" />
              <button type="button" onClick={() => remove(g.id)} className="text-sm text-red-400">
                Rimuovi
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
