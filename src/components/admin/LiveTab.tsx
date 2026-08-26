"use client";

import { useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { hapticLight } from "@/lib/native";
import { useTeam } from "@/context/TeamContext";
import type { MatchEventType, MatchLive, Player, TeamData } from "@/lib/types";
import {
  EVENT_LABELS,
  emptyMatchLive,
  eventIcon,
  formatMinuteLabel,
  liveClockMinute,
  liveForMatch,
  mergePlayerLiveStats,
  suggestedLiveMatch,
} from "@/lib/match-live";
import { LiveScoreboard, LiveTimeline } from "@/components/LiveBoard";
import { PlayerToken } from "@/components/PlayerKit";
import { todayKey } from "@/lib/dates";
import { getMatchKind, matchPublicTitle } from "@/lib/match-kind";

type Picker =
  | null
  | {
      type: MatchEventType;
      team: "us" | "opp";
      step: "main" | "assist";
      playerId: string;
      assistId: string;
      playerOutId: string;
      playerInId: string;
      oppName: string;
      text: string;
    };

function sortMatches(matches: TeamData["matches"]) {
  const today = todayKey();
  return [...matches]
    .filter((item) => getMatchKind(item) === "partita")
    .sort((a, b) => {
    const aOpen = a.result ? 1 : 0;
    const bOpen = b.result ? 1 : 0;
    if (aOpen !== bOpen) return aOpen - bOpen;
    const aToday = a.date === today ? 0 : 1;
    const bToday = b.date === today ? 0 : 1;
    if (aToday !== bToday) return aToday - bToday;
    return b.date.localeCompare(a.date);
  });
}

export default function LiveTab({
  draft,
  setDraft,
}: {
  draft: TeamData;
  setDraft: (data: TeamData) => void;
}) {
  const { refresh } = useTeam();
  const suggested = suggestedLiveMatch(draft);
  const [matchId, setMatchId] = useState(
    suggested?.id || sortMatches(draft.matches)[0]?.id || ""
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [picker, setPicker] = useState<Picker>(null);
  const [query, setQuery] = useState("");

  const match = draft.matches.find(
    (item) => item.id === matchId && getMatchKind(item) === "partita"
  );
  const live: MatchLive = liveForMatch(draft, matchId) || emptyMatchLive(matchId);
  const roster = useMemo(() => {
    const called = new Set(draft.club.callupPlayerIds || []);
    const base = called.size
      ? [...draft.players].sort((a, b) => Number(called.has(b.id)) - Number(called.has(a.id)))
      : draft.players;
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (p) => p.name.toLowerCase().includes(q) || String(p.number).includes(q)
    );
  }, [draft.players, draft.club.callupPlayerIds, query]);

  const mergeTeam = (team: TeamData) => {
    setDraft({
      ...draft,
      players: mergePlayerLiveStats(draft.players, team.players),
      matches: draft.matches.map((item) => team.matches.find((m) => m.id === item.id) || item),
      club: {
        ...draft.club,
        info: {
          ...draft.club.info,
          liveStatus: team.club.info.liveStatus,
          liveScore: team.club.info.liveScore,
          liveMinute: team.club.info.liveMinute,
          liveMatchId: team.club.info.liveMatchId,
        },
        matchLives: team.club.matchLives,
      },
    });
  };

  const send = async (body: Record<string, unknown>) => {
    setBusy(true);
    setMessage("");
    try {
      const res = await apiFetch("/api/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, ...body }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(json.error || "Errore live");
        return false;
      }
      if (json.team) mergeTeam(json.team as TeamData);
      await refresh();
      await hapticLight();
      setMessage(json.message || "Pubblicato");
      return true;
    } catch {
      setMessage("Connessione non riuscita");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const openPicker = (type: MatchEventType, team: "us" | "opp" = "us") => {
    setQuery("");
    setPicker({
      type,
      team,
      step: "main",
      playerId: "",
      assistId: "",
      playerOutId: "",
      playerInId: "",
      oppName: "",
      text: "",
    });
  };

  const clock = liveClockMinute(live);

  const submitPicker = async (next: NonNullable<Picker>) => {
    const ok = await send({
      action: "event",
      event: {
        type: next.type,
        team: next.team,
        playerId: next.playerId,
        assistId: next.assistId,
        playerOutId: next.playerOutId,
        playerInId: next.playerInId,
        oppName: next.oppName,
        text: next.text,
        minute: clock.total,
      },
    });
    if (ok) setPicker(null);
  };

  const needsPlayer = picker && picker.team === "us" && picker.type !== "note" && picker.type !== "var";
  const oppEvent = picker && picker.team === "opp";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Diretta partita</h2>
        <p className="mt-1 text-sm opacity-70">
          I gol e i cartellini si pubblicano subito su Live e sulla pagina della gara. Non serve Salva Tutto.
        </p>
      </div>

      <label className="block space-y-1">
        <span className="text-xs opacity-70">Partita</span>
        {sortMatches(draft.matches).length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm opacity-70">
            Nessuna partita in calendario. Allenamenti e amichevoli non hanno la diretta.
          </p>
        ) : (
          <select
            value={matchId}
            onChange={(e) => setMatchId(e.target.value)}
            className="input-field"
          >
            {sortMatches(draft.matches).map((item) => (
              <option key={item.id} value={item.id}>
                {item.date} · {item.isHome ? "vs" : "@"} {item.opponent || matchPublicTitle(item)}
                {item.result ? ` (${item.result})` : ""}
              </option>
            ))}
          </select>
        )}
      </label>

      {match && (
        <LiveScoreboard live={live} match={match} teamName={draft.settings.teamName} />
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <button type="button" disabled={busy} onClick={() => void send({ action: "start" })} className="live-action">
          ▶️ Inizio
        </button>
        <button type="button" disabled={busy} onClick={() => void send({ action: "status", status: "ht" })} className="live-action">
          ⏸ Intervallo
        </button>
        <button type="button" disabled={busy} onClick={() => void send({ action: "start" })} className="live-action">
          2° tempo
        </button>
        <button type="button" disabled={busy} onClick={() => void send({ action: "status", status: "ft" })} className="live-action">
          Fine
        </button>
        <button type="button" disabled={busy} onClick={() => void send({ action: "close" })} className="live-action col-span-2 sm:col-span-1">
          Chiudi
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void send({ action: "minute", minute: Math.max(0, clock.total - 1) })}
          className="live-action w-14"
        >
          −
        </button>
        <div className="flex-1 rounded-xl border border-white/15 bg-black/30 px-3 py-3 text-center">
          <p className="text-xs uppercase tracking-wider opacity-50">Minuto</p>
          <p className="text-2xl font-black tabular-nums">{formatMinuteLabel(live)}</p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void send({ action: "minute", minute: clock.total + 1 })}
          className="live-action w-14"
        >
          +
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <button type="button" disabled={busy} onClick={() => openPicker("goal", "us")} className="live-action live-action-goal">
          ⚽ Gol nostro
        </button>
        <button type="button" disabled={busy} onClick={() => openPicker("goal", "opp")} className="live-action">
          ⚽ Gol loro
        </button>
        <button type="button" disabled={busy} onClick={() => openPicker("penalty", "us")} className="live-action">
          🎯 Rigore
        </button>
        <button type="button" disabled={busy} onClick={() => openPicker("own_goal", "us")} className="live-action">
          ⚪ Autogol
        </button>
        <button type="button" disabled={busy} onClick={() => openPicker("yellow", "us")} className="live-action">
          🟨 Giallo
        </button>
        <button type="button" disabled={busy} onClick={() => openPicker("red", "us")} className="live-action">
          🟥 Rosso
        </button>
        <button type="button" disabled={busy} onClick={() => openPicker("sub", "us")} className="live-action">
          🔁 Cambio
        </button>
        <button type="button" disabled={busy} onClick={() => openPicker("note", "us")} className="live-action">
          📝 Nota
        </button>
      </div>

      <div className="flex gap-2">
        <button type="button" disabled={busy || live.events.length === 0} onClick={() => void send({ action: "undo" })} className="live-action flex-1">
          ↩ Annulla ultimo
        </button>
      </div>

      {message && <p className="text-sm opacity-80">{message}</p>}

      {live.events.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <h3 className="mb-2 font-bold">Cronaca</h3>
          <LiveTimeline live={live} players={draft.players} />
        </div>
      )}

      {picker && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-3 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:items-center">
          <div className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/15 bg-[#12081f] p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider opacity-50">
                  {eventIcon(picker.type)} {EVENT_LABELS[picker.type]}
                </p>
                <h3 className="text-lg font-black">
                  {picker.step === "assist"
                    ? "Assist?"
                    : picker.type === "sub"
                      ? picker.playerOutId
                        ? "Chi entra"
                        : "Chi esce"
                      : picker.team === "opp"
                        ? "Marcatore avversario"
                        : "Scegli il giocatore"}
                </h3>
              </div>
              <button type="button" className="min-h-11 rounded-xl px-3" onClick={() => setPicker(null)}>
                Chiudi
              </button>
            </div>

            {(oppEvent || picker.type === "note" || picker.type === "var") && (
              <div className="space-y-3">
                <input
                  className="input-field"
                  placeholder={picker.type === "note" ? "Testo della nota" : "Nome avversario"}
                  value={picker.type === "note" || picker.type === "var" ? picker.text : picker.oppName}
                  onChange={(e) =>
                    setPicker({
                      ...picker,
                      ...(picker.type === "note" || picker.type === "var"
                        ? { text: e.target.value }
                        : { oppName: e.target.value }),
                    })
                  }
                />
                <button
                  type="button"
                  disabled={busy}
                  className="live-action live-action-goal w-full"
                  onClick={() => void submitPicker(picker)}
                >
                  Pubblica
                </button>
              </div>
            )}

            {needsPlayer && picker.step === "assist" && (
              <div className="space-y-3">
                <button
                  type="button"
                  className="live-action w-full"
                  onClick={() => void submitPicker({ ...picker, assistId: "" })}
                >
                  Nessun assist
                </button>
                <PlayerPickList
                  players={roster.filter((p) => p.id !== picker.playerId)}
                  onPick={(p) => void submitPicker({ ...picker, assistId: p.id })}
                />
              </div>
            )}

            {needsPlayer && picker.step === "main" && picker.type === "sub" && (
              <PlayerPickList
                players={roster}
                onPick={(p) => {
                  if (!picker.playerOutId) {
                    setPicker({ ...picker, playerOutId: p.id });
                    setQuery("");
                    return;
                  }
                  void submitPicker({ ...picker, playerInId: p.id });
                }}
              />
            )}

            {needsPlayer && picker.step === "main" && picker.type !== "sub" && (
              <div className="space-y-3">
                <input
                  className="input-field"
                  placeholder="Cerca numero o nome"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <PlayerPickList
                  players={roster}
                  onPick={(p) => {
                    if (picker.type === "goal") {
                      setPicker({ ...picker, playerId: p.id, step: "assist" });
                      setQuery("");
                      return;
                    }
                    void submitPicker({ ...picker, playerId: p.id });
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PlayerPickList({
  players,
  onPick,
}: {
  players: Player[];
  onPick: (player: Player) => void;
}) {
  return (
    <div className="grid max-h-[50vh] grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
      {players.map((player) => (
        <button
          key={player.id}
          type="button"
          onClick={() => onPick(player)}
          className="flex min-h-16 flex-col items-center rounded-xl border border-white/10 bg-white/5 p-2 hover:border-[var(--team-accent)]"
        >
          <PlayerToken player={player} size="sm" />
        </button>
      ))}
    </div>
  );
}
