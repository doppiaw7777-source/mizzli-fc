"use client";

import Link from "next/link";
import AppShell from "@/components/AppShell";
import SectionPage, { SoftCard } from "@/components/SectionPage";
import LiveBoard from "@/components/LiveBoard";
import { useTeam } from "@/context/TeamContext";
import { useLiveRefresh } from "@/lib/use-live-refresh";
import { upcomingMatch } from "@/lib/club";
import { formatItDate } from "@/lib/dates";
import { isLiveActive } from "@/lib/match-live";
import { useUser } from "@/context/UserContext";
import { canEditLive } from "@/lib/roles";

export default function LivePage() {
  const { data } = useTeam();
  const { user } = useUser();
  const info = data?.club?.info;
  useLiveRefresh(info?.liveStatus);

  if (!data) return null;
  const live = (data.club.matchLives || []).find(
    (item) => item.matchId === info?.liveMatchId || item.status === "live" || item.status === "ht"
  ) || (data.club.matchLives || []).find((item) => item.status === "ft");
  const next = upcomingMatch(data);
  const active = isLiveActive(live);

  return (
    <AppShell page="altro">
      <SectionPage title="Live" subtitle="Diretta, cronaca, streaming e radio">
        {live && live.status !== "idle" ? (
          <LiveBoard data={data} matchId={live.matchId} />
        ) : (
          <SoftCard className="text-center">
            <p className="text-sm uppercase tracking-wider text-[var(--team-accent)]">
              Nessuna diretta attiva
            </p>
            <p className="mt-3 opacity-70">
              Quando il mister avvia la gara da Area staff → Live, qui comparono risultato e cronaca.
            </p>
            {canEditLive(user) && (
              <Link href="/staff" className="mt-4 inline-block font-semibold text-[var(--team-accent)]">
                Apri la diretta
              </Link>
            )}
            {next && (
              <p className="mt-4 text-sm opacity-80">
                Prossima: {next.isHome ? "vs" : "@"} {next.opponent} ·{" "}
                {formatItDate(next.date, { weekday: "long", day: "numeric", month: "short" })} {next.time}
              </p>
            )}
          </SoftCard>
        )}

        <div className="grid gap-3 md:grid-cols-3">
          {info?.liveStreamUrl && (
            <a href={info.liveStreamUrl} className="rounded-xl bg-white/10 p-4 font-semibold">
              📺 Streaming
            </a>
          )}
          {info?.radioUrl && (
            <a href={info.radioUrl} className="rounded-xl bg-white/10 p-4 font-semibold">
              📻 Radio
            </a>
          )}
          {info?.youtubeUrl && (
            <a href={info.youtubeUrl} className="rounded-xl bg-white/10 p-4 font-semibold">
              ▶️ YouTube
            </a>
          )}
        </div>

        {active && (
          <p className="text-center text-xs opacity-50">Aggiornamento automatico ogni pochi secondi.</p>
        )}

        <Link href="/calendario" className="block text-center text-sm font-semibold text-[var(--team-accent)]">
          Tutte le partite
        </Link>
      </SectionPage>
    </AppShell>
  );
}
