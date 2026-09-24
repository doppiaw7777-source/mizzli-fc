"use client";

import { useState } from "react";
import LogoEditor from "@/components/LogoEditor";
import TeamBadge from "@/components/TeamBadge";
import {
  addLeagueTeam,
  isOurClub,
  removeLeagueTeam,
  resolveTeamLogo,
  setStandingRowLogo,
  setStandingTeamName,
} from "@/lib/club-teams";
import { straightenLogoFile } from "@/lib/logo-straighten";
import { standingGoalDiff, standingPoints } from "@/lib/standings";
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
  const [newName, setNewName] = useState("");
  const rows = draft.standings.rows.filter((row) => !/^allenamento$/i.test(row.name.trim()));

  const addTeam = () => {
    const name = newName.trim();
    if (!name) return;
    setDraft(addLeagueTeam(draft, name));
    setNewName("");
  };

  const removeTeam = (id: string, name: string, played: number) => {
    const label = name || "questa squadra";
    const msg =
      played > 0
        ? `"${label}" ha ${played} partite in classifica. Rimuoverla comunque? (potrai riaggiungerla dopo; i risultati nel calendario restano)`
        : `Rimuovere "${label}" dalla classifica?`;
    if (!window.confirm(msg)) return;
    setDraft(removeLeagueTeam(draft, id || name));
  };

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold">Squadre della classifica</h3>
          <p className="mt-1 text-sm opacity-70">
            Aggiungi o elimina squadre liberamente. Le squadre eliminate restano fuori dalla classifica
            finché non le riaggiungi. I numeri (PG, V, N, P, gol, punti) arrivano solo dalle partite
            concluse del calendario.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-2 rounded-2xl border border-white/10 bg-white/5 p-3">
        <label className="min-w-[12rem] flex-1 text-sm">
          <span className="mb-1 block opacity-60">Nuova squadra</span>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTeam();
              }
            }}
            placeholder="Es. Real Quezzi"
            className="input-field min-h-11 w-full"
          />
        </label>
        <button type="button" onClick={addTeam} className="btn-add min-h-11 px-4">
          + Aggiungi
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider opacity-50">
              <th className="px-3 py-3 font-medium">Logo</th>
              <th className="px-3 py-3 font-medium">Nome</th>
              <th className="px-2 py-3 text-center font-medium">PG</th>
              <th className="px-2 py-3 text-center font-medium">V</th>
              <th className="px-2 py-3 text-center font-medium">N</th>
              <th className="px-2 py-3 text-center font-medium">P</th>
              <th className="px-2 py-3 text-center font-medium">GF</th>
              <th className="px-2 py-3 text-center font-medium">GS</th>
              <th className="px-2 py-3 text-center font-medium">DR</th>
              <th className="px-3 py-3 text-right font-medium">Pt</th>
              <th className="px-3 py-3 font-medium"> </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const ours = row.isUs || isOurClub(draft, row.name);
              const logo = ours
                ? resolveTeamLogo(draft, row.name || draft.settings.teamName)
                : row.logoUrl || resolveTeamLogo(draft, row.name) || "";
              const diff = standingGoalDiff(row);
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
                  </td>
                  <td className="px-2 py-3 text-center opacity-80">{row.played}</td>
                  <td className="px-2 py-3 text-center opacity-80">{row.won}</td>
                  <td className="px-2 py-3 text-center opacity-80">{row.drawn}</td>
                  <td className="px-2 py-3 text-center opacity-80">{row.lost}</td>
                  <td className="px-2 py-3 text-center opacity-80">{row.goalsFor}</td>
                  <td className="px-2 py-3 text-center opacity-80">{row.goalsAgainst}</td>
                  <td className="px-2 py-3 text-center opacity-80">
                    {diff > 0 ? `+${diff}` : diff}
                  </td>
                  <td className="px-3 py-3 text-right font-black text-[var(--team-accent)]">
                    {standingPoints(row)}
                  </td>
                  <td className="px-3 py-3">
                    {!ours ? (
                      <button
                        type="button"
                        onClick={() => removeTeam(row.id, row.name, row.played || 0)}
                        className="min-h-11 rounded-lg px-2 text-xs font-semibold text-red-400 hover:bg-red-500/15 hover:underline"
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
