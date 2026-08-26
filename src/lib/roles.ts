import type { AppUser, PublicUser, TeamData, UserRole } from "./types";

export type { UserRole };

export type RoleUser = Pick<AppUser, "role"> | Pick<PublicUser, "role"> | null | undefined;

export const ROLE_LABELS: Record<UserRole, string> = {
  fan: "Tifoso",
  coach: "Mister",
  assistant_coach: "Vice mister",
  team_manager: "Team Manager",
};

export const ROLE_BLURBS: Record<UserRole, string> = {
  fan: "Voti i giocatori, partecipi ai sondaggi e leggi il club.",
  coach: "Gestisci formazione, convocati e diretta partita.",
  assistant_coach: "Stessi strumenti del mister: formazione, convocati e live.",
  team_manager: "Gestisci multe, documenti ed eventi del club.",
};

export type StaffPanelTab = "live" | "formazione" | "convocati" | "eventi" | "documenti" | "multe";

export function isFanRole(role?: UserRole | null) {
  return !role || role === "fan";
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

/** @deprecated Use canAccessStaff / canEditCallups. Kept so old staff checks keep compiling. */
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
  return isTeamManagerRole(user?.role);
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
  if (isCoachRole(role)) return ["live", "formazione", "convocati"];
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
    club: input.club
      ? {
          callupPlayerIds: input.club.callupPlayerIds,
          callupNote: input.club.callupNote,
          callupMeeting: input.club.callupMeeting,
          callupPublishedAt: input.club.callupPublishedAt,
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
