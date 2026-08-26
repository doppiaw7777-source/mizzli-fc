import type { ClubExtras, Player, TeamData } from "./types";
import { dateKey, todayKey } from "./dates";
import { parseScore } from "./standings";
import { defaultEventColor } from "./event-color";
import { getMatchKind, isLeagueFixture } from "./match-kind";

export function defaultClubExtras(teamName = "MIZZLI FC"): ClubExtras {
  return {
    info: {
      founded: "2018",
      city: "Milano",
      address: "Via dello Stadio 1",
      stadiumCapacity: "800",
      president: "Presidente Mizzli",
      sportingDirector: "DS Mizzli",
      whatsapp: "",
      mapsUrl: "https://maps.google.com/?q=Milano",
      ticketUrl: "",
      liveStreamUrl: "",
      radioUrl: "",
      youtubeUrl: "",
      facebookUrl: "",
      tiktokUrl: "",
      shopUrl: "",
      anthem: "Forza Mizzli, dalla curva al campo!",
      mascot: "Mizzo",
      history:
        "La società nasce dalla passione di un gruppo di amici. Oggi MIZZLI FC è una famiglia: rosa, staff, tifosi e sponsor nello stesso progetto.",
      values: "Rispetto, lavoro, coraggio, comunità.",
      fairPlay: "Zero razzismo, rispetto dell'arbitro e dell'avversario.",
      parking: "Parcheggio gratuito accanto al campo.",
      transport: "Autobus di linea + 8 minuti a piedi.",
      hospitality: "Tribuna coperta e bar interno nei giorni di gara.",
      disabledAccess: "Accesso e tribuna dedicata su richiesta.",
      ticketPrices: "Intero 8€ · Ridotto 5€ · Under 12 gratis",
      openingHours: "Segreteria: lun-ven 18:00-20:00",
      pressEmail: "",
      alertBanner: "",
      liveStatus: "idle",
      liveScore: "",
      liveMinute: "",
      liveMatchId: "",
      viceCaptainId: "",
      penaltyTakerId: "",
      freeKickTakerId: "",
      cornerTakerId: "",
    },
    gallery: [
      { id: "g1", url: "", caption: "Ultimo allenamento", album: "Allenamenti" },
      { id: "g2", url: "", caption: "Curva Mizzli", album: "Tifosi" },
    ],
    videos: [
      { id: "v1", title: "Highlights ultima gara", url: "" },
    ],
    documents: [
      { id: "d1", title: "Regolamento interno", url: "" },
      { id: "d2", title: "Codice etico", url: "" },
    ],
    honours: [
      { id: "h1", year: "2024", title: "Coppa di Lega" },
      { id: "h2", year: "2023", title: "Promozione" },
    ],
    timeline: [
      { id: "tl1", year: "2018", title: "Fondazione", text: `Nasce ${teamName}.` },
      { id: "tl2", year: "2023", title: "Promozione", text: "Salto di categoria e nuovo ciclo." },
      { id: "tl3", year: "2026", title: "App ufficiale", text: "Rosa, calendario e tifosi in un'unica app." },
    ],
    faqs: [
      { id: "f1", q: "Come si entra in rosa?", a: "Contatta lo staff da Contatti o presentati in segreteria." },
      { id: "f2", q: "Dove si gioca?", a: "Vedi Stadio e Come arrivare nella sezione Contatti." },
      { id: "f3", q: "Come compro il biglietto?", a: "Prezzi in Contatti. Link biglietti se inserito dall'admin." },
      { id: "f4", q: "Posso allenarmi con la prima squadra?", a: "Le prove si comunicano nelle News." },
    ],
    chants: [
      {
        id: "c1",
        title: "Forza Mizzli",
        lyrics: "Forza Mizzli dalla curva stiamo qui\nNon molliamo mai, questa è la nostra città",
      },
    ],
    records: [
      { id: "r1", label: "Record gol in una stagione", value: "—" },
      { id: "r2", label: "Vittoria più larga", value: "—" },
      { id: "r3", label: "Presenze club", value: "—" },
    ],
    merch: [
      { id: "me1", name: "Maglia home", price: "59€", category: "Kit", url: "" },
      { id: "me2", name: "Sciarpa ufficiale", price: "18€", category: "Tifo", url: "" },
      { id: "me3", name: "Cappellino", price: "15€", category: "Lifestyle", url: "" },
    ],
    polls: [
      {
        id: "po1",
        question: "Chi sarà il migliore in campo nella prossima?",
        options: [
          { id: "o1", label: "Un titolare", votes: 12 },
          { id: "o2", label: "Un giovane", votes: 7 },
          { id: "o3", label: "Il portiere", votes: 4 },
        ],
      },
    ],
    quotes: [
      { id: "q1", text: "La maglia si onora correndo.", author: "Mister" },
    ],
    legends: [
      { id: "l1", name: "Capitano storico", years: "2018-2024", text: "Simbolo della fondazione." },
    ],
    youth: [
      { id: "y1", name: "Juniores", coach: "Mister Juniores", age: "U19" },
      { id: "y2", name: "Allievi", coach: "Mister Allievi", age: "U17" },
      { id: "y3", name: "Giovanissimi", coach: "Mister Giovanissimi", age: "U15" },
    ],
    events: [
      {
        id: "e1",
        date: "2026-09-20",
        title: "Open day",
        place: "Campo",
        text: "Prove aperte e iscrizioni settore giovanile.",
        color: defaultEventColor("event"),
      },
    ],
    fines: [],
    kits: [
      { id: "k1", name: "Home", season: "2025/26", colors: "Viola / Bianco" },
      { id: "k2", name: "Away", season: "2025/26", colors: "Bianco / Viola" },
      { id: "k3", name: "Portiere", season: "2025/26", colors: "Oro / Viola" },
    ],
    callupPlayerIds: ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9", "p10", "p11", "p12", "p13", "p14", "p15"],
    callupNote: "Convocati per MIZZLI FC vs ASD Rivale. Raduno al campo 90 minuti prima del fischio.",
    callupMeeting: "Raduno 90 minuti prima al Stadio Comunale.",
    callupPublishedAt: new Date().toISOString(),
  };
}

export function migrateKitColors(
  kits: ClubExtras["kits"]
): ClubExtras["kits"] {
  return kits.map((k) => {
    if (k.id === "k1" && /nero\s*\/\s*giallo/i.test(k.colors)) {
      return { ...k, colors: "Viola / Bianco" };
    }
    if (k.id === "k2" && /bianco\s*\/\s*nero/i.test(k.colors)) {
      return { ...k, colors: "Bianco / Viola" };
    }
    if (k.id === "k3" && /verde/i.test(k.colors)) {
      return { ...k, colors: "Oro / Viola" };
    }
    return k;
  });
}

export function mergeClub(existing: Partial<ClubExtras> | undefined, teamName: string): ClubExtras {
  const base = defaultClubExtras(teamName);
  if (!existing) return base;
  return {
    ...base,
    ...existing,
    info: { ...base.info, ...existing.info },
    gallery: existing.gallery ?? base.gallery,
    videos: existing.videos ?? base.videos,
    documents: existing.documents ?? base.documents,
    honours: existing.honours ?? base.honours,
    timeline: existing.timeline ?? base.timeline,
    faqs: existing.faqs ?? base.faqs,
    chants: existing.chants ?? base.chants,
    records: existing.records ?? base.records,
    merch: existing.merch ?? base.merch,
    polls: existing.polls ?? base.polls,
    quotes: existing.quotes ?? base.quotes,
    legends: existing.legends ?? base.legends,
    youth: existing.youth ?? base.youth,
    events: (existing.events ?? base.events).map((e) => ({
      ...e,
      date: dateKey(e.date) || e.date,
      color: e.color || defaultEventColor("event"),
    })),
    fines: existing.fines ?? base.fines,
    kits: migrateKitColors(existing.kits ?? base.kits),
    callupPlayerIds: existing.callupPlayerIds ?? base.callupPlayerIds,
    callupNote: existing.callupNote ?? base.callupNote,
    callupMeeting: existing.callupMeeting ?? base.callupMeeting,
    callupPublishedAt: existing.callupPublishedAt ?? base.callupPublishedAt,
    matchLives: existing.matchLives ?? base.matchLives ?? [],
  };
}

export const CALLUP_VISIBLE_DAYS = 3;

const CALLUP_ROLE_ORDER: Record<string, number> = {
  POR: 0,
  DIF: 1,
  CEN: 2,
  ATT: 3,
};

export const CALLUP_ROLE_LABELS: Record<string, string> = {
  POR: "Portiere",
  DIF: "Difensore",
  CEN: "Centrocampista",
  ATT: "Attaccante",
};

export function sortCalledPlayers(players: Player[], ids: string[]) {
  const set = new Set(ids);
  return players
    .filter((p) => set.has(p.id))
    .sort((a, b) => {
      const byRole =
        (CALLUP_ROLE_ORDER[a.role] ?? 9) - (CALLUP_ROLE_ORDER[b.role] ?? 9);
      return byRole || a.number - b.number || a.name.localeCompare(b.name, "it");
    });
}

export function callupExpiry(publishedAt?: string) {
  if (!publishedAt) return null;
  const start = new Date(publishedAt).getTime();
  if (Number.isNaN(start)) return null;
  return new Date(start + CALLUP_VISIBLE_DAYS * 24 * 60 * 60 * 1000);
}

export function isCallupLive(club: ClubExtras, now = Date.now()) {
  if (!club.callupPlayerIds?.length) return false;
  const exp = callupExpiry(club.callupPublishedAt);
  return !!exp && now < exp.getTime();
}

export function callupDaysLeft(club: ClubExtras, now = Date.now()) {
  const exp = callupExpiry(club.callupPublishedAt);
  if (!exp) return 0;
  return Math.max(0, Math.ceil((exp.getTime() - now) / 86400000));
}

export function publishCallups(ids: string[], now = new Date()) {
  return {
    callupPlayerIds: ids,
    callupPublishedAt: ids.length ? now.toISOString() : "",
  };
}

export function playerAge(birthDate: string) {
  if (!birthDate) return "";
  const b = new Date(birthDate);
  if (Number.isNaN(b.getTime())) return "";
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age -= 1;
  return `${age}`;
}

export function upcomingBirthdays(players: Player[], days = 21) {
  const now = new Date();
  return players
    .map((p) => {
      const b = new Date(p.birthDate);
      if (Number.isNaN(b.getTime())) return null;
      const next = new Date(now.getFullYear(), b.getMonth(), b.getDate());
      if (next < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
        next.setFullYear(now.getFullYear() + 1);
      }
      const diff = (next.getTime() - now.getTime()) / 86400000;
      return { player: p, inDays: Math.ceil(diff) };
    })
    .filter((x): x is { player: Player; inDays: number } => !!x && x.inDays <= days)
    .sort((a, b) => a.inDays - b.inDays);
}

export function ranking(data: TeamData, key: "goals" | "assists" | "appearances" | "yellowCards" | "minutes") {
  return [...(data.players || [])]
    .map((p) => ({
      player: p,
      value:
        key === "goals"
          ? p.stats?.goals ?? 0
          : key === "assists"
            ? p.stats?.assists ?? 0
            : key === "appearances"
              ? p.stats?.appearances ?? 0
              : key === "yellowCards"
                ? p.yellowCards || 0
                : p.minutes || 0,
    }))
    .sort((a, b) => b.value - a.value);
}

export function lastResult(data: TeamData) {
  return [...(data.matches || [])]
    .filter((m) => m.result && getMatchKind(m) !== "allenamento")
    .sort((a, b) => b.date.localeCompare(a.date))[0];
}

export function upcomingMatch(data: TeamData) {
  const today = todayKey();
  return [...(data.matches || [])]
    .filter(
      (m) =>
        isLeagueFixture(m) &&
        !m.result &&
        (!dateKey(m.date) || dateKey(m.date) >= today)
    )
    .sort((a, b) => dateKey(a.date).localeCompare(dateKey(b.date)))[0];
}

export function formGuide(data: TeamData) {
  return [...(data.matches || [])]
    .filter((m) => isLeagueFixture(m) && parseScore(m.result))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)
    .map((m) => {
      const score = parseScore(m.result);
      if (!score) return "N";
      const [us, them] = score;
      if (us > them) return "V";
      if (us < them) return "P";
      return "N";
    });
}

export type MoreLink = {
  href: string;
  icon: string;
  title: string;
  desc: string;
};

export const MORE_MENU_GROUPS: { title: string; items: MoreLink[] }[] = [
  {
    title: "Club",
    items: [
      { href: "/statistiche", icon: "📊", title: "Statistiche", desc: "Marcatori, assist, presenze" },
      { href: "/live", icon: "🔴", title: "Live", desc: "Cronaca, gol e minuto" },
      { href: "/convocati", icon: "📋", title: "Convocati", desc: "Lista ufficiale della prossima gara" },
      { href: "/tifosi", icon: "🗳️", title: "Tifosi", desc: "Sondaggi e curva" },
      { href: "/documenti", icon: "📄", title: "Documenti", desc: "Regolamento e carte del club" },
      { href: "/galleria", icon: "🖼️", title: "Galleria", desc: "Foto della squadra" },
      { href: "/storia", icon: "📖", title: "Storia", desc: "Trofei, timeline, leggende" },
      { href: "/record", icon: "🥇", title: "Record", desc: "Numeri del club" },
      { href: "/contatti", icon: "📍", title: "Contatti", desc: "Stadio, biglietti, orari" },
      { href: "/shop", icon: "🛍️", title: "Shop", desc: "Maglie e merchandising" },
      { href: "/kit", icon: "👕", title: "Kit", desc: "Home, away, portiere" },
    ],
  },
  {
    title: "App",
    items: [
      { href: "/assistente", icon: "✦", title: "Assistente", desc: "Chiedi rosa, partite, formazione" },
      { href: "/cerca", icon: "🔎", title: "Cerca", desc: "Giocatori, partite, news" },
      { href: "/scarica", icon: "📲", title: "Scarica l'app", desc: "Link ufficiale per tutti i dispositivi" },
      { href: "/instagram", icon: "📸", title: "Instagram", desc: "@mizzlifc" },
      { href: "/profilo", icon: "👤", title: "Profilo", desc: "Il tuo account" },
      { href: "/admin", icon: "🔧", title: "Admin", desc: "Gestione completa" },
    ],
  },
];
