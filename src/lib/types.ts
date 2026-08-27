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
  };
  ui: {
    cardRadius: number;
    showHomeStats: boolean;
    showNextMatchCard: boolean;
    showSponsors: boolean;
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

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  pinned: boolean;
}

export interface TrainingItem {
  id: string;
  day: string;
  time: string;
  location: string;
  focus: string;
}

export type SponsorTier = "main" | "partner";

export interface Sponsor {
  id: string;
  name: string;
  logoUrl: string;
  website: string;
  tier?: SponsorTier;
}

export interface SocialLink {
  id: string;
  label: string;
  url: string;
}

export interface Formation {
  scheme: string;
  starters: FormationSlot[];
  bench: string[];
  pitchColor?: string;
  pitchColor2?: string;
  captainId?: string;
  note?: string;
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
}

export interface GalleryItem {
  id: string;
  url: string;
  caption: string;
  album: string;
}

export interface VideoItem {
  id: string;
  title: string;
  url: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  url: string;
}

export interface Honour {
  id: string;
  year: string;
  title: string;
}

export interface TimelineItem {
  id: string;
  year: string;
  title: string;
  text: string;
}

export interface FaqItem {
  id: string;
  q: string;
  a: string;
}

export interface Chant {
  id: string;
  title: string;
  lyrics: string;
}

export interface ClubRecord {
  id: string;
  label: string;
  value: string;
}

export interface MerchItem {
  id: string;
  name: string;
  price: string;
  category: string;
  url: string;
}

export interface PollOption {
  id: string;
  label: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
}

export interface QuoteItem {
  id: string;
  text: string;
  author: string;
}

export interface Legend {
  id: string;
  name: string;
  years: string;
  text: string;
}

export interface YouthTeam {
  id: string;
  name: string;
  coach: string;
  age: string;
}

export interface ClubEvent {
  id: string;
  date: string;
  title: string;
  place: string;
  text: string;
  color?: string;
}

export interface FineItem {
  id: string;
  playerName: string;
  reason: string;
  amount: string;
  paid: boolean;
}

export interface KitItem {
  id: string;
  name: string;
  season: string;
  colors: string;
}

export type LiveStatus = "idle" | "live" | "ht" | "ft";

export type MatchEventType =
  | "kickoff"
  | "period"
  | "goal"
  | "own_goal"
  | "penalty"
  | "yellow"
  | "red"
  | "sub"
  | "var"
  | "note";

export type MatchEventTeam = "us" | "opp";

export interface MatchEvent {
  id: string;
  matchId: string;
  minute: number;
  extra?: number;
  type: MatchEventType;
  team: MatchEventTeam;
  playerId?: string;
  assistId?: string;
  playerOutId?: string;
  playerInId?: string;
  oppName?: string;
  text: string;
  createdAt: string;
  statsApplied?: boolean;
}

export interface MatchLive {
  matchId: string;
  status: LiveStatus;
  scoreUs: number;
  scoreOpp: number;
  minute: number;
  extra?: number;
  events: MatchEvent[];
  clockBaseMinute: number;
  clockStartedAt: string | null;
  updatedAt: string;
}

export interface MatchLivesStore {
  activeMatchId: string;
  lives: MatchLive[];
}

export interface ClubInfo {
  founded: string;
  city: string;
  address: string;
  stadiumCapacity: string;
  president: string;
  sportingDirector: string;
  whatsapp: string;
  mapsUrl: string;
  ticketUrl: string;
  liveStreamUrl: string;
  radioUrl: string;
  youtubeUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  shopUrl: string;
  anthem: string;
  mascot: string;
  history: string;
  values: string;
  fairPlay: string;
  parking: string;
  transport: string;
  hospitality: string;
  disabledAccess: string;
  ticketPrices: string;
  openingHours: string;
  pressEmail: string;
  alertBanner: string;
  liveStatus: LiveStatus;
  liveScore: string;
  liveMinute: string;
  liveMatchId?: string;
  viceCaptainId: string;
  penaltyTakerId: string;
  freeKickTakerId: string;
  cornerTakerId: string;
}

export interface ClubExtras {
  info: ClubInfo;
  gallery: GalleryItem[];
  videos: VideoItem[];
  documents: DocumentItem[];
  honours: Honour[];
  timeline: TimelineItem[];
  faqs: FaqItem[];
  chants: Chant[];
  records: ClubRecord[];
  merch: MerchItem[];
  polls: Poll[];
  quotes: QuoteItem[];
  legends: Legend[];
  youth: YouthTeam[];
  events: ClubEvent[];
  fines: FineItem[];
  kits: KitItem[];
  callupPlayerIds: string[];
  callupNote: string;
  callupMeeting: string;
  callupPublishedAt: string;
  matchLives?: MatchLive[];
}

export interface TeamData {
  settings: TeamSettings;
  players: Player[];
  staff: StaffMember[];
  matches: Match[];
  formation: Formation;
  announcements: NewsItem[];
  trainings: TrainingItem[];
  sponsors: Sponsor[];
  socialLinks: SocialLink[];
  standings: Standings;
  teams?: ClubTeam[];
  club: ClubExtras;
}

export interface AuthData {
  username: string;
  passwordHash: string;
}

export type UserRole = "fan" | "coach" | "assistant_coach" | "team_manager";

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
