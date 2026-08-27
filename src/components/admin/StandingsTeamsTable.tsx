"use client";

import { useState } from "react";
import LogoEditor from "@/components/LogoEditor";
import TeamBadge from "@/components/TeamBadge";
import {
  isOurClub,
  resolveTeamLogo,
  setStandingRowLogo,
  setStandingTeamName,
} from "@/lib/club-teams";
import { straightenLogoFile } from "@/lib/logo-straighten";
import { standingPoints } from "@/lib/standings";
import type { TeamData } from "@/lib/types";

function LogoCell({
  name,
  url,
  gold,
  onUpload,
  onChange,
}: {
  name: string;
  url: string;
  gold?: boolean;
  onUpload: (file: File, cb: (url: string) => void) => void;
  onChange: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [editSrc, setEditSrc] = useState<string | null>(null);
  const [error, setError] = useState("");

  const assign = async (file?: File, closeEditor = false) => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const straight = await straightenLogoFile(file, name || "squadra");
      onUpload(straight, (next) => {
        setBusy(false);
        if (next) onChange(next);
        else setError("Upload non riuscito");
        if (closeEditor) {
          if (editSrc?.startsWith("blob:")) URL.revokeObjectURL(editSrc);
          setEditSrc(null);
        }
      });
    } catch {
      setBusy(false);
      setError("Non riesco a raddrizzare questo logo");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <TeamBadge name={name || "Squadra"} src={url} gold={gold} size={44} />
      <div className="min-w-0">
        <label className="inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-[var(--team-primary)] px-3 text-xs font-semibold">
          {busy ? "Raddrizzo..." : url ? "Cambia" : "Logo"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              void assign(e.target.files?.[0]);
              e.currentTarget.value = "";
            }}
          />
        </label>
        {url ? (
          <div className="mt-1 flex gap-2">
            <button type="button" className="text-[11px] opacity-70 underline" onClick={() => setEditSrc(url)}>
              Modifica
            </button>
            <button type="button" className="text-[11px] text-red-400 underline" onClick={() => onChange("")}>
              Togli
            </button>
          </div>
        ) : (
          <p className="mt-1 text-[10px] opacity-50">Si raddrizza da solo</p>
        )}
        {error ? <p className="mt-1 text-[11px] text-red-300">{error}</p> : null}
      </div>
      {editSrc ? (
        <LogoEditor
          src={editSrc}
          teamName={name || "Squadra"}
          onApply={(file) => void assign(file, true)}
          onCancel={() => {
            if (editSrc.startsWith("blob:")) URL.revokeObjectURL(editSrc);
            setEditSrc(null);
          }}
        />
      ) : null}
    </div>
  );
}

export default function StandingsTeamsTable({
  draft,
  setDraft,
  onUpload,
}: {
  draft: TeamData;
  setDraft: (d: TeamData) => void;
  onUpload: (file: File, cb: (url: string) => void) => void;
}) {
  const [nameDrafts, setNameDrafts] = useState<Record<string, string>>({});
  const rows = draft.standings.rows.filter((row) => !/^allenamento$/i.test(row.name.trim()));

  const addRow = () => {
    setDraft({
      ...draft,
      standings: {
        ...draft.standings,
        rows: [
          ...draft.standings.rows,
          {
            id: `st-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name: "",
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            isUs: false,
            logoUrl: "",
          },
        ],
      },
    });
  };

  const removeRow = (id: string) => {
    setDraft({
      ...draft,
      standings: {
        ...draft.standings,
        rows: draft.standings.rows.filter((row) => row.id !== id),
      },
    });
  };

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold">Squadre della classifica</h3>
          <p className="mt-1 text-sm opacity-70">
            Tabella a parte: associ il logo (per MIZZLI FC è d&apos;oro), si raddrizza da
            solo, poi scrivi il nome. Punti e partite arrivano dal calendario.
          </p>
        </div>
        <button type="button" onClick={addRow} className="btn-add min-h-11">
          + Aggiungi squadra
        </button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider opacity-50">
              <th className="px-3 py-3 font-medium">Logo</th>
              <th className="px-3 py-3 font-medium">Nome</th>
              <th className="px-2 py-3 text-center font-medium">PG</th>
              <th className="px-2 py-3 text-center font-medium">V</th>
              <th className="px-2 py-3 text-center font-medium">N</th>
              <th className="px-2 py-3 text-center font-medium">P</th>
              <th className="px-3 py-3 text-right font-medium">Pt</th>
              <th className="px-3 py-3 font-medium"> </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const ours = row.isUs || isOurClub(draft, row.name);
              const logo = ours
                ? resolveTeamLogo(draft, row.name || draft.settings.teamName)
                : row.logoUrl || "";
              return (
                <tr
                  key={row.id}
                  className={`border-t border-white/10 ${ours ? "bg-[var(--team-accent)]/10" : ""}`}
                >
                  <td className="px-3 py-3">
                    <LogoCell
                      name={row.name || (ours ? draft.settings.teamName : "")}
                      url={logo}
                      gold={ours}
                      onUpload={onUpload}
                      onChange={(url) => setDraft(setStandingRowLogo(draft, row.id, url))}
                    />
                  </td>
                  <td className="px-3 py-3">
                    {ours ? (
                      <p className="font-bold">{draft.settings.teamName}</p>
                    ) : (
                      <input
                        value={nameDrafts[row.id] ?? row.name}
                        onChange={(e) =>
                          setNameDrafts((current) => ({ ...current, [row.id]: e.target.value }))
                        }
                        onBlur={(e) => {
                          const next = e.target.value;
                          setNameDrafts((current) => {
                            const copy = { ...current };
                            delete copy[row.id];
                            return copy;
                          });
                          setDraft(setStandingTeamName(draft, row.id, next));
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                        }}
                        placeholder="Nome squadra"
                        className="input-field min-w-[10rem]"
                      />
                    )}
                    {ours ? (
                      <p className="mt-0.5 text-[11px] font-semibold text-[#d4af37]">Riquadro d&apos;oro</p>
                    ) : null}
                  </td>
                  <td className="px-2 py-3 text-center opacity-80">{row.played}</td>
                  <td className="px-2 py-3 text-center opacity-80">{row.won}</td>
                  <td className="px-2 py-3 text-center opacity-80">{row.drawn}</td>
                  <td className="px-2 py-3 text-center opacity-80">{row.lost}</td>
                  <td className="px-3 py-3 text-right font-black text-[var(--team-accent)]">
                    {standingPoints(row)}
                  </td>
                  <td className="px-3 py-3">
                    {!ours ? (
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        className="min-h-11 text-xs text-red-400 hover:underline"
                      >
                        Elimina
                      </button>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
