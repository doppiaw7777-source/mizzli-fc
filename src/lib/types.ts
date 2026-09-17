export type PlayerRole = "POR" | "DIF" | "CEN" | "ATT";

export type PlayerStatus = "available" | "injured" | "suspended" | "unavailable";

export interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
  role: PlayerRole;
  birthDate: string;
  nationality: string;
  photoUrl: string;
  photoFocusX?: number;
  photoFocusY?: number;
  photoZoom?: number;
  status?: PlayerStatus;
  height?: string;
  weight?: string;
  foot?: "destro" | "sinistro" | "ambidestro";
  bio?: string;
  previousClubs?: string;
  yellowCards?: number;
  redCards?: number;
  minutes?: number;
  motm?: number;
  instagram?: string;
  stats: {
    goals: number;
    assists: number;
    appearances: number;
  };
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  photoUrl: string;
}

export type MatchKind = "partita" | "allenamento" | "amichevole";

export type MatchStatus =
  | "scheduled"
  | "finished"
  | "completed"
  | "played"
  | "postponed"
  | "suspended"
  | "cancelled";

export interface Match {
  id: string;
  kind?: MatchKind;
  date: string;
  time: string;
  opponent: string;
  location: string;
  isHome: boolean;
  competition: string;
  result?: string;
  homeTeamId?: string;
  awayTeamId?: string;
  homeTeam?: string;
  awayTeam?: string;
  homeScore?: number | null;
  awayScore?: number | null;
  status?: MatchStatus;
  note?: string;
  priority?: "alta" | "media" | "bassa";
  referee?: string;
  attendance?: string;
  tv?: string;
  ticketUrl?: string;
  preview?: string;
  report?: string;
  motmId?: string;
  weather?: string;
  color?: string;
  opponentLogoUrl?: string;
}

export interface FormationSlot {
  playerId: string;
  x: number;
  y: number;
}
