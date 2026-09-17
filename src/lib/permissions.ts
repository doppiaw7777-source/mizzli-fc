import type { UserRole } from "./types";

export type UserGrant =
  | "rosa"
  | "callups"
  | "formation"
  | "calendar"
  | "live"
  | "events"
  | "documents";

export const ALL_GRANTS: { id: UserGrant; label: string; detail: string }[] = [
  {
    id: "rosa",
    label: "Rosa",
    detail: "Aggiunge, modifica e toglie giocatori: nome, numero, ruolo, foto, statistiche.",
  },
  {
    id: "callups",
    label: "Convocati",
    detail: "Inserisce o svuota la lista convocati. Chi è su /convocati la vede aggiornarsi.",
  },
  {
    id: "formation",
    label: "Formazione",
    detail: "Sceglie modulo, titolari, panchina e capitano.",
  },
  {
    id: "calendar",
    label: "Calendario",
    detail: "Crea e modifica partite, orari, risultati. Aggiorna anche la classifica automatica.",
  },
  {
    id: "live",
    label: "Live",
    detail: "Segna minuto, risultato e stato della gara in corso.",
  },
  {
    id: "events",
    label: "Eventi",
    detail: "Pubblica cene, raduni e altre date del club.",
  },
  {
    id: "documents",
    label: "Documenti",
    detail: "Carica e toglie file del club (moduli, comunicati).",
  },
];

export const DEFAULT_GRANTS: Record<UserRole, UserGrant[]> = {
  fan: [],
  player: [],
  coach: ["callups", "formation", "calendar", "live", "events"],
  assistant_coach: ["callups", "formation", "calendar", "live", "events"],
  team_manager: ["events", "documents"],
};

export const ROLE_SETUP = [
  {
    id: "fan",
    label: "Ospite / tifoso",
    detail: "Account di partenza. Vede il sito, non modifica nulla finché non spunti una concessione.",
  },
  {
    id: "player",
    label: "Giocatore",
    detail: "Come il tifoso, ma riconoscibile come giocatore. Per fargli toccare la rosa o i convocati serve la spunta.",
  },
  {
    id: "coach",
    label: "Allenatore",
    detail: "Di default: convocati, formazione, calendario, live, eventi. Puoi aggiungere Rosa.",
  },
  {
    id: "assistant_coach",
    label: "Vice allenatore",
    detail: "Stessi default del mister. Puoi togliere o aggiungere spunte.",
  },
  {
    id: "team_manager",
    label: "Team Manager",
    detail: "Di default: eventi e documenti. Rosa e convocati solo se li attivi tu.",
  },
] as const;

export function normalizeGrants(role: UserRole, grants?: string[] | null): UserGrant[] {
  const allowed = new Set(ALL_GRANTS.map((g) => g.id));
  const raw = Array.isArray(grants) ? grants : null;
  const list = (raw ?? DEFAULT_GRANTS[role] ?? []).filter((g): g is UserGrant =>
    allowed.has(g as UserGrant)
  );
  return [...new Set(list)];
}

export function hasGrant(role: UserRole | undefined, grants: string[] | undefined, id: UserGrant) {
  if (!role) return false;
  return normalizeGrants(role, grants).includes(id);
}
