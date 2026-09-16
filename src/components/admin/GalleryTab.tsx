"use client";

import { useState } from "react";
import type { GalleryItem, TeamData } from "@/lib/types";
import { uploadOriginalImage } from "@/lib/images";

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
    setMsg("");
    const next: GalleryItem[] = [...draft.club.gallery];
    for (const file of Array.from(files)) {
      const result = await uploadOriginalImage(file);
      if (result.url) {
        next.unshift({
          id: `g${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          url: result.url,
          caption: file.name.replace(/\.\w+$/, ""),
          album: album.trim() || "Generale",
        });
      } else {
        setMsg(result.message || "Upload non riuscito");
      }
    }
    setDraft({ ...draft, club: { ...draft.club, gallery: next } });
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

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Galleria / Album</h2>
      <p className="text-sm opacity-70">
        Le foto restano originali (niente compressione). Tutti le vedono su /galleria e possono scaricarle.
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
      {msg ? <p className="text-sm text-amber-300">{msg}</p> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        {draft.club.gallery.map((g) => (
          <div key={g.id} className="rounded-xl border border-white/10 p-3">
            {g.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={g.url} alt="" className="mb-2 h-36 w-full rounded-lg object-cover" />
            ) : null}
            <input value={g.album} onChange={(e) => patch(g.id, { album: e.target.value })} className="input-field mb-2" placeholder="Album" />
            <input value={g.caption} onChange={(e) => patch(g.id, { caption: e.target.value })} className="input-field mb-2" placeholder="Didascalia" />
            <button type="button" onClick={() => remove(g.id)} className="text-sm text-red-400">
              Rimuovi
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
