"use client";

import type { ClubInfo, TeamData } from "@/lib/types";
import { CALLUP_VISIBLE_DAYS, publishCallups } from "@/lib/club";

export default function ClubTab({
  draft,
  setDraft,
  limited = false,
}: {
  draft: TeamData;
  setDraft: (d: TeamData) => void;
  limited?: boolean;
}) {
  const info = draft.club.info;
  const patchInfo = (patch: Partial<ClubInfo>) =>
    setDraft({ ...draft, club: { ...draft.club, info: { ...info, ...patch } } });

  const fields: Array<[keyof ClubInfo, string]> = [
    ["founded", "Anno fondazione"],
    ["city", "Città"],
    ["address", "Indirizzo"],
    ["stadiumCapacity", "Capienza stadio"],
    ["president", "Presidente"],
    ["sportingDirector", "Direttore sportivo"],
    ["whatsapp", "WhatsApp (numero pubblico)"],
    ["mapsUrl", "Link Google Maps"],
    ["ticketUrl", "Link biglietti"],
    ["liveStreamUrl", "Streaming"],
    ["radioUrl", "Radio"],
    ["youtubeUrl", "YouTube"],
    ["facebookUrl", "Facebook"],
    ["tiktokUrl", "TikTok"],
    ["shopUrl", "Shop"],
    ["mascot", "Mascotte"],
    ["openingHours", "Orari segreteria"],
    ["ticketPrices", "Prezzi biglietti"],
    ["pressEmail", "Email stampa"],
    ["alertBanner", "Banner alert in Home"],
    ["parking", "Parcheggio"],
    ["transport", "Come arrivare"],
    ["hospitality", "Hospitality"],
    ["disabledAccess", "Accessibilità"],
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">{limited ? "Convocati e raduno" : "Club e stadio"}</h2>
      {!limited && (
        <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm opacity-70">
          La cronaca della partita si gestisce nella tab <strong>Live</strong>: gol, cartellini e cambi si pubblicano subito.
        </p>
      )}
      {!limited && <div className="grid gap-3 md:grid-cols-2">
        {fields.map(([key, label]) => (
          <label key={key} className="block space-y-1">
            <span className="text-xs opacity-70">{label}</span>
            <input
              value={String(info[key] || "")}
              onChange={(e) => patchInfo({ [key]: e.target.value } as Partial<ClubInfo>)}
              className="input-field"
            />
          </label>
        ))}
      </div>}
      {!limited && <label className="block space-y-1">
        <span className="text-xs opacity-70">Storia</span>
        <textarea
          value={info.history}
          onChange={(e) => patchInfo({ history: e.target.value })}
          className="input-field min-h-24"
        />
      </label>}
      {!limited && <label className="block space-y-1">
        <span className="text-xs opacity-70">Inno</span>
        <textarea
          value={info.anthem}
          onChange={(e) => patchInfo({ anthem: e.target.value })}
          className="input-field min-h-16"
        />
      </label>}
      <div>
        <h3 className="mb-2 font-semibold">Convocati prossima gara</h3>
        <p className="mb-2 text-sm opacity-60">
          Meglio selezionarli in Convocati: la tabella si riempie da sola e resta in Home per {CALLUP_VISIBLE_DAYS} giorni.
        </p>
        <input
          value={draft.club.callupMeeting}
          onChange={(e) =>
            setDraft({ ...draft, club: { ...draft.club, callupMeeting: e.target.value } })
          }
          className="input-field mb-2"
          placeholder="Raduno"
        />
        <textarea
          value={draft.club.callupNote}
          onChange={(e) =>
            setDraft({ ...draft, club: { ...draft.club, callupNote: e.target.value } })
          }
          className="input-field mb-3 min-h-16"
        />
        <div className="grid max-h-64 gap-2 overflow-auto sm:grid-cols-2">
          {draft.players.map((p) => {
            const on = draft.club.callupPlayerIds.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  const ids = on
                    ? draft.club.callupPlayerIds.filter((id) => id !== p.id)
                    : [...draft.club.callupPlayerIds, p.id];
                  setDraft({
                    ...draft,
                    club: { ...draft.club, ...publishCallups(ids) },
                  });
                }}
                className={`rounded-xl border px-3 py-2 text-left text-sm ${
                  on ? "border-[var(--team-accent)] bg-[var(--team-accent)]/10" : "border-white/10"
                }`}
              >
                {p.number}. {p.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
