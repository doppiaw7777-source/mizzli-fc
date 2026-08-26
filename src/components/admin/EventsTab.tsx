"use client";

import ColorSwatch from "@/components/ColorSwatch";
import AdminField from "@/components/admin/AdminField";
import { todayKey } from "@/lib/dates";
import { defaultEventColor, hexAlpha } from "@/lib/event-color";
import type { TeamData } from "@/lib/types";

export default function EventsTab({
  draft,
  setDraft,
}: {
  draft: TeamData;
  setDraft: (d: TeamData) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Eventi in calendario</h2>
          <p className="mt-1 text-sm opacity-60">
            Open day, feste, riunioni: ogni evento ha il suo colore.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setDraft({
              ...draft,
              club: {
                ...draft.club,
                events: [
                  ...draft.club.events,
                  {
                    id: `e${Date.now()}`,
                    date: todayKey(),
                    title: "Nuovo evento",
                    place: "Campo",
                    text: "",
                    color: defaultEventColor("event"),
                  },
                ],
              },
            })
          }
          className="btn-add"
        >
          + Aggiungi evento
        </button>
      </div>
      {draft.club.events.map((ev, i) => (
        <div
          key={ev.id}
          className="relative overflow-hidden rounded-xl border p-4 pl-5"
          style={{
            borderColor: hexAlpha(ev.color || defaultEventColor("event"), 0.4),
          }}
        >
          <span
            className="absolute inset-y-0 left-0 w-1.5"
            style={{ background: ev.color || defaultEventColor("event") }}
            aria-hidden
          />
          <div className="grid gap-3 md:grid-cols-3">
            <AdminField label="Data">
              <input
                type="date"
                value={ev.date.slice(0, 10)}
                onChange={(e) => {
                  const events = [...draft.club.events];
                  events[i] = { ...events[i], date: e.target.value };
                  setDraft({ ...draft, club: { ...draft.club, events } });
                }}
                className="input-field"
              />
            </AdminField>
            <AdminField label="Titolo">
              <input
                value={ev.title}
                onChange={(e) => {
                  const events = [...draft.club.events];
                  events[i] = { ...events[i], title: e.target.value };
                  setDraft({ ...draft, club: { ...draft.club, events } });
                }}
                className="input-field"
              />
            </AdminField>
            <AdminField label="Luogo">
              <input
                value={ev.place}
                onChange={(e) => {
                  const events = [...draft.club.events];
                  events[i] = { ...events[i], place: e.target.value };
                  setDraft({ ...draft, club: { ...draft.club, events } });
                }}
                className="input-field"
              />
            </AdminField>
            <div className="md:col-span-3">
              <AdminField label="Testo">
                <input
                  value={ev.text}
                  onChange={(e) => {
                    const events = [...draft.club.events];
                    events[i] = { ...events[i], text: e.target.value };
                    setDraft({ ...draft, club: { ...draft.club, events } });
                  }}
                  className="input-field"
                />
              </AdminField>
            </div>
            <div className="md:col-span-3">
              <AdminField label="Colore in calendario">
                <ColorSwatch
                  value={ev.color || defaultEventColor("event")}
                  onChange={(color) => {
                    const events = [...draft.club.events];
                    events[i] = { ...events[i], color };
                    setDraft({ ...draft, club: { ...draft.club, events } });
                  }}
                />
              </AdminField>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              setDraft({
                ...draft,
                club: {
                  ...draft.club,
                  events: draft.club.events.filter((_, idx) => idx !== i),
                },
              })
            }
            className="mt-2 text-sm text-red-400 hover:underline"
          >
            Elimina evento
          </button>
        </div>
      ))}
    </div>
  );
}
