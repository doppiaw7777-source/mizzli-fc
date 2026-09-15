import type { CSSProperties } from "react";
import type { Player, PlayerRole } from "./types";

export const ROLE_PORTRAIT: Record<PlayerRole, string> = {
  POR: "/brand/players/player-gk.png",
  DIF: "/brand/players/player-df.png",
  CEN: "/brand/players/player-mf.png",
  ATT: "/brand/players/player-fw.png",
};

export const ROLE_THUMB: Record<PlayerRole, string> = {
  POR: "/brand/players/thumb-gk.png",
  DIF: "/brand/players/thumb-df.png",
  CEN: "/brand/players/thumb-mf.png",
  ATT: "/brand/players/thumb-fw.png",
};

export function hashPlayer(player: { id: string; name: string; number: number }) {
  let h = 2166136261;
  const s = `${player.id}:${player.name}:${player.number}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function rolePortrait(role: PlayerRole | string) {
  return ROLE_PORTRAIT[(role as PlayerRole) in ROLE_PORTRAIT ? (role as PlayerRole) : "CEN"];
}

export function playerPhoto(player: Player) {
  return player.photoUrl || rolePortrait(player.role);
}

export function playerThumb(player: Player) {
  return player.photoUrl || ROLE_THUMB[player.role] || ROLE_THUMB.CEN;
}

export function clampPhoto(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function photoFocus(player: Pick<Player, "photoFocusX" | "photoFocusY" | "photoZoom">) {
  return {
    x: clampPhoto(player.photoFocusX ?? 50, 0, 100),
    y: clampPhoto(player.photoFocusY ?? 18, 0, 100),
    zoom: clampPhoto(player.photoZoom ?? 100, 80, 280),
  };
}

export function photoFitVars(player: Pick<Player, "photoFocusX" | "photoFocusY" | "photoZoom">) {
  const { x, y, zoom } = photoFocus(player);
  return {
    "--photo-x": `${x}%`,
    "--photo-y": `${y}%`,
    "--photo-z": String(zoom / 100),
  } as CSSProperties;
}

export function photoFitStyle(player: Pick<Player, "photoFocusX" | "photoFocusY" | "photoZoom">): CSSProperties {
  const { x, y, zoom } = photoFocus(player);
  return {
    objectFit: "cover",
    objectPosition: `${x}% ${y}%`,
    transform: `scale(${zoom / 100})`,
    transformOrigin: `${x}% ${y}%`,
    ...photoFitVars(player),
  };
}

const SKIN = ["#f3d1b0", "#e8c39e", "#d1a074", "#c68642"] as const;
const HAIR = ["#1a120c", "#2c1a10", "#111111", "#4a2c17", "#3b2314"] as const;

export function playerLook(player: Player) {
  const h = hashPlayer(player);
  return {
    skin: SKIN[h % SKIN.length],
    hair: HAIR[(h >>> 3) % HAIR.length],
    hairStyle: (h >>> 7) % 4,
    hue: ((h >>> 11) % 13) - 6,
  };
}
