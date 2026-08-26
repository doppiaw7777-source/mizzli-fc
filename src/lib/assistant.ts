import {
  CALLUP_ROLE_LABELS,
  isCallupLive,
  lastResult,
  mergeClub,
  playerAge,
  ranking,
  sortCalledPlayers,
  upcomingBirthdays,
} from "@/lib/club";
import { dateKey, formatItDate, todayKey } from "@/lib/dates";
import { sortStandings } from "@/lib/standings";
import { MIZZLI_NAME } from "@/lib/brand";
import type { Match, Player, TeamData } from "@/lib/types";
import { eventIcon, formatMinuteLabel, isLiveActive } from "@/lib/match-live";
import { getMatchKind, isLeagueFixture, matchPublicTitle } from "@/lib/match-kind";

export type AssistantLink = { href: string; label: string };
export type AssistantMessage = { role: "user" | "assistant"; text: string };
export type AssistantReply = { text: string; links: AssistantLink[] };

export const ASSISTANT_PROMPTS = [
  "Quando giochiamo?",
  "Qual è la formazione?",
  "Chi ha segnato di più?",
  "Dove si gioca?",
  "Cosa sai fare?",
];

const STATUS: Record<string, string> = {
  available: "disponibile",
  injured: "infortunato",
  suspended: "squalificato",
  unavailable: "indisponibile",
};

const STOP = new Set([
  "quando",
  "quale",
  "quali",
  "quanto",
  "quanti",
  "dove",
  "come",
  "chi",
  "cosa",
  "perche",
  "della",
  "dello",
  "delle",
  "nella",
  "nello",
  "questa",
  "questo",
  "prossima",
  "prossimo",
  "ultima",
  "ultimo",
  "partita",
  "partite",
  "gara",
  "match",
  "formazione",
  "titolari",
  "modulo",
  "rosa",
  "giocatore",
  "giocatori",
  "stadio",
  "campo",
  "squadra",
  "mister",
  "allenatore",
  "convocati",
  "convocato",
  "classifica",
  "marcatori",
  "assist",
  "gol",
  "news",
  "notizie",
]);

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[''`´’]/g, "")
    .replace(/[^\p{L}\p{N}\s#]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function has(q: string, ...needles: string[]) {
  const words = q.split(" ").filter(Boolean);
  return needles.some((n) => {
    const nn = norm(n);
    if (!nn) return false;
    if (nn.includes(" ")) return q.includes(nn);
    return words.some((w) => w === nn || (nn.length >= 4 && w.startsWith(nn)));
  });
}

function playersOf(data: TeamData) {
  return data.players || [];
}

function matchesOf(data: TeamData) {
  return data.matches || [];
}

function matchLine(m: Match, teamName: string) {
  const kind = getMatchKind(m);
  const fixture =
    kind === "partita"
      ? m.isHome
        ? `${teamName} - ${m.opponent}`
        : `${m.opponent} - ${teamName}`
      : matchPublicTitle(m);
  const when = [formatItDate(m.date, { weekday: "short", day: "numeric", month: "short" }), m.time]
    .filter(Boolean)
    .join(" · ");
  const bits = [fixture];
  if (m.result && kind === "partita") bits.push(m.result);
  if (when) bits.push(when);
  if (kind === "partita") bits.push(m.isHome ? "casa" : "trasferta");
  if (m.location) bits.push(m.location);
  if (m.competition) bits.push(m.competition);
  return bits.join(" · ");
}

function playerCard(p: Player) {
  const age = playerAge(p.birthDate);
  const lines = [
    `${p.number}. ${p.name}`,
    [p.position || p.role, age && `${age} anni`, p.foot && `piede ${p.foot}`, p.nationality]
      .filter(Boolean)
      .join(" · "),
    `Gol ${p.stats?.goals ?? 0} · Assist ${p.stats?.assists ?? 0} · Presenze ${p.stats?.appearances ?? 0}`,
  ];
  if (p.status && p.status !== "available") {
    lines.push(`Stato: ${STATUS[p.status] || p.status}`);
  }
  if (p.bio) lines.push(p.bio);
  return lines.filter(Boolean).join("\n");
}

function shirtNumber(q: string) {
  if (!has(q, "chi", "numero", "maglia", "giocatore", "n")) return null;
  const m = q.match(/(?:numero|maglia|#|n)\s*(\d{1,2})\b/) || q.match(/\b(?:il|la)\s+(\d{1,2})\b/);
  return m?.[1] ?? null;
}

function findPlayers(data: TeamData, q: string) {
  const list = playersOf(data);
  const num = shirtNumber(q);
  const byNumber = num ? list.filter((p) => String(p.number) === num) : [];

  const tokens = q.split(" ").filter((t) => t.length >= 3 && !STOP.has(t));
  const scored = list
    .map((p) => {
      const name = norm(p.name);
      const parts = name.split(" ");
      const last = parts.at(-1) || name;
      let score = 0;
      if (q.includes(name)) score += 10;
      if (last.length >= 4 && q.split(" ").includes(last)) score += 8;
      for (const t of tokens) {
        if (name === t) score += 8;
        else if (name.includes(t)) score += t.length >= 4 ? 3 : 1;
        else if (parts.some((part) => part.startsWith(t) && t.length >= 4)) score += 2;
      }
      return { p, score };
    })
    .filter((x) => x.score >= 6)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);

  const seen = new Set<string>();
  return [...byNumber, ...scored].filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}

function lastMentionedPlayer(data: TeamData, history: AssistantMessage[]) {
  const last = [...history].reverse().find((m) => m.role === "assistant");
  if (!last) return undefined;
  const blob = norm(last.text);
  return playersOf(data).find((p) => blob.includes(norm(p.name)));
}

function named(data: TeamData, id?: string) {
  if (!id) return undefined;
  return playersOf(data).find((p) => p.id === id);
}

function upcomingMatches(data: TeamData) {
  const today = todayKey();
  return [...matchesOf(data)]
    .filter((m) => !m.result && (!dateKey(m.date) || dateKey(m.date) >= today))
    .sort((a, b) => dateKey(a.date).localeCompare(dateKey(b.date)));
}

function nextMatch(data: TeamData) {
  return upcomingMatches(data).find((m) => isLeagueFixture(m));
}

function reply(text: string, links: AssistantLink[] = []): AssistantReply {
  return { text, links };
}

function help(name: string): AssistantReply {
  return reply(
    `Sono l'assistente di ${name}. Posso dirti:\n` +
      "• prossima partita e calendario\n" +
      "• formazione, capitano e panchina\n" +
      "• rosa, un giocatore, marcatori\n" +
      "• convocati, allenamenti, infortunati\n" +
      "• stadio, biglietti, staff e notizie\n" +
      "Scrivi pure in italiano, anche in breve.",
    [
      { href: "/calendario", label: "Partite" },
      { href: "/rosa", label: "Rosa" },
      { href: "/formazione", label: "Formazione" },
    ]
  );
}

export function welcomeMessage(teamName: string): AssistantReply {
  const name = teamName || MIZZLI_NAME;
  return reply(
    `Ciao, sono l'assistente di ${name}. Chiedimi della rosa, delle partite, della formazione o dello stadio.`,
    [
      { href: "/calendario", label: "Partite" },
      { href: "/formazione", label: "Formazione" },
      { href: "/rosa", label: "Rosa" },
    ]
  );
}

export function answerClubQuestion(
  data: TeamData,
  message: string,
  history: AssistantMessage[] = []
): AssistantReply {
  const q = norm(message);
  const name = data.settings?.teamName || MIZZLI_NAME;
  const club = mergeClub(data.club, name);
  const info = club.info;
  const b = data.settings?.branding;
  const formation = data.formation || { scheme: "", starters: [], bench: [] };

  if (!q || has(q, "aiuto", "help", "cosa sai", "cosa puoi", "che sai fare")) {
    return help(name);
  }

  if (has(q, "chi sei", "come ti chiami", "cosa fai")) {
    return help(name);
  }

  if (has(q, "ciao", "hey", "ehi", "buongiorno", "buonasera", "salve") && q.split(" ").length <= 3) {
    return reply(`Ciao. Dimmi: prossima partita, formazione, un giocatore o lo stadio.`, [
      { href: "/calendario", label: "Partite" },
      { href: "/rosa", label: "Rosa" },
    ]);
  }

  if (has(q, "live", "diretta", "in corso", "risultato live", "cronaca")) {
    const lives = data.club.matchLives || club.matchLives || [];
    const live =
      lives.find((item) => item.matchId === info.liveMatchId) ||
      lives.find((item) => item.status === "live" || item.status === "ht") ||
      lives.find((item) => item.status === "ft");
    if (live && live.status !== "idle") {
      const match = data.matches.find((m) => m.id === live.matchId);
      const vs = match ? ` vs ${match.opponent}` : "";
      const last = [...live.events].slice(-4).reverse();
      const lines = last.map((event) => `• ${event.minute}' ${eventIcon(event.type)} ${event.text}`).join("\n");
      const state = isLiveActive(live)
        ? formatMinuteLabel(live)
        : live.status === "ft"
          ? "finita"
          : "intervallo";
      return reply(
        `Diretta${vs}: ${live.scoreUs}-${live.scoreOpp} (${state}).${lines ? `\n${lines}` : ""}`,
        [{ href: "/live", label: "Apri Live" }]
      );
    }
    if (info.liveStatus === "ft") {
      return reply(`La gara è finita: ${info.liveScore || "risultato in aggiornamento"}.`, [
        { href: "/live", label: "Live" },
      ]);
    }
    return reply("Nessuna diretta attiva in questo momento.", [{ href: "/live", label: "Live" }]);
  }

  if (has(q, "calendario", "prossime partite", "prossimo turno", "elenco partite")) {
    const list = upcomingMatches(data).slice(0, 5);
    if (!list.length) {
      return reply("Non ci sono partite in programma.", [{ href: "/calendario", label: "Calendario" }]);
    }
    return reply(`Prossime gare:\n${list.map((m) => `• ${matchLine(m, name)}`).join("\n")}`, [
      { href: "/calendario", label: "Calendario" },
    ]);
  }

  if (
    has(
      q,
      "prossima",
      "quando gioch",
      "giochiamo",
      "prossimo match",
      "prossima gara",
      "prossima partita",
      "che partita",
      "quando si gioca",
      "orario partita"
    )
  ) {
    const m = nextMatch(data);
    if (!m) {
      return reply("Al momento non c'è una prossima gara in calendario.", [
        { href: "/calendario", label: "Calendario" },
      ]);
    }
    const extra = [m.note, m.preview, m.referee && `Arbitro: ${m.referee}`, m.tv && `TV: ${m.tv}`]
      .filter(Boolean)
      .join(" ");
    return reply([`Prossima gara: ${matchLine(m, name)}.`, extra].filter(Boolean).join("\n"), [
      { href: `/partita/${m.id}`, label: "Dettaglio gara" },
      { href: "/calendario", label: "Calendario" },
    ]);
  }

  if (
    has(
      q,
      "ultimo risultato",
      "come andata",
      "come e andata",
      "ultima partita",
      "ultimo match",
      "abbiamo vinto",
      "ultimo score"
    )
  ) {
    const m = lastResult(data);
    if (!m) {
      return reply("Non ho ancora un risultato in archivio.", [{ href: "/calendario", label: "Calendario" }]);
    }
    return reply(`Ultima gara: ${matchLine(m, name)}.`, [{ href: `/partita/${m.id}`, label: "Dettaglio" }]);
  }

  if (has(q, "classifica", "posizione in classifica", "quanti punti") && !has(q, "marcat", "cannonier", "assist")) {
    const rows = sortStandings(data.standings?.rows || []);
    if (!rows.length) {
      return reply("Classifica non inserita.", [{ href: "/", label: "Home" }]);
    }
    const us = rows.find((r) => r.isUs);
    const pos = us ? rows.findIndex((r) => r.isUs) + 1 : 0;
    const table = rows
      .slice(0, 6)
      .map((r, i) => `${i + 1}. ${r.name} ${r.won * 3 + r.drawn} pt`)
      .join("\n");
    const ours = us
      ? `${name} è ${pos}° con ${us.won * 3 + us.drawn} punti (${us.won}V ${us.drawn}N ${us.lost}P).`
      : "";
    return reply([data.standings?.title, ours, table].filter(Boolean).join("\n"), [{ href: "/", label: "Home" }]);
  }

  const aboutPlace = has(q, "dove", "stadio", "indirizzo", "arrivare", "parcheggio", "bigliett", "orari", "contatti");
  const aboutFormation = has(q, "formazione", "titolari", "modulo", "panchina", "undici") || (has(q, "campo") && !aboutPlace);

  if (has(q, "convocat") || (has(q, "chi gioca") && isCallupLive(club))) {
    if (!isCallupLive(club) || !club.callupPlayerIds.length) {
      return reply(club.callupNote || "La lista convocati non è pubblica in questo momento.", [
        { href: "/convocati", label: "Convocati" },
      ]);
    }
    const called = sortCalledPlayers(playersOf(data), club.callupPlayerIds);
    const lines = called.map((p) => `${p.number} ${p.name} (${CALLUP_ROLE_LABELS[p.role] || p.role})`);
    return reply(
      [`Convocati (${called.length}):`, ...lines, club.callupMeeting, club.callupNote].filter(Boolean).join("\n"),
      [{ href: "/convocati", label: "Tabella convocati" }]
    );
  }

  if (aboutFormation && !has(q, "stadio")) {
    const map = new Map(playersOf(data).map((p) => [p.id, p]));
    const xi = (formation.starters || [])
      .map((s) => map.get(s.playerId))
      .filter(Boolean)
      .map((p) => `${p!.number} ${p!.name}`)
      .join(", ");
    const cap = named(data, formation.captainId);
    const bench = (formation.bench || [])
      .map((id) => map.get(id))
      .filter(Boolean)
      .map((p) => p!.name)
      .join(", ");
    const lines = [
      `Modulo ${formation.scheme || "non impostato"}.`,
      xi ? `Titolari: ${xi}.` : "Titolari non impostati.",
      cap ? `Capitano: ${cap.name}.` : "",
      bench ? `Panchina: ${bench}.` : "",
      formation.note || "",
    ];
    return reply(lines.filter(Boolean).join("\n"), [{ href: "/formazione", label: "Formazione" }]);
  }

  if (has(q, "capitano", "vice capitano", "rigorista", "rigori", "punizioni", "calci dangolo", "corner")) {
    const cap = named(data, formation.captainId);
    const vice = named(data, info.viceCaptainId);
    const pen = named(data, info.penaltyTakerId);
    const fk = named(data, info.freeKickTakerId);
    const cor = named(data, info.cornerTakerId);
    return reply(
      [
        cap ? `Capitano: ${cap.name}.` : "Capitano non impostato.",
        vice ? `Vice: ${vice.name}.` : "",
        pen ? `Rigori: ${pen.name}.` : "",
        fk ? `Punizioni: ${fk.name}.` : "",
        cor ? `Calci d'angolo: ${cor.name}.` : "",
      ]
        .filter(Boolean)
        .join(" "),
      [{ href: "/formazione", label: "Formazione" }]
    );
  }

  if (has(q, "allenament", "training", "quando ci allen")) {
    const trainings = data.trainings || [];
    if (!trainings.length) {
      return reply("Nessun allenamento in agenda.", [{ href: "/", label: "Home" }]);
    }
    const lines = trainings.map((t) => [t.day, t.time, t.location, t.focus].filter(Boolean).join(" · "));
    return reply(`Allenamenti:\n${lines.join("\n")}`);
  }

  if (has(q, "infortun", "squalific", "indisponibil")) {
    const flagged = playersOf(data).filter((p) => p.status && p.status !== "available");
    if (!flagged.length) {
      return reply("Nessun infortunato o squalificato segnalato in rosa.");
    }
    return reply(
      flagged.map((p) => `${p.number} ${p.name}: ${STATUS[p.status || ""] || p.status}`).join("\n"),
      [{ href: "/rosa", label: "Rosa" }]
    );
  }

  if (has(q, "compleann")) {
    const bdays = upcomingBirthdays(playersOf(data), 21);
    if (!bdays.length) return reply("Nessun compleanno nei prossimi 21 giorni.");
    return reply(
      bdays
        .map((x) => `${x.player.name}: tra ${x.inDays} giorn${x.inDays === 1 ? "o" : "i"}`)
        .join("\n")
    );
  }

  const mentioned = findPlayers(data, q);
  const followUp =
    has(q, "gol", "assist", "eta", "anni", "ruolo", "presenze", "infortun", "scheda") &&
    q.split(" ").length <= 6 &&
    mentioned.length === 0;
  const hits = mentioned.length
    ? mentioned
    : followUp
      ? ([lastMentionedPlayer(data, history)].filter(Boolean) as Player[])
      : [];

  if (hits.length > 1) {
    return reply(
      `Ho trovato ${hits.length} giocatori:\n${hits
        .slice(0, 6)
        .map((p) => `${p.number}. ${p.name} · ${p.position || p.role}`)
        .join("\n")}\nDi chi parli?`,
      hits.slice(0, 3).map((p) => ({ href: `/giocatore/${p.id}`, label: p.name }))
    );
  }

  if (hits.length === 1) {
    const player = hits[0];
    return reply(playerCard(player), [
      { href: `/giocatore/${player.id}`, label: player.name },
      { href: "/rosa", label: "Rosa" },
    ]);
  }

  if (has(q, "statistiche", "marcat", "cannonier", "chi ha segnato", "classifica marcatori", "i gol")) {
    const top = ranking(data, "goals").slice(0, 5);
    return reply(
      `Marcatori:\n${top.map((r, i) => `${i + 1}. ${r.player.name} ${r.value}`).join("\n")}`,
      [{ href: "/statistiche", label: "Statistiche" }]
    );
  }

  if (has(q, "classifica assist", "piu assist", "gli assist")) {
    const top = ranking(data, "assists").slice(0, 5);
    return reply(
      `Assist:\n${top.map((r, i) => `${i + 1}. ${r.player.name} ${r.value}`).join("\n")}`,
      [{ href: "/statistiche", label: "Statistiche" }]
    );
  }

  if (has(q, "rosa", "elenco giocatori", "in squadra")) {
    const byRole = { POR: [] as Player[], DIF: [] as Player[], CEN: [] as Player[], ATT: [] as Player[] };
    for (const p of playersOf(data)) {
      (byRole[p.role] || byRole.CEN).push(p);
    }
    const block = (label: string, list: Player[]) =>
      list.length ? `${label}: ${list.map((p) => `${p.number} ${p.name}`).join(", ")}` : "";
    return reply(
      [
        `Rosa ${name} (${playersOf(data).length})`,
        block("Portieri", byRole.POR),
        block("Difensori", byRole.DIF),
        block("Centrocampisti", byRole.CEN),
        block("Attaccanti", byRole.ATT),
      ]
        .filter(Boolean)
        .join("\n"),
      [{ href: "/rosa", label: "Rosa" }]
    );
  }

  if (aboutPlace || has(q, "telefono", "email", "come arrivare")) {
    return reply(
      [
        `${b?.stadiumName || "Campo"} · ${info.address || info.city}`,
        info.ticketPrices && `Biglietti: ${info.ticketPrices}`,
        info.parking,
        info.transport,
        info.openingHours,
        b?.contactPhone && `Tel. ${b.contactPhone}`,
        b?.contactEmail && `Email ${b.contactEmail}`,
      ]
        .filter(Boolean)
        .join("\n") || "Contatti non ancora inseriti.",
      [{ href: "/contatti", label: "Contatti" }]
    );
  }

  if (has(q, "news", "notizie", "avviso", "annunci")) {
    const news = (data.announcements || []).slice(0, 4);
    if (!news.length) return reply("Nessuna notizia al momento.");
    return reply(news.map((n) => `• ${n.title}${n.description ? `: ${n.description}` : ""}`).join("\n"), [
      { href: "/", label: "Home" },
    ]);
  }

  if (has(q, "shop", "merch", "sciarpa", "kit", "divisa", "maglie")) {
    const items = club.merch.slice(0, 5).map((m) => `${m.name} ${m.price}`.trim());
    const kits = club.kits.map((k) => `${k.name} (${k.colors})`).join(", ");
    return reply(
      [items.length ? `Shop: ${items.join(" · ")}` : "", kits && `Kit: ${kits}`].filter(Boolean).join("\n") ||
        "Nessun articolo nello shop.",
      [
        { href: "/shop", label: "Shop" },
        { href: "/kit", label: "Kit" },
      ]
    );
  }

  if (has(q, "storia", "fondaz", "trofei", "onorificenze", "chi siamo", "valori")) {
    return reply(
      [
        info.history,
        info.founded && `Fondata nel ${info.founded}.`,
        club.honours.length ? `Trofei: ${club.honours.map((h) => `${h.year} ${h.title}`).join(", ")}.` : "",
        info.values,
      ]
        .filter(Boolean)
        .join(" "),
      [{ href: "/storia", label: "Storia" }]
    );
  }

  if (has(q, "record", "primati")) {
    if (!club.records.length) return reply("Nessun record inserito.", [{ href: "/record", label: "Record" }]);
    return reply(club.records.map((r) => `${r.label}: ${r.value}`).join("\n"), [{ href: "/record", label: "Record" }]);
  }

  if (has(q, "evento", "eventi", "open day")) {
    const events = (club.events || []).slice(0, 4);
    if (!events.length) return reply("Nessun evento in programma.");
    return reply(
      events
        .map((e) => [formatItDate(e.date), e.title, e.place, e.text].filter(Boolean).join(" · "))
        .join("\n")
    );
  }

  if (has(q, "mister", "allenatore", "staff", "presidente", "direttore sportivo")) {
    const staff = (data.staff || []).map((s) => `${s.name} (${s.role})`).join(", ");
    return reply(
      [staff && `Staff: ${staff}.`, info.president && `Presidente: ${info.president}.`, info.sportingDirector && `DS: ${info.sportingDirector}.`]
        .filter(Boolean)
        .join(" ") || "Staff non inserito.",
      [{ href: "/", label: "Home" }]
    );
  }

  if (has(q, "sponsor")) {
    const sponsors = data.sponsors || [];
    if (!sponsors.length) return reply("Nessuno sponsor in elenco.");
    return reply(`Sponsor: ${sponsors.map((s) => s.name).join(", ")}.`);
  }

  const faq = club.faqs.find((f) => {
    const nq = norm(f.q);
    const keys = nq.split(" ").filter((t) => t.length > 3 && !STOP.has(t));
    return nq && (q.includes(nq) || (keys.length > 0 && keys.every((t) => q.includes(t))));
  });
  if (faq) return reply(`${faq.q}\n${faq.a}`, [{ href: "/contatti", label: "Contatti" }]);

  const vs = matchesOf(data).find((m) => {
    const opp = norm(m.opponent);
    return opp.length >= 4 && q.includes(opp);
  });
  if (vs) {
    return reply(`Gara con ${vs.opponent}: ${matchLine(vs, name)}.`, [
      { href: `/partita/${vs.id}`, label: "Dettaglio" },
    ]);
  }

  return reply(
    `Non ho una risposta precisa su "${message.trim()}". Prova con: prossima partita, formazione, un nome in rosa, marcatori o stadio.`,
    [
      { href: "/cerca", label: "Cerca" },
      { href: "/rosa", label: "Rosa" },
      { href: "/calendario", label: "Partite" },
    ]
  );
}
