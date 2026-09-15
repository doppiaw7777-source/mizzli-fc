"use client";
import type { TeamData } from "@/lib/types";
import { Field, ImageUpload } from "@/components/admin/AdminFields";

export function StaffTab({
  draft,
  setDraft,
  onUpload,
}: {
  draft: TeamData;
  setDraft: (d: TeamData) => void;
  onUpload: (f: File, cb: (url: string) => void) => void;
}) {
  const addStaff = () => {
    setDraft({
      ...draft,
      staff: [
        ...draft.staff,
        { id: `s${Date.now()}`, name: "Nuovo Staff", role: "Ruolo", photoUrl: "" },
      ],
    });
  };

  const updateStaff = (idx: number, patch: Partial<(typeof draft.staff)[0]>) => {
    const staff = [...draft.staff];
    staff[idx] = { ...staff[idx], ...patch };
    setDraft({ ...draft, staff });
  };

  const removeStaff = (idx: number) => {
    setDraft({ ...draft, staff: draft.staff.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Gestione Staff</h2>
        <button onClick={addStaff} className="btn-add">+ Aggiungi Staff</button>
      </div>
      {draft.staff.map((s, i) => (
        <div key={s.id} className="rounded-xl border border-white/10 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Nome">
              <input value={s.name} onChange={(e) => updateStaff(i, { name: e.target.value })} className="input-field" />
            </Field>
            <Field label="Ruolo">
              <input value={s.role} onChange={(e) => updateStaff(i, { role: e.target.value })} className="input-field" />
            </Field>
          </div>
          <Field label="Foto">
            <ImageUpload
              current={s.photoUrl}
              onUpload={(f) => onUpload(f, (url) => updateStaff(i, { photoUrl: url }))}
              onUrlApply={(url) => updateStaff(i, { photoUrl: url })}
              onClear={() => updateStaff(i, { photoUrl: "" })}
            />
          </Field>
          <button onClick={() => removeStaff(i)} className="mt-2 text-sm text-red-400 hover:underline">Elimina</button>
        </div>
      ))}
    </div>
  );
}
