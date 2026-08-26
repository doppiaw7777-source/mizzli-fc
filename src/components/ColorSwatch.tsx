"use client";

import { CALENDAR_PALETTE, normalizeHex } from "@/lib/event-color";

export default function ColorSwatch({
  value,
  onChange,
}: {
  value?: string;
  onChange: (color: string) => void;
}) {
  const current = normalizeHex(value) || CALENDAR_PALETTE[0];
  return (
    <div className="flex flex-wrap items-center gap-2">
      {CALENDAR_PALETTE.map((hex) => {
        const on = current === hex;
        return (
          <button
            key={hex}
            type="button"
            aria-label={`Colore ${hex}`}
            onClick={() => onChange(hex)}
            className={`h-8 w-8 rounded-full border border-white/20 shadow-inner transition ${
              on
                ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-black/40"
                : "opacity-80 hover:scale-105 hover:opacity-100"
            }`}
            style={{ background: hex }}
          />
        );
      })}
      <label className="flex h-8 items-center gap-2 rounded-full border border-white/15 bg-black/30 px-2 text-[10px] uppercase tracking-wider opacity-70">
        Altro
        <input
          type="color"
          value={current}
          onChange={(e) => onChange(e.target.value)}
          className="h-5 w-5 cursor-pointer rounded-full border-0 bg-transparent p-0"
        />
      </label>
    </div>
  );
}
