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
    partnersTitle?: string;
    homeLabel: string;
    rosaLabel: string;
    calendarioLabel: string;
    formazioneLabel: string;
    playerCardFrameUrl?: string;
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
    titleSize: "normal" | "large" | "xl";
    buttonStyle: "rounded" | "pill" | "square";
    heroStyle: "center" | "left" | "banner";
    homeLayout: "classic" | "magazine" | "minimal";
    calendarModelId: string;
    calendarSize: "xs" | "sm" | "md" | "lg" | "xl";
    playerGraphicId: string;
  };
}
