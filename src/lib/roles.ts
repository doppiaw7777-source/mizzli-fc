import type { AppUser, PublicUser, TeamData, UserRole } from "./types";
import { hasGrant, normalizeGrants, type UserGrant } from "./permissions";

export type { UserRole };

export type RoleUser =
  | (Pick<AppUser, "role"> & { grants?: string[] })
  | (Pick<PublicUser, "role"> & { grants?: string[] })
  | null
  | undefined;

export const ROLE_LABELS: Record<UserRole, string> = {
  fan: "Ospite / tifoso",
  player: "Giocatore",
  coach: "Allenatore",
  assistant_coach: "Vice allenatore",
  team_manager: "Team Manager",
};

export const ROLE_BLURBS: Record<UserRole, string> = {
  fan: "Guarda il sito, vota e legge le news. Non modifica la squadra.",
  player: "Account giocatore: vede convocati, formazione e calendario.",
  coach: "Convocazioni, formazione e calendario partite.",
  assistant_coach: "Come l'allenatore: convocazioni, formazione e calendario.",
  team_manager: "Documenti ed eventi del club.",
};

export type StaffPanelTab =
  | "live"
  | "formazione"
  | "convocati"
  | "calendario"
  | "eventi"
  | "documenti"
  | "rosa";

export function isFanRole(role?: UserRole | null) {
  return !role || role === "fan";
}

export function isPlayerRole(role?: UserRole | null) {
  return role === "player";
}

export function isCoachRole(role?: UserRole | null) {
  return role === "coach" || role === "assistant_coach";
}

export function isTeamManagerRole(role?: UserRole | null) {
  return role === "team_manager";
}

export function isStaffRole(role?: UserRole | null) {
  return isCoachRole(role) || isTeamManagerRole(role);
}

export function canAccessStaff(user: RoleUser) {
  if (!user?.role) return false;
  return isStaffRole(user.role) || normalizeGrants(user.role, user.grants).length > 0;
}

export function canManageTeam(user: RoleUser) {
  return canAccessStaff(user);
}

export function canEditLive(user: RoleUser) {
  return hasGrant(user?.role, user?.grants, "live");
}

export function canEditFormation(user: RoleUser) {
  return hasGrant(user?.role, user?.grants, "formation");
}

export function canEditCallups(user: RoleUser) {
  return hasGrant(user?.role, user?.grants, "callups");
}

export function canEditDocuments(user: RoleUser) {
  return hasGrant(user?.role, user?.grants, "documents");
}

export function canEditEvents(user: RoleUser) {
  return hasGrant(user?.role, user?.grants, "events");
}

export function canEditCalendar(user: RoleUser) {
  return hasGrant(user?.role, user?.grants, "calendar");
}

export function canEditRosa(user: RoleUser) {
  return hasGrant(user?.role, user?.grants, "rosa");
}

export function canVote(user: RoleUser) {
  return Boolean(user?.role);
}

export function postLoginPath(user: RoleUser) {
  if (!user) return "/accedi";
  if (canAccessStaff(user)) return "/staff";
  return "/profilo";
}

export function staffPanelTabs(role: UserRole, grants?: string[]): StaffPanelTab[] {
  const g = normalizeGrants(role, grants);
  const tabs: StaffPanelTab[] = [];
  if (g.includes("rosa")) tabs.push("rosa");
  if (g.includes("calendar")) tabs.push("calendario");
  if (g.includes("formation")) tabs.push("formazione");
  if (g.includes("callups")) tabs.push("convocati");
  if (g.includes("live")) tabs.push("live");
  if (g.includes("events")) tabs.push("eventi");
  if (g.includes("documents")) tabs.push("documenti");
  return tabs;
}

function formationSubset(formation: TeamData["formation"] | undefined) {
  if (!formation) return undefined;
  return {
    scheme: formation.scheme,
    starters: formation.starters,
    bench: formation.bench,
    pitchColor: formation.pitchColor,
    pitchColor2: formation.pitchColor2,
    captainId: formation.captainId,
    note: formation.note,
  };
}

export function staffWritableSubset(
  input: Partial<TeamData>,
  role?: UserRole,
  grants?: string[]
): Partial<TeamData> {
  if (!role) return {};
  const g = normalizeGrants(role, grants);
  const club: Record<string, unknown> = {};
  if (g.includes("callups") && input.club) {
    club.callupPlayerIds = input.club.callupPlayerIds;
    club.callupNote = input.club.callupNote;
    club.callupMeeting = input.club.callupMeeting;
    club.callupPublishedAt = input.club.callupPublishedAt;
  }
  if (g.includes("events") && input.club) club.events = input.club.events;
  if (g.includes("documents") && input.club) club.documents = input.club.documents;
  return compactTeamData({
    players: g.includes("rosa") ? input.players : undefined,
    formation: g.includes("formation") ? formationSubset(input.formation) : undefined,
    matches: g.includes("calendar") ? input.matches : undefined,
    club: Object.keys(club).length ? club : undefined,
  }) as Partial<TeamData>;
}

export function compactTeamData<T extends object>(data: T) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
}

export type { UserGrant };
