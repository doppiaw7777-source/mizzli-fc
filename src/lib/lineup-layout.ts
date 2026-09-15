import type { FormationSlot, Player } from "./types";

export type LineupSpot = {
  playerId: string;
  left: number;
  top: number;
  scale: number;
};

function parseScheme(scheme: string) {
  const nums = String(scheme || "")
    .split(/[^0-9]+/)
    .map(Number)
    .filter((n) => n > 0 && n < 11);
  if (nums.length >= 2) return nums;
  return [4, 3, 3];
}

function evenXs(count: number, pad = 14) {
  if (count <= 1) return [50];
  const span = 100 - pad * 2;
  return Array.from({ length: count }, (_, i) => pad + (span * i) / (count - 1));
}

/** Broadcast-style rows: attack at the wide top, GK at the narrow bottom. */
export function lineupSpots(
  scheme: string,
  starters: FormationSlot[],
  players: Player[]
): LineupSpot[] {
  const map = new Map(players.map((p) => [p.id, p]));
  const filled = starters.filter((s) => map.has(s.playerId));
  const byY = [...filled].sort((a, b) => b.y - a.y || a.x - b.x);

  const gk = byY.find((s) => map.get(s.playerId)?.role === "POR") || byY[0];
  const rest = byY.filter((s) => s.playerId !== gk?.playerId);

  const lines = parseScheme(scheme);
  const rows: FormationSlot[][] = [];
  let cursor = 0;
  for (const count of lines) {
    const slice = rest.slice(cursor, cursor + count).sort((a, b) => a.x - b.x);
    rows.push(slice);
    cursor += count;
  }
  if (cursor < rest.length) {
    rows.push(rest.slice(cursor).sort((a, b) => a.x - b.x));
  }

  const out: LineupSpot[] = [];
  const rowCount = rows.length + (gk ? 1 : 0);
  const tops = Array.from({ length: rowCount }, (_, i) => 16 + (i * 68) / Math.max(1, rowCount - 1));

  rows.forEach((row, i) => {
    const xs = evenXs(row.length, 16 + i * 3);
    const top = tops[i];
    const scale = 0.86 + (i / Math.max(1, rowCount - 1)) * 0.2;
    row.forEach((slot, j) => {
      out.push({ playerId: slot.playerId, left: xs[j], top, scale });
    });
  });

  if (gk) {
    out.push({
      playerId: gk.playerId,
      left: 50,
      top: tops[tops.length - 1] ?? 88,
      scale: 1.05,
    });
  }
  return out;
}
