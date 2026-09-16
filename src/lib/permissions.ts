import type { UserRole } from "./types";

export type UserGrant =
  | "callups"
  | "formation"
  | "calendar"
  | "live"
  | "events"
  | "documents"
  | "fines";

export const ALL_GRANTS: { id: UserGrant; label: string }[] = [
  { id: "callups", label: "Convocati (inserire / svuotare)" },
  { id: "formation", label: "Formazione" },
  { id: "calendar", label: "Calendario partite" },
  { id: "live", label: "Live gara" },
  { id: "events", label: "Eventi" },
  { id: "documents", label: "Documenti" },
  { id: "fines", label: "Multe" },
];

export const DEFAULT_GRANTS: Record<UserRole, UserGrant[]> = {
  fan: [],
  player: [],
  coach: ["callups", "formation", "calendar", "live", "events"],
  assistant_coach: ["callups", "formation", "calendar", "live", "events"],
  team_manager: ["events", "documents", "fines"],
};

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
