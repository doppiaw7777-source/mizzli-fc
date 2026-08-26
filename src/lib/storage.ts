import { promises as fs } from "fs";
import path from "path";
import defaultTeam from "@/data/default-team.json";
import type { AuthData, TeamData } from "./types";
import { getTheme } from "./themes";
import { mergeClub } from "./club";
import { dateKey } from "./dates";
import { syncStandings } from "./standings";
import { saveUploadedImage as saveBlob } from "./blob-storage";
import { atomicWrite, DATA_DIR, readJson, writeJson } from "./store";
import { overlayLiveOnTeam, stripMatchLives } from "./match-live";
import { getMatchLivesStore, seedMatchLivesFromTeam } from "./match-lives-store";
import { inferMatchKind } from "./match-kind";

const TEAM_FILE = path.join(DATA_DIR, "team.json");
const CLUB_BACKUP = path.join(process.cwd(), "src/data/club-backup.json");
const TEAM_KEY = "team";

function canPersistTeamFiles() {
  return process.env.NEXT_PHASE !== "phase-production-build";
}

async function readTeamFromStore(): Promise<TeamData | null> {
  if (process.env.DATABASE_URL) {
    return readJson<TeamData | null>(TEAM_KEY, null);
  }
  return readTeamJson(TEAM_FILE);
}

async function writeTeamToStore(data: TeamData): Promise<void> {
  const payload = JSON.stringify(stripMatchLives(data), null, 2);
  if (process.env.DATABASE_URL) {
    await writeJson(TEAM_KEY, JSON.parse(payload) as TeamData);
    return;
  }
  await atomicWrite(TEAM_FILE, payload);
}

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readTeamJson(filePath: string): Promise<TeamData | null> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as TeamData;
  } catch (err) {
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code === "ENOENT") return null;
    // Corrupt/partial JSON — treat as missing and fall back to defaults.
    return null;
  }
}

async function writeClubBackup(data: TeamData) {
  try {
    await atomicWrite(CLUB_BACKUP, JSON.stringify(data, null, 2));
  } catch {
    // Runtime may be read-only; live team.json is still saved.
  }
}

async function withMatchLives(data: TeamData): Promise<TeamData> {
  const store = await seedMatchLivesFromTeam(data);
  return overlayLiveOnTeam(data, store);
}

export async function getTeamData(): Promise<TeamData> {
  if (!process.env.DATABASE_URL) {
    await ensureDataDir();
  }
  try {
    const live = await readTeamFromStore();
    if (live) return withMatchLives(migrateTeamData(live));
    const backup = await readTeamJson(CLUB_BACKUP);
    const migrated = migrateTeamData((backup || defaultTeam) as TeamData);
    if (canPersistTeamFiles()) {
      try {
        await writeTeamToStore(migrated);
      } catch {
        // Read-only or missing dir during bootstrap — serve defaults in memory.
      }
    }
    return withMatchLives(migrated);
  } catch (err) {
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code !== "ENOENT") throw err;
    const migrated = migrateTeamData(defaultTeam as TeamData);
    if (canPersistTeamFiles()) {
      try {
        await writeTeamToStore(migrated);
      } catch {
        /* ignore */
      }
    }
    return withMatchLives(migrated);
  }
}

export async function saveTeamData(data: TeamData): Promise<void> {
  if (!process.env.DATABASE_URL) {
    await ensureDataDir();
  }
  const store = await getMatchLivesStore();
  const synced = syncStandings(overlayLiveOnTeam(data, store));
  await writeTeamToStore(synced);
  await writeClubBackup(synced);
}

export async function getAuthData(): Promise<AuthData | null> {
  return readJson<AuthData | null>("auth", null);
}

export async function saveAuthData(data: AuthData): Promise<void> {
  await writeJson("auth", data);
}

export async function saveUploadedImage(
  buffer: Buffer,
  filename: string
): Promise<string> {
  return saveBlob(buffer, filename);
}

function migrateTeamData(data: TeamData): TeamData {
  const base = defaultTeam as TeamData;
  const ui = data.settings?.ui ?? ({} as TeamData["settings"]["ui"]);
  const branding = data.settings?.branding ?? ({} as TeamData["settings"]["branding"]);
  const theme = getTheme(data.settings?.themeId || "mizzli-viola");
  return syncStandings({
    ...base,
    ...data,
    settings: {
      ...base.settings,
      ...data.settings,
      themeId: data.settings?.themeId || theme.id,
      graphicStyle: data.settings?.graphicStyle || theme.graphicStyle,
      themeGradient: data.settings?.themeGradient || theme.gradient,
      appIconUrl: data.settings?.appIconUrl || data.settings?.logoUrl || "",
      colors: {
        ...base.settings.colors,
        ...data.settings?.colors,
      },
      backgrounds: {
        ...base.settings.backgrounds,
        ...data.settings?.backgrounds,
      },
      branding: {
        stadiumName: branding.stadiumName ?? "",
        leagueName: branding.leagueName ?? "Campionato",
        seasonLabel: branding.seasonLabel ?? "2025/26",
        welcomeMessage: branding.welcomeMessage ?? "",
        footerText: branding.footerText ?? "",
        nextMatchLabel: branding.nextMatchLabel ?? "Prossima Partita",
        aboutText: branding.aboutText ?? "",
        contactEmail: branding.contactEmail ?? "",
        contactPhone: branding.contactPhone ?? "",
        rosaTitle: branding.rosaTitle ?? "Rosa Squadra",
        calendarioTitle: branding.calendarioTitle ?? "Calendario",
        formazioneTitle: branding.formazioneTitle ?? "Formazione Ufficiale",
        newsTitle: branding.newsTitle ?? "News squadra",
        trainingsTitle: branding.trainingsTitle ?? "Prossimi allenamenti",
        sponsorsTitle: branding.sponsorsTitle ?? "Sponsor",
        homeLabel: branding.homeLabel ?? "Home",
        rosaLabel: branding.rosaLabel ?? "Rosa",
        calendarioLabel: branding.calendarioLabel ?? "Calendario",
        formazioneLabel: branding.formazioneLabel ?? "Formazione",
      },
      ui: {
        cardRadius: ui.cardRadius ?? 18,
        showHomeStats: ui.showHomeStats ?? true,
        showNextMatchCard: ui.showNextMatchCard ?? true,
        showSponsors: ui.showSponsors ?? true,
        showSocialLinks: ui.showSocialLinks ?? true,
        enableMatchShare: ui.enableMatchShare ?? true,
        showNews: ui.showNews ?? true,
        showTrainings: ui.showTrainings ?? true,
        showStandings: ui.showStandings ?? true,
        showHomeAdminCard: ui.showHomeAdminCard ?? false,
        showMotto: ui.showMotto ?? true,
        showBottomNav: ui.showBottomNav ?? true,
        showAbout: ui.showAbout ?? true,
        cardGlow: ui.cardGlow ?? false,
        compactMode: ui.compactMode ?? false,
        backgroundOverlay: ui.backgroundOverlay ?? 55,
        graphicIntensity: ui.graphicIntensity ?? 70,
        titleSize: ui.titleSize ?? "large",
        buttonStyle: ui.buttonStyle ?? "rounded",
        heroStyle: ui.heroStyle ?? "center",
        homeLayout: ui.homeLayout ?? "classic",
        calendarModelId: ui.calendarModelId ?? "griglia-classica",
        calendarSize: ui.calendarSize ?? "md",
        playerGraphicId: ui.playerGraphicId ?? "orb",
      },
    },
    players: (data.players ?? base.players).map((p) => ({
      ...p,
      number: Math.min(100, Math.max(0, Math.round(Number(p.number) || 0))),
      status: p.status ?? "available",
      height: p.height ?? "",
      weight: p.weight ?? "",
      foot: p.foot ?? "destro",
      bio: p.bio ?? "",
      previousClubs: p.previousClubs ?? "",
      yellowCards: p.yellowCards ?? 0,
      redCards: p.redCards ?? 0,
      minutes: p.minutes ?? (p.stats?.appearances || 0) * 80,
      motm: p.motm ?? 0,
      instagram: p.instagram ?? "",
    })),
    matches: (data.matches ?? base.matches).map((m) => {
      const kind = inferMatchKind(m);
      return {
        ...m,
        kind,
        date: dateKey(m.date) || m.date,
        referee: m.referee ?? "",
        attendance: m.attendance ?? "",
        tv: m.tv ?? "",
        ticketUrl: m.ticketUrl ?? "",
        preview: m.preview ?? "",
        report: m.report ?? "",
        motmId: m.motmId ?? "",
        weather: m.weather ?? "",
        color: m.color || (kind === "allenamento" ? "#22c55e" : kind === "amichevole" ? "#f97316" : "#3b82f6"),
      };
    }),
    announcements: data.announcements ?? [
      {
        id: "a1",
        title: "Benvenuti nella nuova stagione",
        description: "Forza MIZZLI FC! Aggiorna qui news, risultati e obiettivi.",
        pinned: true,
      },
    ],
    trainings: data.trainings ?? [
      {
        id: "t1",
        day: "Martedì",
        time: "19:00",
        location: "Campo A",
        focus: "Tattica offensiva",
      },
      {
        id: "t2",
        day: "Giovedì",
        time: "19:00",
        location: "Campo B",
        focus: "Palle inattive",
      },
    ],
    sponsors: data.sponsors ?? [
      {
        id: "sp1",
        name: "Noldi Sport",
        logoUrl: "",
        website: "",
      },
    ],
    socialLinks: data.socialLinks ?? [
      {
        id: "so1",
        label: "@mizzlifc",
        url: "https://www.instagram.com/mizzlifc/",
      },
    ],
    formation: {
      ...base.formation,
      ...data.formation,
      pitchColor: data.formation?.pitchColor ?? "#1a7a3a",
      pitchColor2: data.formation?.pitchColor2 ?? "#0d5c28",
      captainId: data.formation?.captainId ?? "",
      note: data.formation?.note ?? "",
    },
    standings: data.standings ?? {
      title: "Classifica Campionato",
      season: "2025/26",
      rows: [
        { id: "st1", name: "Real Calcio", played: 4, won: 4, drawn: 0, lost: 0, goalsFor: 11, goalsAgainst: 2, isUs: false },
        { id: "st2", name: "MIZZLI FC", played: 4, won: 3, drawn: 1, lost: 0, goalsFor: 9, goalsAgainst: 3, isUs: true },
        { id: "st3", name: "United City", played: 4, won: 2, drawn: 1, lost: 1, goalsFor: 7, goalsAgainst: 5, isUs: false },
        { id: "st4", name: "ASD Rivale", played: 4, won: 2, drawn: 0, lost: 2, goalsFor: 6, goalsAgainst: 6, isUs: false },
        { id: "st5", name: "FC Ospite", played: 4, won: 1, drawn: 1, lost: 2, goalsFor: 4, goalsAgainst: 7, isUs: false },
        { id: "st6", name: "Virtus Nord", played: 4, won: 1, drawn: 0, lost: 3, goalsFor: 3, goalsAgainst: 8, isUs: false },
        { id: "st7", name: "Atletico Sud", played: 4, won: 0, drawn: 1, lost: 3, goalsFor: 2, goalsAgainst: 11, isUs: false },
      ],
    },
    club: mergeClub(data.club, data.settings?.teamName || "MIZZLI FC"),
  });
}
