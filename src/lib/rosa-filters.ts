import type { Player } from "./types";

export type RosaFilter =
  | "ALL"
  | "POR"
  | "DC"
  | "TER"
  | "CEN"
  | "ALA"
  | "ATT";

export const ROSA_FILTERS: { id: RosaFilter; label: string }[] = [
  { id: "ALL", label: "Tutti" },
  { id: "POR", label: "Portieri" },
  { id: "DC", label: "Difensori centrali" },
  { id: "TER", label: "Terzini" },
  { id: "CEN", label: "Centrocampisti" },
  { id: "ALA", label: "Ali" },
  { id: "ATT", label: "Attaccanti" },
];

function pos(p: Player) {
  return `${p.position || ""} ${p.role || ""}`.toLowerCase();
}

export function matchesRosaFilter(player: Player, filter: RosaFilter) {
  if (filter === "ALL") return true;
  const t = pos(player);
  if (filter === "POR") return player.role === "POR" || /portier/.test(t);
  if (filter === "DC") return player.role === "DIF" && /central/.test(t);
  if (filter === "TER") return /terzin/.test(t);
  if (filter === "ALA") return /\bala\b|estern/.test(t);
  if (filter === "CEN") {
    if (/\bala\b|estern|terzin|portier|centravant/.test(t)) return false;
    return player.role === "CEN" || /mezzala|regista|median|trequartist|centrocamp/.test(t);
  }
  if (filter === "ATT") {
    if (/\bala\b|estern/.test(t)) return false;
    return player.role === "ATT" || /centravant|attacc/.test(t);
  }
  return true;
}

export function splitPlayerName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return { first: name.trim(), last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}
