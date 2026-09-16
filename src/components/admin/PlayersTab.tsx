"use client";

import { useMemo, useState } from "react";
import type { PlayerStatus, TeamData } from "@/lib/types";
import { Field, ShirtNumberSelect, ImageUpload } from "@/components/admin/AdminFields";

export function PlayersTab({
  draft,
  setDraft,
  onUpload,
}: {
  draft: TeamData;
  setDraft: (d: TeamData) => void;
  onUpload: (f: File, cb: (url: string) => void) => void;
}) {
  const [selectedId, setSelectedId] = useState(draft.players[0]?.id || "");
  const [q, setQ] = useState("");

  const addPlayer = () => {
    const id = `p${Date.now()}`;
    setDraft({
      ...draft,
      players: [
        ...draft.players,
        {
          id,
          name: "Nuovo Giocatore",
          number: Math.min(100, draft.players.length + 1),
          position: "Ruolo",
          role: "CEN",
          birthDate: "2000-01-01",
          nationality: "Italia",
          photoUrl: "",
          stats: { goals: 0, assists: 0, appearances: 0 },
        },
      ],
    });
    setSelectedId(id);
    setQ("");
  };

  const idx = draft.players.findIndex((p) => p.id === selectedId);
  const p = idx >= 0 ? draft.players[idx] : null;

  const updatePlayer = (patch: Partial<(typeof draft.players)[0]>) => {
    if (idx < 0) return;
    const players = [...draft.players];
    players[idx] = { ...players[idx], ...patch };
    setDraft({ ...draft, players });
  };

  const removePlayer = () => {
    if (idx < 0) return;
    const players = draft.players.filter((_, i) => i !== idx);
    setDraft({ ...draft, players });
    setSelectedId(players[0]?.id || "");
  };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return draft.players;
    return draft.players.filter(
      (pl) =>
        pl.name.toLowerCase().includes(s) ||
        String(pl.number) === s ||
        (pl.position || "").toLowerCase().includes(s)
    );
  }, [draft.players, q]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Gestione Rosa</h2>
        <button type="button" onClick={addPlayer} className="btn-add">
          + Aggiungi Giocatore
        </button>
      </div>

      <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4">
        <label className="block space-y-1">
          <span className="text-sm font-bold text-amber-200">Capitano della squadra</span>
          <select
            value={draft.formation.captainId || ""}
            onChange={(e) =>
              setDraft({
                ...draft,
                formation: { ...draft.formation, captainId: e.target.value },
              })
            }
            className="input-field"
          >
            <option value="">Nessuno</option>
            {draft.players.map((pl) => (
              <option key={pl.id} value={pl.id}>
                {pl.number}. {pl.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="rounded-2xl border border-white/15 bg-white/5 p-4 space-y-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cerca in tendina..."
          className="input-field"
          type="search"
        />
        <label className="block space-y-1">
          <span className="text-xs font-medium opacity-70">Giocatore da modificare</span>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="input-field"
          >
            {filtered.length === 0 ? (
              <option value="">Nessun risultato</option>
            ) : (
              filtered.map((pl) => (
                <option key={pl.id} value={pl.id}>
                  {pl.number} · {pl.name || "Senza nome"} · {pl.role}
                </option>
              ))
            )}
          </select>
        </label>
        <p className="text-xs opacity-60">{draft.players.length} in rosa · se ne modifica uno alla volta</p>
      </div>

      {!p ? (
        <p className="text-sm opacity-60">Seleziona un giocatore o aggiungine uno nuovo.</p>
      ) : (
        <div className="rounded-xl border border-white/10 p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Nome">
              <input value={p.name} onChange={(e) => updatePlayer({ name: e.target.value })} className="input-field" />
            </Field>
            <Field label="Numero maglia (0–100)">
              <ShirtNumberSelect value={p.number} onChange={(number) => updatePlayer({ number })} />
            </Field>
            <Field label="Ruolo">
              <select value={p.role} onChange={(e) => updatePlayer({ role: e.target.value as "POR" | "DIF" | "CEN" | "ATT" })} className="input-field">
                <option value="POR">Portiere</option>
                <option value="DIF">Difensore</option>
                <option value="CEN">Centrocampista</option>
                <option value="ATT">Attaccante</option>
              </select>
            </Field>
            <Field label="Posizione">
              <input value={p.position} onChange={(e) => updatePlayer({ position: e.target.value })} className="input-field" />
            </Field>
            <Field label="Nazionalità">
              <input value={p.nationality} onChange={(e) => updatePlayer({ nationality: e.target.value })} className="input-field" />
            </Field>
            <Field label="Data di nascita">
              <input type="date" value={p.birthDate} onChange={(e) => updatePlayer({ birthDate: e.target.value })} className="input-field" />
            </Field>
            <Field label="Stato">
              <select value={p.status || "available"} onChange={(e) => updatePlayer({ status: e.target.value as PlayerStatus })} className="input-field">
                <option value="available">Disponibile</option>
                <option value="injured">Infortunato</option>
                <option value="suspended">Squalificato</option>
                <option value="unavailable">Indisponibile</option>
              </select>
            </Field>
            <Field label="Piede">
              <select value={p.foot || "destro"} onChange={(e) => updatePlayer({ foot: e.target.value as "destro" | "sinistro" | "ambidestro" })} className="input-field">
                <option value="destro">Destro</option>
                <option value="sinistro">Sinistro</option>
                <option value="ambidestro">Ambidestro</option>
              </select>
            </Field>
            <Field label="Altezza">
              <input value={p.height || ""} onChange={(e) => updatePlayer({ height: e.target.value })} className="input-field" />
            </Field>
            <Field label="Peso">
              <input value={p.weight || ""} onChange={(e) => updatePlayer({ weight: e.target.value })} className="input-field" />
            </Field>
            <Field label="Gialli">
              <input type="number" value={p.yellowCards || 0} onChange={(e) => updatePlayer({ yellowCards: parseInt(e.target.value) || 0 })} className="input-field" />
            </Field>
            <Field label="Rossi">
              <input type="number" value={p.redCards || 0} onChange={(e) => updatePlayer({ redCards: parseInt(e.target.value) || 0 })} className="input-field" />
            </Field>
            <Field label="Minuti">
              <input type="number" value={p.minutes || 0} onChange={(e) => updatePlayer({ minutes: parseInt(e.target.value) || 0 })} className="input-field" />
            </Field>
            <Field label="Bio">
              <input value={p.bio || ""} onChange={(e) => updatePlayer({ bio: e.target.value })} className="input-field" />
            </Field>
            <Field label="Gol">
              <input type="number" value={p.stats.goals} onChange={(e) => updatePlayer({ stats: { ...p.stats, goals: parseInt(e.target.value) || 0 } })} className="input-field" />
            </Field>
            <Field label="Assist">
              <input type="number" value={p.stats.assists} onChange={(e) => updatePlayer({ stats: { ...p.stats, assists: parseInt(e.target.value) || 0 } })} className="input-field" />
            </Field>
            <Field label="Presenze">
              <input type="number" value={p.stats.appearances} onChange={(e) => updatePlayer({ stats: { ...p.stats, appearances: parseInt(e.target.value) || 0 } })} className="input-field" />
            </Field>
          </div>
          <Field label="Foto">
            <ImageUpload
              current={p.photoUrl}
              onUpload={(f) => onUpload(f, (url) => updatePlayer({ photoUrl: url }))}
              onUrlApply={(url) => updatePlayer({ photoUrl: url })}
              onClear={() => updatePlayer({ photoUrl: "" })}
            />
          </Field>
          <button type="button" onClick={removePlayer} className="mt-2 text-sm text-red-400 hover:underline">
            Elimina questo giocatore
          </button>
        </div>
      )}
    </div>
  );
}
