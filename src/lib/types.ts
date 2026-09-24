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

export interface TeamSettings {
  teamName: string;
  motto: string;
  logoUrl: string;
  appIconUrl: string;
  themeId: string;
  graphicStyle: string;
  themeGradient: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    cardBg: string;
  };
  backgrounds: {
    global: string;
    home: string;
    rosa: string;
    calendario: string;
    formazione: string;
    admin: string;
  };
  fontFamily: string;
  navStyle: "solid" | "glass";
  branding: {
    stadiumName: string;
    leagueName: string;
    seasonLabel: string;
    welcomeMessage: string;
    footerText: string;
    nextMatchLabel: string;
    aboutText: string;
    contactEmail: string;
    contactPhone: string;
    rosaTitle: string;
    calendarioTitle: string;
    formazioneTitle: string;
    newsTitle: string;
    trainingsTitle: string;
    sponsorsTitle: string;
    homeLabel: string;
    rosaLabel: string;
    calendarioLabel: string;
    formazioneLabel: string;
  };
  ui: {
    cardRadius: number;
    showHomeStats: boolean;
    showNextMatchCard: boolean;
    showSponsors: boolean;
    showPartnerBanner: boolean;
    showSocialLinks: boolean;
    enableMatchShare: boolean;
    showNews: boolean;
    showTrainings: boolean;
    showStandings: boolean;
    showHomeAdminCard: boolean;
    showMotto: boolean;
    showBottomNav: boolean;
    showAbout: boolean;
    cardGlow: boolean;
    compactMode: boolean;
    backgroundOverlay: number;
    graphicIntensity: number;
    titleSize: string;
    buttonStyle: string;
    heroStyle: string;
    homeLayout: string;
    calendarModelId: string;
    calendarSize: string;
    playerGraphicId: string;
  };
}

export interface StandingRow {
  id: string;
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  isUs: boolean;
  logoUrl?: string;
}

export interface ClubTeam {
  id: string;
  name: string;
  logoUrl: string;
}

export interface Standings {
  title: string;
  season: string;
  rows: StandingRow[];
  live?: boolean;
  manual?: boolean;
  /** Chiavi normalizzate delle squadre rimosse dall'utente: non rientrano in classifica finché non le riaggiungi. */
  excludedKeys?: string[];
}

export interface GalleryItem {
  id: string;
  url: string;
  caption?: string;
  createdAt?: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  date: string;
  pinned?: boolean;
}

export interface Training {
  id: string;
  date: string;
  time: string;
  location: string;
  note?: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logoUrl: string;
  website: string;
}

export interface SocialLink {
  id: string;
  label: string;
  url: string;
}

export interface Formation {
  id: string;
  name: string;
  formation: string;
  slots: FormationSlot[];
  notes?: string;
  matchId?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  url: string;
  category?: string;
}

export interface ClubEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  description?: string;
}

export interface Fine {
  id: string;
  playerId: string;
  amount: number;
  reason: string;
  date: string;
  paid?: boolean;
}

export interface TeamData {
  settings: TeamSettings;
  players: Player[];
  staff: StaffMember[];
  matches: Match[];
  formations: Formation[];
  standings: Standings;
  teams?: ClubTeam[];
  announcements: Announcement[];
  trainings: Training[];
  sponsors: Sponsor[];
  socialLinks: SocialLink[];
  gallery: GalleryItem[];
  documents: DocumentItem[];
  events: ClubEvent[];
  fines?: Fine[];
}

export type UserRole = "admin" | "staff" | "player" | "fan";

export interface AppUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string | null;
  googleId: string | null;
  photoUrl: string;
  provider: "email" | "google" | "both";
  role: UserRole;
  createdAt: string;
  phone?: string;
  phoneVerified?: boolean;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  photoUrl: string;
  provider: "email" | "google" | "both";
  role: UserRole;
  phone?: string;
  phoneVerified?: boolean;
}
