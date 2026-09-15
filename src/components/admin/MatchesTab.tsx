"use client";
import type { MatchKind, TeamData } from "@/lib/types";
import { Field } from "@/components/admin/AdminFields";
import CalendarGallery from "@/components/CalendarGallery";
import { MATCH_KIND_META, MATCH_KINDS, applyMatchKind, createMatch, getMatchKind } from "@/lib/match-kind";
import { resolveTeamLogo, setTeamLogo } from "@/lib/club-teams";
import LogoPicker from "@/components/LogoPicker";
import ColorSwatch from "@/components/ColorSwatch";
import { defaultEventColor, hexAlpha } from "@/lib/event-color";
import EventsTab from "@/components/admin/EventsTab";

export function MatchesTab({
  draft,
  setDraft,
  onUpload,
}: {
  draft: TeamData;
  setDraft: (d: TeamData) => void;
  onUpload: (f: File, cb: (url: string) => void) => void;
}) {
  const addMatch = (kind: MatchKind) => {
    setDraft({ ...draft, matches: [...draft.matches, createMatch(kind)] });
  };
  const updateMatch = (idx: number, patch: Partial<(typeof draft.matches)[0]>) => {
    const matches = [...draft.matches];
    matches[idx] = { ...matches[idx], ...patch };
    setDraft({ ...draft, matches });
  };
  const removeMatch = (idx: number) => {
    setDraft({ ...draft, matches: draft.matches.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-8">
      <CalendarGallery draft={draft} setDraft={setDraft} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">Gestione partite</h2>
          <p className="mt-1 text-sm opacity-60">Tocca un tipo per ogni voce: partita, allenamento o amichevole.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => addMatch("partita")} className="btn-add">+ Partita</button>
          <button type="button" onClick={() => addMatch("allenamento")} className="btn-add">+ Allenamento</button>
          <button type="button" onClick={() => addMatch("amichevole")} className="btn-add">+ Amichevole</button>
        </div>
      </div>
      {draft.matches.map((m, i) => {
        const kind = getMatchKind(m);
        const accent = m.color || MATCH_KIND_META[kind].color;
        return (
          <div key={m.id} className="relative overflow-hidden rounded-xl border p-4 pl-5" style={{ borderColor: hexAlpha(accent, 0.4) }}>
            <span className="absolute inset-y-0 left-0 w-1.5" style={{ background: accent }} aria-hidden />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {MATCH_KINDS.map((option) => {
                const meta = MATCH_KIND_META[option];
                const selected = kind === option;
                return (
                  <button type="button" key={option} onClick={() => { if (kind !== option) updateMatch(i, applyMatchKind(m, option)); }} className={`rounded-xl border px-3 py-3 text-left transition ${
                    selected ? "border-[var(--team-accent)] bg-[var(--team-accent)]/18" : "border-white/10 bg-white/5"
                  }`} aria-pressed={selected}>
                    <p className="text-sm font-black tracking-tight">{meta.title}</p>
                    <p className="mt-1 text-[11px] leading-snug opacity-70">{meta.desc}</p>
                  </button>
                );
              })}
            </div>
            {kind === "amichevole" ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <Field label="Data"><input type="date" value={m.date.slice(0, 10)} onChange={(e) => updateMatch(i, { date: e.target.value })} className="input-field" /></Field>
                <Field label="Orario"><input type="time" value={m.time} onChange={(e) => updateMatch(i, { time: e.target.value })} className="input-field" /></Field>
                <Field label="Campo"><input value={m.location} onChange={(e) => updateMatch(i, { location: e.target.value })} className="input-field" /></Field>
                <Field label="Avversario"><input value={m.opponent} onChange={(e) => updateMatch(i, { opponent: e.target.value })} className="input-field" /></Field>
                {m.opponent.trim() ? (
                  <div className="md:col-span-2">
                    <Field label="Logo avversario">
                      <LogoPicker name={m.opponent} url={resolveTeamLogo(draft, m.opponent)} onChange={(url) => setDraft(setTeamLogo(draft, m.opponent, url))} onUpload={onUpload} />
                    </Field>
                  </div>
                ) : null}
              </div>
            ) : kind === "allenamento" ? (
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <Field label="Data"><input type="date" value={m.date.slice(0, 10)} onChange={(e) => updateMatch(i, { date: e.target.value })} className="input-field" /></Field>
                <Field label="Orario"><input type="time" value={m.time} onChange={(e) => updateMatch(i, { time: e.target.value })} className="input-field" /></Field>
                <Field label="Campo"><input value={m.location} onChange={(e) => updateMatch(i, { location: e.target.value })} className="input-field" /></Field>
                <Field label="Focus (opzionale)"><input value={m.note || ""} onChange={(e) => updateMatch(i, { note: e.target.value })} className="input-field" /></Field>
                <div className="md:col-span-2">
                  <Field label="Colore in calendario">
                    <ColorSwatch value={m.color || MATCH_KIND_META.allenamento.color} onChange={(color) => updateMatch(i, { color })} />
                  </Field>
                </div>
              </div>
            ) : (
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <Field label="Data"><input type="date" value={m.date.slice(0, 10)} onChange={(e) => updateMatch(i, { date: e.target.value })} className="input-field" /></Field>
                <Field label="Ora"><input type="time" value={m.time} onChange={(e) => updateMatch(i, { time: e.target.value })} className="input-field" /></Field>
                <Field label="Avversario"><input value={m.opponent} onChange={(e) => updateMatch(i, { opponent: e.target.value })} className="input-field" /></Field>
                {m.opponent.trim() ? (
                  <div className="md:col-span-3">
                    <Field label="Logo avversario">
                      <LogoPicker name={m.opponent} url={resolveTeamLogo(draft, m.opponent)} onChange={(url) => setDraft(setTeamLogo(draft, m.opponent, url))} onUpload={onUpload} />
                    </Field>
                  </div>
                ) : null}
                <Field label="Luogo"><input value={m.location} onChange={(e) => updateMatch(i, { location: e.target.value })} className="input-field" /></Field>
                <Field label="Competizione"><input value={m.competition} onChange={(e) => updateMatch(i, { competition: e.target.value })} className="input-field" /></Field>
                <Field label="Risultato (noi-loro)"><input value={m.result || ""} onChange={(e) => updateMatch(i, { result: e.target.value })} placeholder="Noi-loro, es. 2-1" className="input-field" /></Field>
                <Field label="Priorità">
                  <select value={m.priority || "media"} onChange={(e) => updateMatch(i, { priority: e.target.value as "alta" | "media" | "bassa" })} className="input-field">
                    <option value="alta">Alta</option>
                    <option value="media">Media</option>
                    <option value="bassa">Bassa</option>
                  </select>
                </Field>
                <Field label="Note partita"><input value={m.note || ""} onChange={(e) => updateMatch(i, { note: e.target.value })} className="input-field" /></Field>
                <Field label="Casa/Trasferta">
                  <select value={m.isHome ? "home" : "away"} onChange={(e) => updateMatch(i, { isHome: e.target.value === "home" })} className="input-field">
                    <option value="home">Casa</option>
                    <option value="away">Trasferta</option>
                  </select>
                </Field>
                <div className="md:col-span-3">
                  <Field label="Colore in calendario">
                    <ColorSwatch value={m.color || defaultEventColor("match")} onChange={(color) => updateMatch(i, { color })} />
                  </Field>
                </div>
                <Field label="Arbitro"><input value={m.referee || ""} onChange={(e) => updateMatch(i, { referee: e.target.value })} className="input-field" /></Field>
                <Field label="TV"><input value={m.tv || ""} onChange={(e) => updateMatch(i, { tv: e.target.value })} className="input-field" /></Field>
                <Field label="Meteo"><input value={m.weather || ""} onChange={(e) => updateMatch(i, { weather: e.target.value })} className="input-field" /></Field>
                <Field label="Preview"><input value={m.preview || ""} onChange={(e) => updateMatch(i, { preview: e.target.value })} className="input-field" /></Field>
                <Field label="Cronaca"><input value={m.report || ""} onChange={(e) => updateMatch(i, { report: e.target.value })} className="input-field" /></Field>
              </div>
            )}
            <button type="button" onClick={() => removeMatch(i)} className="mt-2 text-sm text-red-400 hover:underline">
              {kind === "allenamento" ? "Elimina allenamento" : kind === "amichevole" ? "Elimina amichevole" : "Elimina partita"}
            </button>
          </div>
        );
      })}
      <EventsTab draft={draft} setDraft={setDraft} />
    </div>
  );
}
