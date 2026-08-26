"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import SectionPage, { SoftCard } from "@/components/SectionPage";
import { useTeam } from "@/context/TeamContext";
import { useUser } from "@/context/UserContext";
import { apiFetch } from "@/lib/api";

export default function TifosiPage() {
  const { data, refresh } = useTeam();
  const { user } = useUser();
  const [mine, setMine] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/api/polls/vote")
      .then((r) => r.json())
      .then((d) => setMine(d.mine || {}))
      .catch(() => {});
  }, [user?.id]);

  if (!data) return null;

  const vote = async (pollId: string, optionId: string) => {
    if (!user) return;
    setBusy(optionId);
    setError("");
    try {
      const res = await apiFetch("/api/polls/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId, optionId }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload.error || "Voto non salvato");
        return;
      }
      if (payload.mine) setMine((prev) => ({ ...prev, [pollId]: payload.mine }));
      await refresh();
    } catch {
      setError("Connessione non riuscita");
    } finally {
      setBusy("");
    }
  };

  return (
    <AppShell page="altro">
      <SectionPage title="Tifosi" subtitle="Sondaggi, citazioni e curva">
        {!user && (
          <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
            <Link href="/accedi" className="font-semibold text-[var(--team-accent)]">
              Accedi
            </Link>{" "}
            per votare i sondaggi. Puoi comunque leggere i risultati.
          </p>
        )}
        {error && <p className="text-sm text-red-300">{error}</p>}
        {data.club.quotes.map((q) => (
          <SoftCard key={q.id}>
            <p className="text-lg italic">“{q.text}”</p>
            <p className="mt-2 text-sm opacity-60">— {q.author}</p>
          </SoftCard>
        ))}
        {data.club.polls.map((poll) => {
          const total = poll.options.reduce((s, o) => s + (o.votes || 0), 0) || 1;
          const my = mine[poll.id];
          return (
            <SoftCard key={poll.id}>
              <h2 className="font-bold">{poll.question}</h2>
              <div className="mt-3 space-y-2">
                {poll.options.map((o) => {
                  const selected = my === o.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      disabled={!user || busy === o.id}
                      onClick={() => void vote(poll.id, o.id)}
                      className={`block w-full rounded-xl border px-3 py-2 text-left ${
                        selected
                          ? "border-[var(--team-accent)] bg-[var(--team-accent)]/15"
                          : "border-white/10 hover:bg-white/5"
                      } disabled:opacity-80`}
                    >
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold">
                          {o.label}
                          {selected ? " · il tuo voto" : ""}
                        </span>
                        <span className="opacity-60">{o.votes}</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full bg-[var(--team-accent)]"
                          style={{ width: `${Math.round(((o.votes || 0) / total) * 100)}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </SoftCard>
          );
        })}
      </SectionPage>
    </AppShell>
  );
}
