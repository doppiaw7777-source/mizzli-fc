"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import FormationView from "@/components/FormationView";
import MatchCard from "@/components/MatchCard";
import { CallupGrid } from "@/components/CallupBoard";
import SectionPage, { SoftCard } from "@/components/SectionPage";
import { isCallupLive, sortCalledPlayers } from "@/lib/club";
import { useTeam } from "@/context/TeamContext";
import LiveBoard from "@/components/LiveBoard";
import { useLiveRefresh } from "@/lib/use-live-refresh";
import { liveForMatch } from "@/lib/match-live";
import { isSimpleCalendarEvent, matchPageTitle } from "@/lib/match-kind";

export default function PartitaPage() {
  const { id } = useParams<{ id: string }>();
  const { data } = useTeam();
  const live = data ? liveForMatch(data, id) : null;
  useLiveRefresh(live?.status);

  if (!data) return null;
  const match = data.matches.find((m) => m.id === id);
  if (!match) {
    return (
      <AppShell page="calendario">
        <p>
          Partita non trovata. <Link href="/calendario">Calendario</Link>
        </p>
      </AppShell>
    );
  }
  const motm = data.players.find((p) => p.id === match.motmId);
  const callupLive = isCallupLive(data.club);
  const called = sortCalledPlayers(data.players, data.club.callupPlayerIds);
  const session = isSimpleCalendarEvent(match);

  return (
    <AppShell page="calendario">
      <SectionPage title={matchPageTitle(match, data.settings.teamName)}>
        <MatchCard match={match} showShare={data.settings.ui.enableMatchShare} />
        {session ? (
          match.note ? (
            <SoftCard>
              <h2 className="font-bold">Note staff</h2>
              <p className="mt-2 opacity-80">{match.note}</p>
            </SoftCard>
          ) : null
        ) : (
          <>
            {live && live.status !== "idle" && <LiveBoard data={data} matchId={match.id} />}
            <SoftCard>
              <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">Convocati</h2>
                  <p className="mt-1 text-sm opacity-70">
                    {callupLive && called.length
                      ? `${called.length} giocatori convocati per questa gara.`
                      : data.club.callupNote || "Lista convocati della prossima gara."}
                  </p>
                  {data.club.callupMeeting && (
                    <p className="mt-1 text-sm opacity-70">📍 {data.club.callupMeeting}</p>
                  )}
                </div>
                <Link
                  href="/convocati"
                  className="text-sm font-semibold text-[var(--team-accent)] underline"
                >
                  Apri convocati
                </Link>
              </div>
              {called.length > 0 ? (
                <CallupGrid players={called} captainId={data.formation.captainId} />
              ) : (
                <p className="text-sm opacity-60">Nessun convocato pubblicato.</p>
              )}
            </SoftCard>
            <div className="grid gap-4 md:grid-cols-2">
              {match.preview && (
                <SoftCard>
                  <h2 className="font-bold">Preview</h2>
                  <p className="mt-2 whitespace-pre-wrap opacity-80">{match.preview}</p>
                </SoftCard>
              )}
              {match.report && (
                <SoftCard>
                  <h2 className="font-bold">Cronaca</h2>
                  <p className="mt-2 whitespace-pre-wrap opacity-80">{match.report}</p>
                </SoftCard>
              )}
              <SoftCard>
                <h2 className="font-bold">Info gara</h2>
                <ul className="mt-2 space-y-1 text-sm opacity-80">
                  <li>Arbitro: {match.referee || "—"}</li>
                  <li>Spettatori: {match.attendance || "—"}</li>
                  <li>TV / streaming: {match.tv || "—"}</li>
                  <li>Meteo: {match.weather || "—"}</li>
                  <li>MOTM: {motm ? motm.name : "—"}</li>
                </ul>
                {match.ticketUrl && (
                  <a href={match.ticketUrl} className="mt-3 inline-block text-[var(--team-accent)]">
                    Biglietti
                  </a>
                )}
              </SoftCard>
              {match.note && (
                <SoftCard>
                  <h2 className="font-bold">Note staff</h2>
                  <p className="mt-2 opacity-80">{match.note}</p>
                </SoftCard>
              )}
            </div>

            <SoftCard>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">Formazione & voti</h2>
                  <p className="mt-1 text-sm opacity-70">
                    Tocca un giocatore e dai un voto da 1 a 10. Tutti possono votare
                    dopo il login.
                  </p>
                </div>
                <Link
                  href={`/formazione?matchId=${encodeURIComponent(match.id)}`}
                  className="text-sm font-semibold text-[var(--team-accent)] underline"
                >
                  Apri in Formazione
                </Link>
              </div>
              <FormationView
                formation={data.formation}
                players={data.players}
                staff={data.staff}
                matchId={match.id}
                enableRatings
                settings={data.settings}
              />
            </SoftCard>
          </>
        )}
      </SectionPage>
    </AppShell>
  );
}
