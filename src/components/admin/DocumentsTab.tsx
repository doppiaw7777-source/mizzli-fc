"use client";

import AdminField from "@/components/admin/AdminField";
import type { TeamData } from "@/lib/types";

export default function DocumentsTab({
  draft,
  setDraft,
}: {
  draft: TeamData;
  setDraft: (d: TeamData) => void;
}) {
  const docs = draft.club.documents || [];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Documenti</h2>
          <p className="mt-1 text-sm opacity-60">
            Regolamento, codice etico e carte del club. I tifosi li leggono in Documenti.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setDraft({
              ...draft,
              club: {
                ...draft.club,
                documents: [
                  ...docs,
                  { id: `d${Date.now()}`, title: "Nuovo documento", url: "" },
                ],
              },
            })
          }
          className="btn-add"
        >
          + Documento
        </button>
      </div>
      {docs.length === 0 && (
        <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-sm opacity-60">
          Nessun documento. Aggiungine uno e incolla il link.
        </p>
      )}
      {docs.map((doc, i) => (
        <div key={doc.id} className="grid gap-3 rounded-xl border border-white/10 p-4 md:grid-cols-2">
          <AdminField label="Titolo">
            <input
              value={doc.title}
              onChange={(e) => {
                const documents = [...docs];
                documents[i] = { ...documents[i], title: e.target.value };
                setDraft({ ...draft, club: { ...draft.club, documents } });
              }}
              className="input-field"
            />
          </AdminField>
          <AdminField label="Link">
            <input
              value={doc.url}
              onChange={(e) => {
                const documents = [...docs];
                documents[i] = { ...documents[i], url: e.target.value };
                setDraft({ ...draft, club: { ...draft.club, documents } });
              }}
              className="input-field"
              placeholder="https://..."
            />
          </AdminField>
          <button
            type="button"
            onClick={() =>
              setDraft({
                ...draft,
                club: {
                  ...draft.club,
                  documents: docs.filter((_, idx) => idx !== i),
                },
              })
            }
            className="text-sm text-red-400 hover:underline md:col-span-2"
          >
            Elimina documento
          </button>
        </div>
      ))}
    </div>
  );
}
