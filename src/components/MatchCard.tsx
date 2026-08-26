"use client";

import Link from "next/link";
import type { Match } from "@/lib/types";
import { shareText } from "@/lib/native";
import { dateKey, formatItDate, todayKey } from "@/lib/dates";
import { useTeam } from "@/context/TeamContext";
import { MIZZLI_NAME } from "@/lib/brand";
import { boardScore, formatMinuteLabel, liveForMatch } from "@/lib/match-live";
import { defaultEventColor, hexAlpha } from "@/lib/event-color";
import {
  friendlyOpponent,
  getMatchKind,
  isSimpleCalendarEvent,
  matchPublicTitle,
  matchShareText,
} from "@/lib/match-kind";

export default function MatchCard({
  match,
  showShare = true,
}: {
  match: Match;
  showShare?: boolean;
}) {
  const { data } = useTeam();
  const us = data?.settings.teamName || MIZZLI_NAME;
  const kind = getMatchKind(match);
  const oppName =
    kind === "amichevole" ? friendlyOpponent(match) || "Avversario" : match.opponent;
  const homeName = match.isHome ? us : oppName;
  const awayName = match.isHome ? oppName : us;
  const isPast = dateKey(match.date) < todayKey();
  const hasResult = match.result && match.result.length > 0;
  const liveForThis = data ? liveForMatch(data, match.id) : null;
  const accent = match.color || defaultEventColor("match");
  const session = isSimpleCalendarEvent(match);
  const share = matchShareText(match, us);
  const when = formatItDate(match.date, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-[var(--team-card-bg)] p-5 pl-6 backdrop-blur-md transition-all duration-300 team-card ${
        isPast && !hasResult ? "opacity-60" : ""
      }`}
      style={{
        borderColor: hexAlpha(accent, 0.38),
        boxShadow: `0 18px 40px ${hexAlpha(accent, 0.1)}`,
      }}
    >
      <span
        className="absolute inset-y-0 left-0 w-1.5"
        style={{
          background: `linear-gradient(180deg, ${accent}, ${hexAlpha(accent, 0.4)})`,
        }}
        aria-hidden
      />
      <Link href={`/partita/${match.id}`} className="block">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span
            className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide"
            style={{
              background: hexAlpha(accent, 0.22),
              color: accent,
            }}
          >
            {session ? matchPublicTitle(match) : match.competition}
          </span>
          {!session && kind !== "amichevole" && (
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-bold tracking-wide ${
                match.isHome
                  ? "bg-[var(--team-accent)] text-[var(--team-secondary)]"
                  : "bg-white/10"
              }`}
            >
              {match.isHome ? "CASA" : "TRASFERTA"}
            </span>
          )}
        </div>

        {session ? (
          <div className="text-center">
            <p className="text-2xl font-black tracking-tight">{matchPublicTitle(match)}</p>
            <p className="mt-2 text-lg font-bold tabular-nums text-[var(--team-accent)]">
              {match.time || "—"}
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 text-right">
              <p className="text-lg font-bold tracking-tight">{homeName}</p>
            </div>

            <div className="flex flex-col items-center">
              {liveForThis && liveForThis.status !== "idle" ? (
                <p className="text-2xl font-black tabular-nums text-[var(--team-accent)]">
                  {boardScore(liveForThis, match.isHome)}
                </p>
              ) : hasResult ? (
                <p className="text-2xl font-black tabular-nums text-[var(--team-accent)]">
                  {match.result}
                </p>
              ) : (
                <p className="text-xs font-black tracking-[0.3em] opacity-40">VS</p>
              )}
              <p className="mt-1 text-sm tabular-nums opacity-70">
                {liveForThis && liveForThis.status !== "idle"
                  ? formatMinuteLabel(liveForThis)
                  : match.time}
              </p>
            </div>

            <div className="flex-1">
              <p className="text-lg font-bold tracking-tight">{awayName}</p>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-sm opacity-70">
          <span>{when}</span>
          <span className="truncate text-right">{match.location}</span>
        </div>
      </Link>
      {showShare && (
        <button
          type="button"
          onClick={() => shareText(share.title, share.body)}
          className="mt-3 w-full rounded-full bg-white/8 py-2.5 text-xs font-semibold tracking-wide transition hover:bg-white/14"
        >
          {kind === "allenamento"
            ? "Condividi allenamento"
            : kind === "amichevole"
              ? "Condividi amichevole"
              : "Condividi partita"}
        </button>
      )}
    </div>
  );
}
