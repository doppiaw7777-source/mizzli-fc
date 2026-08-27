"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Match, MatchEvent, MatchLive, Player, TeamData } from "@/lib/types";
import {
  boardScore,
  eventIcon,
  formatLiveStatus,
  formatMinuteLabel,
  isLiveActive,
  liveClockMinute,
  parseClubScore,
  playerName,
  scoringEvents,
} from "@/lib/match-live";
import { PlayerToken } from "@/components/PlayerKit";
import { SoftCard } from "@/components/SectionPage";
import TeamBadge from "@/components/TeamBadge";
import { MIZZLI_NAME } from "@/lib/brand";
import { resolveTeamLogo } from "@/lib/club-teams";

function useTickingMinute(live?: MatchLive | null) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!live || live.status !== "live" || !live.clockStartedAt) return;
    const id = window.setInterval(() => setTick((n) => n + 1), 15000);
    return () => window.clearInterval(id);
  }, [live]);
  return live ? formatMinuteLabel(live) : "";
}

function EventLine({
  event,
  players,
}: {
  event: MatchEvent;
  players: Player[];
}) {
  return (
    <li className="flex items-start gap-3 py-3">
      <span className="w-12 shrink-0 pt-0.5 text-right text-sm font-black tabular-nums text-[var(--team-accent)]">
        {`${event.minute}${event.extra ? `+${event.extra}` : ""}'`}
      </span>
      <span className="text-lg leading-none">{eventIcon(event.type)}</span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold leading-snug">{event.text}</p>
        {event.type === "goal" && event.assistId && (
          <p className="text-xs opacity-50">Assist {playerName(players, event.assistId)}</p>
        )}
      </div>
    </li>
  );
}

function ScorerList({
  live,
  team,
  players,
  isHomeSide,
}: {
  live: MatchLive;
  team: "us" | "opp";
  players: Player[];
  isHomeSide: boolean;
}) {
  const events = scoringEvents(live, team);
  if (!events.length) return <p className="text-xs opacity-35">&nbsp;</p>;
  return (
    <ul className={`space-y-1 text-xs opacity-80 ${isHomeSide ? "text-right" : "text-left"}`}>
      {events.map((event) => {
        const name =
          event.team === "us"
            ? playerName(players, event.playerId) || "Gol"
            : event.oppName || "Gol";
        const og = event.type === "own_goal" ? " (aut)" : event.type === "penalty" ? " (rig)" : "";
        return (
          <li key={event.id}>
            {name}
            {og} {`${event.minute}'`}
          </li>
        );
      })}
    </ul>
  );
}

export function LiveScoreboard({
  live,
  match,
  teamName,
  compact = false,
  data,
}: {
  live: MatchLive;
  match?: Match | null;
  teamName?: string;
  compact?: boolean;
  data?: TeamData | null;
}) {
  const minute = useTickingMinute(live);
  const us = teamName || MIZZLI_NAME;
  const opp = match?.opponent || "Avversario";
  const home = match ? (match.isHome ? us : opp) : us;
  const away = match ? (match.isHome ? opp : us) : opp;
  const score = match ? boardScore(live, match.isHome) : `${live.scoreUs}–${live.scoreOpp}`;
  const active = isLiveActive(live);
  const usLogo = data ? resolveTeamLogo(data, us) : "";
  const oppLogo = data ? resolveTeamLogo(data, opp) : "";
  const homeLogo = match ? (match.isHome ? usLogo : oppLogo) : usLogo;
  const awayLogo = match ? (match.isHome ? oppLogo : usLogo) : oppLogo;
  const homeGold = match ? match.isHome : true;
  const awayGold = match ? !match.isHome : false;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-red-400/35 bg-red-500/10 ${
        compact ? "p-4" : "p-5 sm:p-6"
      }`}
    >
      {active && <span className="live-ribbon" aria-hidden />}
      <div className="flex items-center justify-center gap-2 text-xs font-black tracking-[0.2em]">
        {active && <span className="live-dot" />}
        <span className={active ? "text-red-300" : "text-[var(--team-accent)]"}>
          {formatLiveStatus(live.status)}
        </span>
        <span className="opacity-60">{minute}</span>
      </div>
      <div className={`mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 ${compact ? "" : "sm:gap-6"}`}>
        <div className={`flex items-center justify-end gap-2 ${compact ? "" : "sm:gap-3"}`}>
          <p className={`text-right font-black leading-tight ${compact ? "text-base" : "text-lg sm:text-2xl"}`}>
            {home}
          </p>
          <TeamBadge name={home} src={homeLogo} gold={homeGold} size={compact ? 36 : 52} />
        </div>
        <p className={`px-2 font-black tabular-nums text-[var(--team-accent)] ${compact ? "text-3xl" : "text-5xl sm:text-6xl"}`}>
          {score}
        </p>
        <div className={`flex items-center gap-2 ${compact ? "" : "sm:gap-3"}`}>
          <TeamBadge name={away} src={awayLogo} gold={awayGold} size={compact ? 36 : 52} />
          <p className={`font-black leading-tight ${compact ? "text-base" : "text-lg sm:text-2xl"}`}>
            {away}
          </p>
        </div>
      </div>
    </div>
  );
}

export function LiveTimeline({
  live,
  players,
  newestFirst = true,
}: {
  live: MatchLive;
  players: Player[];
  newestFirst?: boolean;
}) {
  const events = newestFirst ? [...live.events].reverse() : live.events;
  if (!events.length) {
    return <p className="text-sm opacity-60">Nessun evento in cronaca.</p>;
  }
  return (
    <ol className="divide-y divide-white/5">
      {events.map((event) => (
        <EventLine key={event.id} event={event} players={players} />
      ))}
    </ol>
  );
}

function resolveLive(data: TeamData, matchId?: string): MatchLive | null {
  const lives = data.club.matchLives || [];
  if (matchId) {
    const found = lives.find((item) => item.matchId === matchId);
    if (found && (found.status !== "idle" || found.events.length > 0)) return found;
    return null;
  }
  if (data.club.info.liveStatus === "idle") return null;
  const named = lives.find((item) => item.matchId === data.club.info.liveMatchId);
  if (named && named.status !== "idle") return named;
  const inPlay = lives.find((item) => item.status === "live" || item.status === "ht" || item.status === "ft");
  if (inPlay) return inPlay;
  const info = data.club.info;
  const parsed = parseClubScore(info.liveScore) || { us: 0, opp: 0 };
  const minute = Number.parseInt(String(info.liveMinute).replace(/\D/g, ""), 10) || 0;
  return {
    matchId: info.liveMatchId || "",
    status: info.liveStatus,
    scoreUs: parsed.us,
    scoreOpp: parsed.opp,
    minute,
    extra: 0,
    events: [],
    clockBaseMinute: minute,
    clockStartedAt: null,
    updatedAt: "",
  };
}

export default function LiveBoard({
  data,
  matchId,
  compact = false,
  href,
}: {
  data: TeamData;
  matchId?: string;
  compact?: boolean;
  href?: string;
}) {
  const live = resolveLive(data, matchId);
  if (!live || live.status === "idle") return null;
  const match = data.matches.find((item) => item.id === live.matchId);
  const body = (
    <div className="space-y-4">
      <LiveScoreboard live={live} match={match} teamName={data.settings.teamName} compact={compact} data={data} />
      {!compact && match && (
        <div className="grid grid-cols-2 gap-3 px-1">
          <ScorerList
            live={live}
            team={match.isHome ? "us" : "opp"}
            players={data.players}
            isHomeSide
          />
          <ScorerList
            live={live}
            team={match.isHome ? "opp" : "us"}
            players={data.players}
            isHomeSide={false}
          />
        </div>
      )}
      {!compact && (
        <SoftCard>
          <h2 className="mb-1 text-lg font-bold">Cronaca</h2>
          <LiveTimeline live={live} players={data.players} />
        </SoftCard>
      )}
    </div>
  );

  if (href || compact) {
    return (
      <Link href={href || `/live`} className="block">
        {compact ? (
          <LiveScoreboard live={live} match={match} teamName={data.settings.teamName} compact data={data} />
        ) : (
          body
        )}
      </Link>
    );
  }
  return body;
}

export function LivePlayerChip({ player, captain }: { player: Player; captain?: boolean }) {
  return <PlayerToken player={player} captain={captain} size="sm" />;
}

export function liveClockNow(live: MatchLive) {
  return liveClockMinute(live);
}
