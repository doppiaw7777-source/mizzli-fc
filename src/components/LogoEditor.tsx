"use client";

import { useEffect, useRef, useState } from "react";
import {
  autoRemoveBackground,
  brushStamp,
  defringe,
  detectBackgroundColor,
  featherAlpha,
  magicWandErase,
  removeBackgroundFromEdges,
  type Rgba,
} from "@/lib/logo-edit";

type Tool = "wand" | "erase" | "restore";

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    if (!src.startsWith("data:") && !src.startsWith("blob:")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Immagine non caricabile"));
    img.src = src;
  });
}

function cloneData(data: ImageData) {
  return new ImageData(new Uint8ClampedArray(data.data), data.width, data.height);
}

export default function LogoEditor({
  src,
  teamName,
  onApply,
  onCancel,
}: {
  src: string;
  teamName: string;
  onApply: (file: File) => void;
  onCancel: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalRef = useRef<ImageData | null>(null);
  const currentRef = useRef<ImageData | null>(null);
  const [tool, setTool] = useState<Tool>("wand");
  const [tolerance, setTolerance] = useState(42);
  const [brush, setBrush] = useState(22);
  const [feather, setFeather] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const undoRef = useRef<ImageData[]>([]);
  const painting = useRef(false);

  const paint = (data: ImageData) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = data.width;
    canvas.height = data.height;
    ctx.putImageData(data, 0, 0);
    currentRef.current = data;
  };

  const pushUndo = () => {
    if (!currentRef.current) return;
    undoRef.current = [...undoRef.current.slice(-18), cloneData(currentRef.current)];
  };

  useEffect(() => {
    let gone = false;
    setBusy(true);
    setError("");
    loadImage(src)
      .then((img) => {
        if (gone) return;
        const max = 720;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas non disponibile");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        originalRef.current = cloneData(data);
        undoRef.current = [];
        paint(data);
      })
      .catch(() => {
        if (!gone) setError("Non riesco ad aprire questa immagine per l'editing.");
      })
      .finally(() => {
        if (!gone) setBusy(false);
      });
    return () => {
      gone = true;
    };
  }, [src]);

  const applyAuto = (mode: "auto" | "white" | "black") => {
    if (!currentRef.current) return;
    pushUndo();
    const target: Rgba =
      mode === "white"
        ? [255, 255, 255, 255]
        : mode === "black"
          ? [0, 0, 0, 255]
          : detectBackgroundColor(
              currentRef.current.data,
              currentRef.current.width,
              currentRef.current.height
            );
    let next =
      mode === "auto"
        ? autoRemoveBackground(currentRef.current, tolerance)
        : removeBackgroundFromEdges(currentRef.current, target, tolerance);
    next = defringe(next, target);
    if (feather > 0) next = featherAlpha(next, feather);
    paint(next);
  };

  const pointFromEvent = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height);
    return { x, y };
  };

  const stamp = (x: number, y: number) => {
    if (!currentRef.current || !originalRef.current) return;
    paint(
      brushStamp(currentRef.current, originalRef.current, x, y, brush, tool === "restore")
    );
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pt = pointFromEvent(e);
    if (!pt || !currentRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    if (tool === "wand") {
      pushUndo();
      let next = magicWandErase(currentRef.current, pt.x, pt.y, tolerance);
      const bg = detectBackgroundColor(next.data, next.width, next.height);
      next = defringe(next, bg);
      paint(next);
      return;
    }
    pushUndo();
    painting.current = true;
    stamp(pt.x, pt.y);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!painting.current) return;
    const pt = pointFromEvent(e);
    if (pt) stamp(pt.x, pt.y);
  };

  const onPointerUp = () => {
    painting.current = false;
  };

  const undo = () => {
    const prev = undoRef.current.pop();
    if (prev) paint(prev);
  };

  const reset = () => {
    if (!originalRef.current) return;
    pushUndo();
    paint(cloneData(originalRef.current));
  };

  const apply = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setBusy(true);
    canvas.toBlob(
      (blob) => {
        setBusy(false);
        if (!blob) {
          setError("Esportazione fallita");
          return;
        }
        const safe = teamName.replace(/[^\w-]+/g, "-").slice(0, 40) || "logo";
        onApply(new File([blob], `${safe}-logo.png`, { type: "image/png" }));
      },
      "image/png"
    );
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/80 p-3 sm:items-center">
      <div className="flex max-h-[96dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#140818] shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#d4af37]">
              Editor stemma
            </p>
            <h2 className="text-lg font-black">{teamName}</h2>
            <p className="mt-1 text-xs opacity-60">
              Togli lo sfondo, pulisci i bordi, poi applica. Lo stemma resta in PNG
              trasparente.
            </p>
          </div>
          <button type="button" onClick={onCancel} className="rounded-lg px-3 py-2 text-sm opacity-70">
            Chiudi
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto px-4 py-3">
          <div className="logo-editor-stage mx-auto flex max-h-[46dvh] items-center justify-center rounded-xl p-3">
            <canvas
              ref={canvasRef}
              className="max-h-[42dvh] max-w-full touch-none cursor-crosshair"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            />
          </div>
          {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
          {busy && <p className="mt-2 text-sm opacity-60">Elaborazione...</p>}
        </div>

        <div className="space-y-3 border-t border-white/10 px-4 py-3">
          <div className="grid grid-cols-3 gap-2">
            <button type="button" className="btn-logo-tool" onClick={() => applyAuto("auto")}>
              Auto sfondo
            </button>
            <button type="button" className="btn-logo-tool" onClick={() => applyAuto("white")}>
              Togli bianco
            </button>
            <button type="button" className="btn-logo-tool" onClick={() => applyAuto("black")}>
              Togli nero
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ["wand", "Bacchetta"],
                ["erase", "Gomma"],
                ["restore", "Ripristina"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTool(id)}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                  tool === id
                    ? "border-[#d4af37] bg-[#d4af37]/20"
                    : "border-white/10 bg-white/5"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="block text-xs opacity-70">
            Tolleranza {tolerance}
            <input
              type="range"
              min={8}
              max={90}
              value={tolerance}
              onChange={(e) => setTolerance(Number(e.target.value))}
              className="mt-1 w-full"
            />
          </label>
          <label className="block text-xs opacity-70">
            Pennello {brush}px
            <input
              type="range"
              min={6}
              max={64}
              value={brush}
              onChange={(e) => setBrush(Number(e.target.value))}
              className="mt-1 w-full"
            />
          </label>
          <label className="block text-xs opacity-70">
            Sfumatura bordi {feather}
            <input
              type="range"
              min={0}
              max={4}
              value={feather}
              onChange={(e) => setFeather(Number(e.target.value))}
              className="mt-1 w-full"
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={undo} className="rounded-xl bg-white/10 py-2.5 text-sm font-semibold">
              Indietro
            </button>
            <button type="button" onClick={reset} className="rounded-xl bg-white/10 py-2.5 text-sm font-semibold">
              Riparti
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="min-h-11 rounded-xl border border-white/15 py-2.5 text-sm font-semibold"
            >
              Annulla
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void apply()}
              className="min-h-11 rounded-xl bg-[#d4af37] py-2.5 text-sm font-black text-[#1a1204] disabled:opacity-50"
            >
              Applica logo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
