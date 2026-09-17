"use client";
import type { TeamData } from "@/lib/types";
import { Field } from "@/components/admin/AdminFields";
import StandingsTeamsTable from "@/components/admin/StandingsTeamsTable";
import StandingsPhotoImport from "@/components/admin/StandingsPhotoImport";

export function StandingsTab({
  draft,
  setDraft,
  onUpload,
}: {
  draft: TeamData;
  setDraft: (d: TeamData) => void;
  onUpload: (f: File, cb: (url: string) => void) => void;
}) {
  const s = draft.standings;
  const updateMeta = (patch: Partial<typeof s>) => {
    setDraft({ ...draft, standings: { ...s, ...patch } });
  };
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold">Classifica stagione</h2>
      <p className="text-sm opacity-70">
        Modifica V, N, P, GF e GS. I punti e l&apos;ordine si calcolano da soli al salvataggio
        (punti, poi scontri diretti, poi gol fatti). Non si vede il calcolo, solo la tabella ordinata.
      </p>
      <StandingsPhotoImport draft={draft} setDraft={setDraft} />
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Titolo classifica">
          <input value={s.title} onChange={(e) => updateMeta({ title: e.target.value })} className="input-field" />
        </Field>
        <Field label="Stagione">
          <input value={s.season} onChange={(e) => updateMeta({ season: e.target.value })} className="input-field" />
        </Field>
      </div>
      <StandingsTeamsTable draft={draft} setDraft={setDraft} onUpload={onUpload} />
    </div>
  );
}
