export const CALENDAR_PALETTE = [
  "#ffd700",
  "#ef4444",
  "#f97316",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f8fafc",
];

export function normalizeHex(value?: string | null) {
  const raw = String(value || "").trim();
  if (/^#([0-9a-fA-F]{6})$/.test(raw)) return raw.toLowerCase();
  if (/^#([0-9a-fA-F]{3})$/.test(raw)) {
    const s = raw.slice(1);
    return `#${s[0]}${s[0]}${s[1]}${s[1]}${s[2]}${s[2]}`.toLowerCase();
  }
  return "";
}

export function defaultEventColor(kind: "match" | "event" = "match") {
  return kind === "event" ? "#8b5cf6" : "#3b82f6";
}

export function hexAlpha(hex: string, alpha: number) {
  const n = normalizeHex(hex) || "#3b82f6";
  const r = parseInt(n.slice(1, 3), 16);
  const g = parseInt(n.slice(3, 5), 16);
  const b = parseInt(n.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function inkOn(hex: string) {
  const n = normalizeHex(hex) || "#3b82f6";
  const r = parseInt(n.slice(1, 3), 16);
  const g = parseInt(n.slice(3, 5), 16);
  const b = parseInt(n.slice(5, 7), 16);
  const luma = (r * 299 + g * 587 + b * 114) / 1000;
  return luma > 165 ? "#111111" : "#ffffff";
}

export function cellBackground(colors: string[]) {
  const unique = [...new Set(colors.map((c) => normalizeHex(c)).filter(Boolean))];
  if (!unique.length) return undefined;
  if (unique.length === 1) {
    return `linear-gradient(165deg, ${hexAlpha(unique[0], 0.72)} 0%, ${hexAlpha(unique[0], 0.28)} 100%)`;
  }
  const stops = unique.map((c, i) => {
    const from = (i / unique.length) * 100;
    const to = ((i + 1) / unique.length) * 100;
    return `${hexAlpha(c, 0.7)} ${from}% ${to}%`;
  });
  return `linear-gradient(135deg, ${stops.join(", ")})`;
}
