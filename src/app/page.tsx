"use client";

import Link from "next/link";
import AppShell from "@/components/AppShell";
import StandingsTable from "@/components/StandingsTable";
import SocialButtons from "@/components/SocialButtons";
import { HomeCallupCard } from "@/components/CallupBoard";
import { formGuide, lastResult, upcomingBirthdays, upcomingMatch } from "@/lib/club";
import { formatItDate } from "@/lib/dates";
import { useTeam } from "@/context/TeamContext";
import { useUser } from "@/context/UserContext";
import { teamCrest } from "@/lib/brand";
import { defaultEventColor, hexAlpha } from "@/lib/event-color";
import LiveBoard from "@/components/LiveBoard";
import { useLiveRefresh } from "@/lib/use-live-refresh";
import {
  ROLE_BLURBS,
  ROLE_LABELS,
  canAccessStaff,
  isFanRole,
} from "@/lib/roles";

export default function HomePage() {
  const { data, isAdmin } = useTeam();
  const { user } = useUser();

  useLiveRefresh(data?.club?.info?.liveStatus);

  if (!data) return null;

  const nextMatch = upcomingMatch(data);
  const last = lastResult(data);
  const form = formGuide(data);
  const bdays = upcomingBirthdays(data.players, 14);
  const b = data.settings.branding;
  const ui = data.settings.ui;
  const magazine = ui.homeLayout === "magazine";
  const minimal = ui.homeLayout === "minimal";

  const cards = [
    {
      href: "/rosa",
      icon: "👥",
      title: b.rosaLabel || "Rosa",
      desc: `${data.players.length} giocatori in squadra`,
    },
    {
      href: "/calendario",
      icon: "📅",
      title: b.calendarioLabel || "Calendario",
      desc: `${data.matches.length} partite in programma`,
    },
    {
      href: "/formazione",
      icon: "⚽",
      title: b.formazioneLabel || "Formazione",
      desc: `Modulo ${data.formation.scheme} ufficiale`,
    },
    {
      href: "/convocati",
      icon: "📋",
      title: "Convocati",
      desc: "Lista ufficiale per la prossima gara",
    },
    {
      href: "/scarica",
      icon: "📲",
      title: "Scarica l'app",
      desc: "iPhone, Android e computer",
    },
    ...(isAdmin && ui.showHomeAdminCard
      ? [
          {
            href: "/admin",
            icon: "🔧",
            title: "Admin",
            desc: "Personalizza tutto il sito",
          },
        ]
      : []),
  ];
  const pinnedNews = [...data.announcements]
    .sort((a, b) => Number(b.pinned) - Number(a.pinned))
    .slice(0, 3);

  const titleClass =
    ui.titleSize === "xl"
      ? "text-6xl md:text-7xl"
      : ui.titleSize === "large"
        ? "text-5xl md:text-6xl"
        : "text-4xl md:text-5xl";

  const heroAlign =
    ui.heroStyle === "left"
      ? "text-left"
      : ui.heroStyle === "banner"
        ? "rounded-3xl border border-white/10 bg-[var(--team-card-bg)] p-8 text-center team-card"
        : "text-center";

  return (
    <AppShell page="home">
      <div className={minimal ? "space-y-6" : "space-y-10"}>
        <section className={heroAlign}>
          <img
            src={teamCrest(data.settings)}
            alt={data.settings.teamName}
            className={`${heroAlign.includes("text-left") ? "" : "mx-auto "}club-crest club-crest-glow mb-5 h-28 w-28`}
          />
          {(b.leagueName || b.seasonLabel) && (
            <p className="page-kicker">
              {[b.leagueName, b.seasonLabel].filter(Boolean).join(" · ")}
            </p>
          )}
          <h1 className={`${titleClass} font-black tracking-tight`}>
            {data.settings.teamName}
          </h1>
          {ui.showMotto && (
            <p className="mt-3 text-xl opacity-80">{data.settings.motto}</p>
          )}
          {b.welcomeMessage && (
            <p className="mx-auto mt-3 max-w-2xl opacity-70">{b.welcomeMessage}</p>
          )}
          {b.stadiumName && (
            <p className="mt-2 text-sm opacity-50">🏟️ {b.stadiumName}</p>
          )}
          {ui.showSocialLinks && data.socialLinks.length > 0 && (
            <SocialButtons links={data.socialLinks} className="mt-5" />
          )}
          <Link
            href="/scarica"
            className="mt-6 inline-block rounded-2xl bg-[var(--team-accent)] px-6 py-3 font-black tracking-tight text-[var(--team-secondary)] shadow-[0_12px_28px_rgba(0,0,0,0.28)] transition hover:brightness-110"
          >
            Scarica l&apos;app ufficiale
          </Link>
        </section>

        {data.club.info.alertBanner && (
          <p className="rounded-2xl bg-[var(--team-accent)] px-4 py-3 text-center font-bold text-[var(--team-secondary)]">
            {data.club.info.alertBanner}
          </p>
        )}

        {user && (
          <Link
            href={canAccessStaff(user) ? "/staff" : "/profilo"}
            className="block rounded-2xl border border-white/10 bg-[var(--team-card-bg)] p-4"
          >
            <p className="text-xs uppercase tracking-wider text-[var(--team-accent)]">
              {ROLE_LABELS[user.role]}
            </p>
            <p className="mt-1 font-bold">
              {isFanRole(user.role) ? `Ciao ${user.name.split(" ")[0]}, vota e leggi` : `Ciao ${user.name.split(" ")[0]}`}
            </p>
            <p className="mt-1 text-sm opacity-70">{ROLE_BLURBS[user.role]}</p>
          </Link>
        )}

        {data.club.info.liveStatus !== "idle" && (
          <LiveBoard data={data} compact href="/live" />
        )}

        {nextMatch && ui.showNextMatchCard && nextMatch.id !== data.club.info.liveMatchId && (
          <section
            className="relative mx-auto max-w-xl overflow-hidden rounded-2xl border bg-[var(--team-card-bg)] p-6 text-center backdrop-blur-md team-card"
            style={{
              borderColor: hexAlpha(nextMatch.color || defaultEventColor("match"), 0.4),
              boxShadow: `0 18px 40px ${hexAlpha(nextMatch.color || defaultEventColor("match"), 0.12)}`,
            }}
          >
            <span
              className="absolute inset-x-0 top-0 h-1"
              style={{ background: nextMatch.color || defaultEventColor("match") }}
              aria-hidden
            />
            <p className="page-kicker">
              {b.nextMatchLabel || "Prossima Partita"}
            </p>
            <p className="mt-3 text-2xl font-bold tracking-tight">
              {nextMatch.isHome ? data.settings.teamName : nextMatch.opponent}{" "}
              <span className="text-[var(--team-accent)]">VS</span>{" "}
              {nextMatch.isHome ? nextMatch.opponent : data.settings.teamName}
            </p>
            <p className="mt-2 opacity-70">
              {formatItDate(nextMatch.date, {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}{" "}
              · {nextMatch.time}
            </p>
            <p className="text-sm opacity-50">{nextMatch.location}</p>
            <Link
              href={`/partita/${nextMatch.id}`}
              className="mt-3 inline-block text-sm font-semibold text-[var(--team-accent)]"
            >
              Dettaglio partita
            </Link>
          </section>
        )}

        <HomeCallupCard />

        {(last || form.length > 0 || bdays.length > 0) && (
          <div className="grid gap-4 md:grid-cols-3">
            {last && (
              <Link href={`/partita/${last.id}`} className="rounded-2xl border border-white/10 bg-[var(--team-card-bg)] p-4 team-card">
                <p className="page-kicker">Ultimo risultato</p>
                <p className="mt-2 font-bold tracking-tight">{last.opponent} {last.result}</p>
              </Link>
            )}
            {form.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-[var(--team-card-bg)] p-4 team-card">
                <p className="page-kicker">Forma</p>
                <p className="mt-2 flex gap-1">
                  {form.map((f, i) => (
                    <span
                      key={i}
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${
                        f === "V" ? "bg-green-600" : f === "P" ? "bg-red-600" : "bg-white/20"
                      }`}
                    >
                      {f}
                    </span>
                  ))}
                </p>
              </div>
            )}
            {bdays.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-[var(--team-card-bg)] p-4 team-card">
                <p className="page-kicker">Compleanni</p>
                <p className="mt-1 font-bold">{bdays[0].player.name} tra {bdays[0].inDays}g</p>
              </div>
            )}
          </div>
        )}

        {ui.showStandings && data.standings?.rows?.length > 0 && (
          <StandingsTable standings={data.standings} />
        )}

        <section
          className={`grid gap-6 ${
            magazine
              ? "sm:grid-cols-2 lg:grid-cols-3"
              : cards.length > 3
                ? "sm:grid-cols-2 lg:grid-cols-4"
                : "sm:grid-cols-3"
          }`}
        >
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-2xl border border-white/10 bg-[var(--team-card-bg)] p-6 backdrop-blur-md team-card"
            >
              <span className="text-4xl">{card.icon}</span>
              <h2 className="mt-4 text-xl font-bold tracking-tight group-hover:text-[var(--team-accent)]">
                {card.title}
              </h2>
              <p className="mt-1 text-sm opacity-60">{card.desc}</p>
            </Link>
          ))}
        </section>

        {ui.showHomeStats && (
          <section className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-2xl border border-white/10 bg-[var(--team-card-bg)] p-5 backdrop-blur-md team-card">
              <p className="text-3xl font-black text-[var(--team-accent)]">
                {data.players.length}
              </p>
              <p className="text-sm opacity-60">Giocatori</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[var(--team-card-bg)] p-5 backdrop-blur-md team-card">
              <p className="text-3xl font-black text-[var(--team-accent)]">
                {data.staff.length}
              </p>
              <p className="text-sm opacity-60">Staff</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[var(--team-card-bg)] p-5 backdrop-blur-md team-card">
              <p className="text-3xl font-black text-[var(--team-accent)]">
                {data.players.reduce((s, p) => s + p.stats.goals, 0)}
              </p>
              <p className="text-sm opacity-60">Gol Totali</p>
            </div>
          </section>
        )}

        {ui.showAbout && b.aboutText && (
          <section className="rounded-2xl border border-white/10 bg-[var(--team-card-bg)] p-6 backdrop-blur-md team-card">
            <h3 className="mb-2 text-lg font-bold">Chi siamo</h3>
            <p className="whitespace-pre-wrap opacity-80">{b.aboutText}</p>
            {(b.contactEmail || b.contactPhone) && (
              <p className="mt-3 text-sm opacity-60">
                {b.contactEmail}
                {b.contactEmail && b.contactPhone ? " · " : ""}
                {b.contactPhone}
              </p>
            )}
          </section>
        )}

        <section className={`grid gap-4 ${magazine ? "lg:grid-cols-1" : "lg:grid-cols-2"}`}>
          {ui.showNews && (
          <div className="rounded-2xl border border-white/10 bg-[var(--team-card-bg)] p-5 backdrop-blur-md team-card">
            <h3 className="mb-3 text-lg font-bold">📣 {b.newsTitle || "News squadra"}</h3>
            <div className="space-y-2">
              {pinnedNews.map((n) => (
                <div key={n.id} className="rounded-xl border border-white/5 bg-white/5 p-3">
                  <p className="font-semibold">
                    {n.pinned ? "⭐ " : ""}
                    {n.title}
                  </p>
                  <p className="text-sm opacity-70">{n.description}</p>
                </div>
              ))}
            </div>
          </div>
          )}
          {ui.showTrainings && (
          <div className="rounded-2xl border border-white/10 bg-[var(--team-card-bg)] p-5 backdrop-blur-md team-card">
            <h3 className="mb-3 text-lg font-bold">🏃 {b.trainingsTitle || "Prossimi allenamenti"}</h3>
            <div className="space-y-2">
              {data.trainings.slice(0, 4).map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-2">
                  <div>
                    <p className="font-semibold">
                      {t.day} · {t.time}
                    </p>
                    <p className="text-xs opacity-70">
                      {t.location} — {t.focus}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}
        </section>

        {ui.showSponsors && data.sponsors.length > 0 && (
          <section className="rounded-2xl border border-white/10 bg-[var(--team-card-bg)] p-5 backdrop-blur-md team-card">
            <h3 className="mb-3 text-lg font-bold">🤝 {b.sponsorsTitle || "Sponsor"}</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {data.sponsors.map((s) => (
                <a
                  key={s.id}
                  href={s.website || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-white/5 bg-white/5 p-3 transition hover:border-white/20"
                >
                  <p className="font-semibold">{s.name}</p>
                  {s.website && <p className="text-xs opacity-70">{s.website}</p>}
                </a>
              ))}
            </div>
          </section>
        )}

        {ui.showSocialLinks && data.socialLinks.length > 0 && (
          <SocialButtons links={data.socialLinks} />
        )}

        <p className="pt-4 text-center text-xs opacity-50">
          {b.footerText && <span className="mb-2 block">{b.footerText}</span>}
          <Link href="/privacy" className="underline">
            Privacy
          </Link>
          {" · "}
          <Link href="/termini" className="underline">
            Termini
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
