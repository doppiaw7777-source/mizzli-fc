import type { AppUser, PublicUser, TeamData, UserRole } from "./types";

export type { UserRole };

export type RoleUser = Pick<AppUser, "role"> | Pick<PublicUser, "role"> | null | undefined;

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
  team_manager: "Multe, documenti ed eventi del club.",
};

export type StaffPanelTab =
  | "live"
  | "formazione"
  | "convocati"
  | "calendario"
  | "eventi"
  | "documenti"
  | "multe";

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
  return isStaffRole(user?.role);
}

export function canManageTeam(user: RoleUser) {
  return canAccessStaff(user);
}

export function canEditLive(user: RoleUser) {
  return isCoachRole(user?.role);
}

export function canEditFormation(user: RoleUser) {
  return isCoachRole(user?.role);
}

export function canEditCallups(user: RoleUser) {
  return isCoachRole(user?.role);
}

export function canEditFines(user: RoleUser) {
  return isTeamManagerRole(user?.role);
}

export function canEditDocuments(user: RoleUser) {
  return isTeamManagerRole(user?.role);
}

export function canEditEvents(user: RoleUser) {
  return isCoachRole(user?.role) || isTeamManagerRole(user?.role);
}

export function canEditCalendar(user: RoleUser) {
  return isCoachRole(user?.role);
}

export function canVote(user: RoleUser) {
  return Boolean(user?.role);
}

export function postLoginPath(user: RoleUser) {
  if (!user) return "/accedi";
  if (canAccessStaff(user)) return "/staff";
  return "/profilo";
}

export function staffPanelTabs(role: UserRole): StaffPanelTab[] {
  if (isTeamManagerRole(role)) return ["eventi", "documenti", "multe"];
  if (isCoachRole(role)) return ["calendario", "formazione", "convocati", "live"];
  return [];
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

export function coachWritableSubset(input: Partial<TeamData>): Partial<TeamData> {
  return compactTeamData({
    formation: formationSubset(input.formation),
    matches: input.matches,
    club: input.club
      ? {
          callupPlayerIds: input.club.callupPlayerIds,
          callupNote: input.club.callupNote,
          callupMeeting: input.club.callupMeeting,
          callupPublishedAt: input.club.callupPublishedAt,
          events: input.club.events,
        }
      : undefined,
  }) as Partial<TeamData>;
}

export function managerWritableSubset(input: Partial<TeamData>): Partial<TeamData> {
  return compactTeamData({
    club: input.club
      ? {
          events: input.club.events,
          documents: input.club.documents,
          fines: input.club.fines,
        }
      : undefined,
  }) as Partial<TeamData>;
}

export function staffWritableSubset(input: Partial<TeamData>, role?: UserRole): Partial<TeamData> {
  if (isCoachRole(role)) return coachWritableSubset(input);
  if (isTeamManagerRole(role)) return managerWritableSubset(input);
  return {};
}

export function compactTeamData<T extends object>(data: T) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
}
