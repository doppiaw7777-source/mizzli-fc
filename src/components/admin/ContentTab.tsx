"use client";
import type { TeamData } from "@/lib/types";
import { Field } from "@/components/admin/AdminFields";
import SponsorEditor from "@/components/admin/SponsorEditor";
import { MAX_SPONSORS } from "@/lib/sponsors";
import SponsorBanner from "@/components/SponsorBanner";

export function ContentTab({
  draft,
  setDraft,
  onUpload,
}: {
  draft: TeamData;
  setDraft: (d: TeamData) => void;
  onUpload: (f: File, cb: (url: string) => void) => void;
}) {
  const updateAnn = (idx: number, patch: Partial<(typeof draft.announcements)[0]>) => {
    const announcements = [...draft.announcements];
    announcements[idx] = { ...announcements[idx], ...patch };
    setDraft({ ...draft, announcements });
  };
  const updateTraining = (idx: number, patch: Partial<(typeof draft.trainings)[0]>) => {
    const trainings = [...draft.trainings];
    trainings[idx] = { ...trainings[idx], ...patch };
    setDraft({ ...draft, trainings });
  };
  const updateSponsor = (idx: number, patch: Partial<(typeof draft.sponsors)[0]>) => {
    const sponsors = [...draft.sponsors];
    sponsors[idx] = { ...sponsors[idx], ...patch };
    setDraft({ ...draft, sponsors });
  };
  const updateSocial = (idx: number, patch: Partial<(typeof draft.socialLinks)[0]>) => {
    const socialLinks = [...draft.socialLinks];
    socialLinks[idx] = { ...socialLinks[idx], ...patch };
    setDraft({ ...draft, socialLinks });
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold">News / Comunicazioni</h2>
          <button
            onClick={() =>
              setDraft({
                ...draft,
                announcements: [...draft.announcements, { id: `a${Date.now()}`, title: "Nuova comunicazione", description: "", pinned: false }],
              })
            }
            className="btn-add"
          >+ Aggiungi news</button>
        </div>
        <div className="space-y-3">
          {draft.announcements.map((a, i) => (
            <div key={a.id} className="rounded-xl border border-white/10 p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Titolo"><input value={a.title} onChange={(e) => updateAnn(i, { title: e.target.value })} className="input-field" /></Field>
                <Field label="In evidenza">
                  <select value={a.pinned ? "yes" : "no"} onChange={(e) => updateAnn(i, { pinned: e.target.value === "yes" })} className="input-field">
                    <option value="yes">Sì</option>
                    <option value="no">No</option>
                  </select>
                </Field>
              </div>
              <Field label="Descrizione"><textarea value={a.description} onChange={(e) => updateAnn(i, { description: e.target.value })} className="input-field min-h-20" /></Field>
              <button type="button" onClick={() => setDraft({ ...draft, announcements: draft.announcements.filter((_, idx) => idx !== i) })} className="mt-2 text-sm text-red-400 hover:underline">Elimina news</button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold">Allenamenti</h2>
          <button
            onClick={() =>
              setDraft({
                ...draft,
                trainings: [...draft.trainings, { id: `t${Date.now()}`, day: "Lunedì", time: "19:00", location: "Campo", focus: "Tecnica" }],
              })
            }
            className="btn-add"
          >+ Aggiungi allenamento</button>
        </div>
        <div className="space-y-3">
          {draft.trainings.map((t, i) => (
            <div key={t.id} className="grid gap-3 rounded-xl border border-white/10 p-4 md:grid-cols-4">
              <Field label="Giorno"><input value={t.day} onChange={(e) => updateTraining(i, { day: e.target.value })} className="input-field" /></Field>
              <Field label="Ora"><input value={t.time} onChange={(e) => updateTraining(i, { time: e.target.value })} className="input-field" /></Field>
              <Field label="Luogo"><input value={t.location} onChange={(e) => updateTraining(i, { location: e.target.value })} className="input-field" /></Field>
              <Field label="Focus"><input value={t.focus} onChange={(e) => updateTraining(i, { focus: e.target.value })} className="input-field" /></Field>
              <button type="button" onClick={() => setDraft({ ...draft, trainings: draft.trainings.filter((_, idx) => idx !== i) })} className="text-sm text-red-400 hover:underline md:col-span-4">Elimina allenamento</button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Banner sponsor in home</h2>
            <p className="mt-1 text-sm opacity-70">Massimo 5 sponsor. In home i loghi scorrono sempre, in evidenza in cima alla pagina.</p>
          </div>
          <button
            type="button"
            disabled={draft.sponsors.length >= MAX_SPONSORS}
            onClick={() => {
              if (draft.sponsors.length >= MAX_SPONSORS) return;
              setDraft({ ...draft, sponsors: [...draft.sponsors, { id: `sp${Date.now()}`, name: "", logoUrl: "", website: "" }] });
            }}
            className="btn-add min-h-11 disabled:cursor-not-allowed disabled:opacity-40"
          >{draft.sponsors.length >= MAX_SPONSORS ? "Massimo 5" : "+ Logo sponsor"}</button>
        </div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider opacity-50">{draft.sponsors.length}/{MAX_SPONSORS} sponsor</p>
        {draft.sponsors.some((sp) => sp.logoUrl || sp.name.trim()) ? (
          <div className="mb-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider opacity-50">Anteprima banner</p>
            <SponsorBanner sponsors={draft.sponsors} title={draft.settings.branding.sponsorsTitle || "Sponsor"} />
          </div>
        ) : null}
        <div className="mb-8 grid gap-4">
          {draft.sponsors.map((sp, i) => (
            <SponsorEditor
              key={sp.id}
              sponsor={sp}
              onChange={(patch) => updateSponsor(i, patch)}
              onUpload={onUpload}
              onRemove={() => setDraft({ ...draft, sponsors: draft.sponsors.filter((_, idx) => idx !== i) })}
            />
          ))}
        </div>
        <h2 className="mb-3 text-xl font-bold">Social</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Link social</h3>
            <button type="button" onClick={() => setDraft({ ...draft, socialLinks: [...draft.socialLinks, { id: `so${Date.now()}`, label: "Nuovo social", url: "" }] })} className="btn-add">+ Social</button>
          </div>
          {draft.socialLinks.map((sl, i) => (
            <div key={sl.id} className="rounded-xl border border-white/10 p-3">
              <Field label="Nome"><input value={sl.label} onChange={(e) => updateSocial(i, { label: e.target.value })} className="input-field" /></Field>
              <Field label="URL"><input value={sl.url} onChange={(e) => updateSocial(i, { url: e.target.value })} className="input-field" /></Field>
              <button type="button" onClick={() => setDraft({ ...draft, socialLinks: draft.socialLinks.filter((_, idx) => idx !== i) })} className="mt-2 text-sm text-red-400 hover:underline">Elimina social</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
