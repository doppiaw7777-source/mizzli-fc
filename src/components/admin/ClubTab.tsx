"use client";

import type { ClubInfo, GalleryItem, TeamData } from "@/lib/types";
import { CALLUP_VISIBLE_DAYS, publishCallups } from "@/lib/club";

export default function ClubTab({
  draft,
  setDraft,
  limited = false,
  onUpload,
}: {
  draft: TeamData;
  setDraft: (d: TeamData) => void;
  limited?: boolean;
  onUpload?: (file: File, callback: (url: string) => void) => void;
}) {
  const info = draft.club.info;
  const patchInfo = (patch: Partial<ClubInfo>) =>
    setDraft({ ...draft, club: { ...draft.club, info: { ...info, ...patch } } });
  const patchGallery = (index: number, patch: Partial<GalleryItem>) =>
    setDraft({
      ...draft,
      club: {
        ...draft.club,
        gallery: draft.club.gallery.map((item, i) => (i === index ? { ...item, ...patch } : item)),
      },
    });

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
      {!limited && (
        <div>
          <h3 className="mb-2 font-semibold">Galleria foto</h3>
          <p className="mb-3 text-sm opacity-60">
            Le foto si pubblicano da sole sul sito. Album e didascalia si possono scrivere dopo.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {draft.club.gallery.map((item, i) => (
              <div key={item.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                {item.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt="" className="mb-2 h-28 w-full rounded-lg object-cover" />
                ) : (
                  <div className="mb-2 flex h-28 items-center justify-center rounded-lg bg-white/5 text-3xl">
                    📷
                  </div>
                )}
                <input
                  value={item.album}
                  onChange={(e) => patchGallery(i, { album: e.target.value })}
                  className="input-field mb-2"
                  placeholder="Album"
                />
                <input
                  value={item.caption}
                  onChange={(e) => patchGallery(i, { caption: e.target.value })}
                  className="input-field mb-2"
                  placeholder="Didascalia"
                />
                {onUpload && (
                  <label className="mb-2 flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-white/25 py-2 text-sm">
                    Carica foto
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onUpload(file, (url) => patchGallery(i, { url }));
                        e.currentTarget.value = "";
                      }}
                    />
                  </label>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      club: {
                        ...draft.club,
                        gallery: draft.club.gallery.filter((_, idx) => idx !== i),
                      },
                    })
                  }
                  className="text-xs text-red-400"
                >
                  Rimuovi
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              const next: GalleryItem = {
                id: `g${Date.now()}`,
                url: "",
                caption: "",
                album: "Generale",
              };
              setDraft({
                ...draft,
                club: { ...draft.club, gallery: [...draft.club.gallery, next] },
              });
            }}
            className="mt-3 rounded-xl border border-white/20 px-4 py-2 text-sm"
          >
            + Aggiungi foto
          </button>
        </div>
      )}
    </div>
  );
}
