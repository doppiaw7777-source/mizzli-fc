"use client";

import type { TeamData } from "@/lib/types";
import SettingsTabSlim from "@/components/admin/SettingsTab";

export function SettingsTab(props: {
  draft: TeamData;
  setDraft: (d: TeamData) => void;
  onUpload: (f: File, cb: (url: string) => void) => void;
}) {
  return <SettingsTabSlim {...props} />;
}

function Box({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-black">{title}</h2>
      {children || <p className="text-sm opacity-60">Sezione disponibile. I dati si modificano come prima dopo il prossimo aggiornamento completo.</p>}
    </div>
  );
}

export function PlayersTab({ draft }: { draft: TeamData; setDraft: (d: TeamData) => void; onUpload: (f: File, cb: (url: string) => void) => void }) {
  return <Box title="Rosa"><p className="text-sm opacity-70">{draft.players.length} giocatori. Modifica foto dalla pagina Rosa da loggato.</p></Box>;
}
export function StaffTab({ draft }: { draft: TeamData; setDraft: (d: TeamData) => void; onUpload: (f: File, cb: (url: string) => void) => void }) {
  return <Box title="Staff"><p className="text-sm opacity-70">{draft.staff.length} membri staff.</p></Box>;
}
export function MatchesTab({ draft }: { draft: TeamData; setDraft: (d: TeamData) => void; onUpload: (f: File, cb: (url: string) => void) => void }) {
  return <Box title="Calendario"><p className="text-sm opacity-70">{draft.matches.length} partite in archivio.</p></Box>;
}
export function FormationTab({ draft }: { draft: TeamData; setDraft: (d: TeamData) => void }) {
  return <Box title="Formazione"><p className="text-sm opacity-70">Modulo {draft.formation.scheme}.</p></Box>;
}
export function ContentTab({ draft }: { draft: TeamData; setDraft: (d: TeamData) => void; onUpload: (f: File, cb: (url: string) => void) => void }) {
  return <Box title="Contenuti"><p className="text-sm opacity-70">{draft.announcements.length} news · {draft.sponsors.length} sponsor.</p></Box>;
}
export function StandingsTab({ draft }: { draft: TeamData; setDraft: (d: TeamData) => void; onUpload: (f: File, cb: (url: string) => void) => void }) {
  return <Box title="Classifica"><p className="text-sm opacity-70">{draft.standings?.rows?.length || 0} squadre.</p></Box>;
}
