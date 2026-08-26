"use client";

import AppShell from "@/components/AppShell";
import MatchCard from "@/components/MatchCard";
import ModernCalendar from "@/components/ModernCalendar";
import { useTeam } from "@/context/TeamContext";

export default function CalendarioPage() {
  const { data } = useTeam();
  if (!data) return null;

  const upcoming = data.matches
    .filter((m) => !m.result)
    .sort((a, b) => a.date.localeCompare(b.date));

  const past = data.matches
    .filter((m) => m.result && m.result.length > 0)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <AppShell page="calendario">
      <div className="space-y-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="page-kicker">
              {data.settings.branding.seasonLabel || "Stagione"}
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">
              {data.settings.branding.calendarioTitle || "Calendario"}
            </h1>
            <p className="mt-2 max-w-xl opacity-70">
              {data.settings.branding.leagueName
                ? `${data.settings.branding.leagueName} · partite, allenamenti e amichevoli`
                : "Partite, allenamenti e amichevoli: tocca una casella per l'agenda del giorno"}
            </p>
          </div>
          <a
            href="/api/calendar"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-[var(--team-accent)] transition hover:bg-white/10"
          >
            Scarica .ics
          </a>
        </div>

        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="page-kicker">Mese</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">Vista calendario</h2>
            </div>
          </div>
          <ModernCalendar
            matches={data.matches}
            events={data.club.events}
            modelId={data.settings.ui.calendarModelId}
            sizeId={data.settings.ui.calendarSize}
          />
        </section>

        <section>
          <p className="page-kicker">In programma</p>
          <h2 className="mb-4 mt-1 text-2xl font-bold tracking-tight">Prossimi impegni</h2>
          {upcoming.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm opacity-60">
              Nessun impegno in programma
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {upcoming.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  showShare={data.settings.ui.enableMatchShare}
                />
              ))}
            </div>
          )}
        </section>

        {past.length > 0 && (
          <section>
            <p className="page-kicker">Archivio</p>
            <h2 className="mb-4 mt-1 text-2xl font-bold tracking-tight">Risultati</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {past.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  showShare={data.settings.ui.enableMatchShare}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
