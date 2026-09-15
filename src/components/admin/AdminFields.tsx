"use client";

import { useEffect, useState } from "react";
import { pickNativeImage } from "@/lib/native";
import { isValidImageUrl } from "@/lib/images";

export function Toggle({
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

export function ShirtNumberSelect({
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

export function Field({
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

export function ImageUpload({
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
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  useEffect(() => {
    if (current && !current.startsWith("blob:")) {
      setLocalPreview((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return null;
      });
    }
  }, [current]);

  useEffect(() => {
    return () => {
      if (localPreview?.startsWith("blob:")) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const handleFile = (file?: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLocalPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return url;
    });
    onUpload(file);
  };

  const pickFromCamera = async () => {
    setLoading(true);
    try {
      const file = await pickNativeImage();
      if (file) handleFile(file);
    } finally {
      setLoading(false);
    }
  };

  const preview = localPreview || current;

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-3">
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Anteprima" className="h-24 w-24 rounded-lg object-cover ring-2 ring-[var(--team-accent)]" />
      ) : (
        <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-dashed border-white/20 text-2xl opacity-50">—</div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/25 bg-white/5 px-3 py-5 text-center">
          <span className="text-xs font-semibold">Galleria</span>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => { handleFile(e.target.files?.[0]); e.currentTarget.value = ""; }} />
        </label>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/25 bg-white/5 px-3 py-5 text-center">
          <span className="text-xs font-semibold">Fotocamera</span>
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { handleFile(e.target.files?.[0]); e.currentTarget.value = ""; }} />
        </label>
      </div>
      <button type="button" onClick={pickFromCamera} disabled={loading} className="w-full rounded-lg bg-[var(--team-primary)] py-2 text-sm font-semibold disabled:opacity-50">
        {loading ? "Apertura camera..." : "Apri Camera / Galleria nativa"}
      </button>
      {onUrlApply && (
        <div className="flex gap-2">
          <input value={urlDraft} onChange={(e) => setUrlDraft(e.target.value)} placeholder="Oppure incolla URL immagine" className="input-field flex-1" />
          <button type="button" onClick={() => { if (isValidImageUrl(urlDraft)) onUrlApply(urlDraft.trim()); }} className="rounded-lg bg-white/10 px-3 text-sm">Usa URL</button>
        </div>
      )}
      {current && onClear && (
        <button type="button" onClick={onClear} className="text-xs text-red-400 hover:underline">Rimuovi immagine</button>
      )}
    </div>
  );
}
