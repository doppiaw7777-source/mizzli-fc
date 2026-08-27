import type { Player } from "./types";

export function lastName(player: Player) {
  const parts = player.name.trim().split(/\s+/).filter(Boolean);
  return parts[parts.length - 1] || player.name;
}

/** Cognome, oppure iniziale + cognome se in lista c'è un omonimo. */
export function shortPlayerLabel(player: Player, siblings: Player[] = []) {
  const last = lastName(player);
  const clash = siblings.filter((p) => p.id !== player.id && lastName(p) === last);
  if (!clash.length) return last;
  const parts = player.name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0] && parts[0] !== last ? parts[0] : "";
  if (!first) return last;
  return `${first.charAt(0).toUpperCase()}. ${last}`;
}
