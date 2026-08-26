"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useUser } from "@/context/UserContext";

type Summary = {
  playerId: string;
  average: number | null;
  count: number;
  myScore: number | null;
};

interface PlayerRatingControlProps {
  matchId: string;
  playerId: string;
  compact?: boolean;
  className?: string;
}

export default function PlayerRatingControl({
  matchId,
  playerId,
  compact = false,
  className = "",
}: PlayerRatingControlProps) {
  const { user, loading: userLoading } = useUser();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    if (!matchId || !playerId) return;
    try {
      const res = await apiFetch(
        `/api/ratings?matchId=${encodeURIComponent(matchId)}&playerId=${encodeURIComponent(playerId)}`
      );
      const data = await res.json();
      if (res.ok && data.summary) setSummary(data.summary);
    } catch {
      /* ignore */
    }
  }, [matchId, playerId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function vote(score: number) {
    if (!user) return;
    setSaving(true);
    setError("");
    try {
      const res = await apiFetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, playerId, score }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Errore nel salvataggio");
        return;
      }
      setSummary(data.summary);
      setOpen(false);
    } catch {
      setError("Connessione fallita");
    } finally {
      setSaving(false);
    }
  }

  const avgLabel =
    summary?.average != null ? summary.average.toFixed(1) : "—";
  const myLabel = summary?.myScore != null ? String(summary.myScore) : null;

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          className="flex min-w-[2.25rem] flex-col items-center rounded-lg bg-black/70 px-1.5 py-0.5 text-[10px] font-bold leading-tight backdrop-blur-sm"
          title="Vota questo giocatore"
        >
          <span className="text-[var(--team-accent)]">{avgLabel}</span>
          {myLabel && <span className="opacity-70">tu {myLabel}</span>}
        </button>
        {open && (
          <div
            className="absolute left-1/2 top-full z-30 mt-1 w-44 -translate-x-1/2 rounded-xl border border-white/15 bg-[var(--team-secondary)] p-2 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <VotePanel
              user={!!user}
              userLoading={userLoading}
              saving={saving}
              error={error}
              myScore={summary?.myScore ?? null}
              onVote={vote}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-white/10 bg-white/5 p-3 ${className}`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide opacity-50">Voto partita</p>
          <p className="text-lg font-black text-[var(--team-accent)]">
            {avgLabel}
            <span className="ml-2 text-xs font-normal opacity-60">
              {summary?.count ? `${summary.count} voti` : "nessun voto"}
            </span>
          </p>
        </div>
        {myLabel && (
          <p className="rounded-lg bg-[var(--team-accent)]/20 px-2 py-1 text-sm font-bold">
            Il tuo: {myLabel}
          </p>
        )}
      </div>
      <VotePanel
        user={!!user}
        userLoading={userLoading}
        saving={saving}
        error={error}
        myScore={summary?.myScore ?? null}
        onVote={vote}
      />
    </div>
  );
}

function VotePanel({
  user,
  userLoading,
  saving,
  error,
  myScore,
  onVote,
}: {
  user: boolean;
  userLoading: boolean;
  saving: boolean;
  error: string;
  myScore: number | null;
  onVote: (n: number) => void;
}) {
  if (userLoading) {
    return <p className="text-xs opacity-60">Caricamento…</p>;
  }
  if (!user) {
    return (
      <p className="text-xs opacity-80">
        <Link href="/accedi" className="font-semibold text-[var(--team-accent)] underline">
          Accedi
        </Link>{" "}
        per votare da 1 a 10.
      </p>
    );
  }
  return (
    <div>
      <p className="mb-1.5 text-[11px] opacity-60">Il tuo voto (1–10)</p>
      <div className="grid grid-cols-5 gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            disabled={saving}
            onClick={() => onVote(n)}
            className={`rounded-md py-1.5 text-xs font-bold transition ${
              myScore === n
                ? "bg-[var(--team-accent)] text-[var(--team-secondary)]"
                : "bg-white/10 hover:bg-white/20"
            } disabled:opacity-50`}
          >
            {n}
          </button>
        ))}
      </div>
      {error && <p className="mt-1 text-xs text-red-300">{error}</p>}
    </div>
  );
}

export function useMatchRatings(matchId: string | null) {
  const [summaries, setSummaries] = useState<Record<string, Summary>>({});
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!matchId) {
      setSummaries({});
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch(
        `/api/ratings?matchId=${encodeURIComponent(matchId)}`
      );
      const data = await res.json();
      if (res.ok) {
        const map: Record<string, Summary> = {};
        for (const s of data.summaries || []) map[s.playerId] = s;
        setSummaries(map);
        setLoggedIn(!!data.loggedIn);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { summaries, loggedIn, loading, refresh };
}
