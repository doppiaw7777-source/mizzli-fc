"use client";

import { useState } from "react";
import LogoEditor from "@/components/LogoEditor";
import TeamBadge from "@/components/TeamBadge";
import { isValidImageUrl } from "@/lib/images";
import { straightenLogoFile } from "@/lib/logo-straighten";
import { pickNativeImage } from "@/lib/native";

export default function LogoPicker({
  name,
  url,
  gold = false,
  caption,
  autoStraighten = false,
  onChange,
  onUpload,
}: {
  name: string;
  url: string;
  gold?: boolean;
  caption?: string;
  autoStraighten?: boolean;
  onChange: (url: string) => void;
  onUpload: (file: File, cb: (url: string) => void) => void;
}) {
  const [urlDraft, setUrlDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [editSrc, setEditSrc] = useState<string | null>(null);
  const [error, setError] = useState("");

  const openFile = (file?: File) => {
    if (!file) return;
    if (autoStraighten) {
      void assignStraight(file);
      return;
    }
    const src = URL.createObjectURL(file);
    setEditSrc(src);
  };

  const assignStraight = async (file: File, closeEditor = false) => {
    setLoading(true);
    setError("");
    try {
      const straight = await straightenLogoFile(file, name || "logo");
      onUpload(straight, (next) => {
        setLoading(false);
        if (next) onChange(next);
        else setError("Upload non riuscito");
        if (closeEditor) {
          if (editSrc?.startsWith("blob:")) URL.revokeObjectURL(editSrc);
          setEditSrc(null);
        }
      });
    } catch {
      setLoading(false);
      setError("Non riesco a usare questo logo");
    }
  };

  const applyFile = (file: File) => {
    if (autoStraighten) {
      void assignStraight(file, true);
      return;
    }
    setLoading(true);
    onUpload(file, (next) => {
      setLoading(false);
      if (!next) return;
      onChange(next);
      if (editSrc?.startsWith("blob:")) URL.revokeObjectURL(editSrc);
      setEditSrc(null);
    });
  };

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="flex items-center gap-3">
        <TeamBadge name={name} src={url} gold={gold} size={64} />
        <div className="min-w-0">
          <p className="truncate font-bold">{name || "Logo"}</p>
          <p className="text-xs opacity-60">
            {caption || (gold ? "Riquadro d'oro · logo MIZZLI FC" : "Logo squadra")}
          </p>
          {loading ? <p className="mt-1 text-[11px] opacity-70">Carico il logo...</p> : null}
          {error ? <p className="mt-1 text-[11px] text-red-300">{error}</p> : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex min-h-11 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/25 bg-white/5 px-3 py-4 text-center">
          <span className="text-xs font-semibold">Galleria</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              openFile(e.target.files?.[0]);
              e.currentTarget.value = "";
            }}
          />
        </label>
        <label className="flex min-h-11 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/25 bg-white/5 px-3 py-4 text-center">
          <span className="text-xs font-semibold">Fotocamera</span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              openFile(e.target.files?.[0]);
              e.currentTarget.value = "";
            }}
          />
        </label>
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          try {
            const file = await pickNativeImage();
            if (file) {
              openFile(file);
              if (!autoStraighten) setLoading(false);
            } else {
              setLoading(false);
            }
          } catch {
            setLoading(false);
          }
        }}
        className="w-full rounded-lg bg-[var(--team-primary)] py-2 text-sm font-semibold disabled:opacity-50"
      >
        Apri Camera / Galleria nativa
      </button>

      {url && (
        <button
          type="button"
          onClick={() => setEditSrc(url)}
          className="w-full rounded-lg bg-white/10 py-2 text-sm font-semibold"
        >
          Togli sfondo / modifica
        </button>
      )}

      <div className="flex gap-2">
        <input
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          placeholder="Oppure incolla URL"
          className="input-field flex-1"
        />
        <button
          type="button"
          onClick={() => {
            if (isValidImageUrl(urlDraft)) setEditSrc(urlDraft.trim());
          }}
          className="rounded-lg bg-white/10 px-3 text-sm"
        >
          Usa
        </button>
      </div>

      {url && (
        <button type="button" onClick={() => onChange("")} className="text-xs text-red-400 hover:underline">
          Rimuovi logo
        </button>
      )}

      {editSrc && (
        <LogoEditor
          src={editSrc}
          teamName={name}
          onApply={applyFile}
          onCancel={() => {
            if (editSrc.startsWith("blob:")) URL.revokeObjectURL(editSrc);
            setEditSrc(null);
          }}
        />
      )}
    </div>
  );
}
