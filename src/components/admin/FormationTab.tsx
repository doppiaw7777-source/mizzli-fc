"use client";
import type { TeamData } from "@/lib/types";
import { Field } from "@/components/admin/AdminFields";
import FormationEditor from "@/components/FormationEditor";
import { PlayerKit } from "@/components/PlayerKit";
import { FORMATION_PRESETS, FORMATION_SCHEMES } from "@/lib/formation-presets";

export function FormationTab({
  draft,
  setDraft,
}: {
  draft: TeamData;
  setDraft: (d: TeamData) => void;
}) {
  const f = draft.formation;
  const updateFormation = (patch: Partial<typeof f>) => {
    setDraft({ ...draft, formation: { ...f, ...patch } });
  };
  const applyPreset = (scheme: string) => {
    const positions = FORMATION_PRESETS[scheme];
    if (!positions) {
      updateFormation({ scheme });
      return;
    }
    const starters = f.starters.slice(0, 11).map((slot, i) => ({
      ...slot,
      x: positions[i]?.x ?? slot.x,
      y: positions[i]?.y ?? slot.y,
    }));
    updateFormation({ scheme, starters });
  };
  const toggleStarter = (playerId: string) => {
    const isStarter = f.starters.some((s) => s.playerId === playerId);
    const isBench = f.bench.includes(playerId);
    if (isStarter) {
      setDraft({
        ...draft,
        formation: {
          ...f,
          starters: f.starters.filter((s) => s.playerId !== playerId),
          bench: [...f.bench, playerId],
        },
      });
    } else if (isBench) {
      setDraft({
        ...draft,
        formation: {
          ...f,
          bench: f.bench.filter((id) => id !== playerId),
          starters: [...f.starters, { playerId, x: 50, y: 50 }],
        },
      });
    } else if (f.starters.length < 11) {
      setDraft({
        ...draft,
        formation: { ...f, starters: [...f.starters, { playerId, x: 50, y: 50 }] },
      });
    }
  };
  const updatePosition = (playerId: string, x: number, y: number) => {
    setDraft({
      ...draft,
      formation: {
        ...f,
        starters: f.starters.map((s) => (s.playerId === playerId ? { ...s, x, y } : s)),
      },
    });
  };
  const starterIds = new Set(f.starters.map((s) => s.playerId));
  const benchIds = new Set(f.bench);
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Formazione Ufficiale</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Modulo">
          <select value={f.scheme} onChange={(e) => applyPreset(e.target.value)} className="input-field">
            {FORMATION_SCHEMES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Colore campo 1">
          <input type="color" value={f.pitchColor || "#1a7a3a"} onChange={(e) => updateFormation({ pitchColor: e.target.value })} className="h-10 w-full" />
        </Field>
        <Field label="Colore campo 2">
          <input type="color" value={f.pitchColor2 || "#0d5c28"} onChange={(e) => updateFormation({ pitchColor2: e.target.value })} className="h-10 w-full" />
        </Field>
        <Field label="Capitano">
          <select value={f.captainId || ""} onChange={(e) => updateFormation({ captainId: e.target.value })} className="input-field">
            <option value="">Nessuno</option>
            {draft.players.map((p) => (
              <option key={p.id} value={p.id}>{p.number}. {p.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Nota formazione (visibile a tutti)">
          <input value={f.note || ""} onChange={(e) => updateFormation({ note: e.target.value })} className="input-field" placeholder="es. Pressing alto, palla a terra" />
        </Field>
      </div>
      <p className="rounded-xl bg-white/5 px-4 py-3 text-sm opacity-80">Solo gli amministratori possono modificare la formazione. La pagina pubblica è in sola lettura.</p>
      <div className="flex flex-wrap gap-2">
        {FORMATION_SCHEMES.map((scheme) => (
          <button key={scheme} type="button" onClick={() => applyPreset(scheme)} className="rounded-lg bg-white/10 px-3 py-2 text-xs">Preset {scheme}</button>
        ))}
      </div>
      <FormationEditor formation={f} players={draft.players} onUpdateSlot={updatePosition} settings={draft.settings} graphicId={draft.settings.ui.playerGraphicId} />
      <p className="text-sm opacity-70">Clicca sui giocatori sotto per titolari/panchina. Titolari: {f.starters.length}/11</p>
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
        {draft.players.map((p) => {
          const isStarter = starterIds.has(p.id);
          const isBench = benchIds.has(p.id);
          return (
            <button key={p.id} type="button" onClick={() => toggleStarter(p.id)} className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
              isStarter ? "border-[var(--team-accent)] bg-[var(--team-accent)]/10" : isBench ? "border-white/20 bg-white/5" : "border-white/10 opacity-50"
            }`}>
              <PlayerKit player={p} size="xs" animate={false} graphicId={draft.settings.ui.playerGraphicId} />
              <span className="min-w-0">
                <span className="block font-bold"><span className="font-black text-[var(--team-accent)]">{p.number}</span> {p.name}</span>
                <span className="text-xs opacity-60">{isStarter ? "TITOLARE" : isBench ? "PANCHINA" : "—"}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
