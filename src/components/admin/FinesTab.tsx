"use client";

import AdminField from "@/components/admin/AdminField";
import type { TeamData } from "@/lib/types";

export default function FinesTab({
  draft,
  setDraft,
}: {
  draft: TeamData;
  setDraft: (d: TeamData) => void;
}) {
  const fines = draft.club.fines || [];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Multe</h2>
          <p className="mt-1 text-sm opacity-60">
            Solo team manager e admin. I tifosi non vedono questo elenco.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setDraft({
              ...draft,
              club: {
                ...draft.club,
                fines: [
                  ...fines,
                  {
                    id: `fn${Date.now()}`,
                    playerName: "",
                    reason: "Ritardo",
                    amount: "10€",
                    paid: false,
                  },
                ],
              },
            })
          }
          className="btn-add"
        >
          + Multa
        </button>
      </div>
      {fines.length === 0 && (
        <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-sm opacity-60">
          Nessuna multa in elenco.
        </p>
      )}
      {fines.map((fine, i) => (
        <div key={fine.id} className="grid gap-3 rounded-xl border border-white/10 p-4 md:grid-cols-2">
          <AdminField label="Giocatore">
            <input
              value={fine.playerName}
              onChange={(e) => {
                const next = [...fines];
                next[i] = { ...next[i], playerName: e.target.value };
                setDraft({ ...draft, club: { ...draft.club, fines: next } });
              }}
              className="input-field"
              placeholder="Nome"
            />
          </AdminField>
          <AdminField label="Importo">
            <input
              value={fine.amount}
              onChange={(e) => {
                const next = [...fines];
                next[i] = { ...next[i], amount: e.target.value };
                setDraft({ ...draft, club: { ...draft.club, fines: next } });
              }}
              className="input-field"
              placeholder="10€"
            />
          </AdminField>
          <AdminField label="Motivo">
            <input
              value={fine.reason}
              onChange={(e) => {
                const next = [...fines];
                next[i] = { ...next[i], reason: e.target.value };
                setDraft({ ...draft, club: { ...draft.club, fines: next } });
              }}
              className="input-field"
            />
          </AdminField>
          <AdminField label="Stato">
            <select
              value={fine.paid ? "paid" : "open"}
              onChange={(e) => {
                const next = [...fines];
                next[i] = { ...next[i], paid: e.target.value === "paid" };
                setDraft({ ...draft, club: { ...draft.club, fines: next } });
              }}
              className="input-field"
            >
              <option value="open">Da pagare</option>
              <option value="paid">Pagata</option>
            </select>
          </AdminField>
          <button
            type="button"
            onClick={() =>
              setDraft({
                ...draft,
                club: {
                  ...draft.club,
                  fines: fines.filter((_, idx) => idx !== i),
                },
              })
            }
            className="text-sm text-red-400 hover:underline md:col-span-2"
          >
            Elimina multa
          </button>
        </div>
      ))}
    </div>
  );
}
