"use client";

import type { TeamData } from "@/lib/types";

export default function SettingsTab({
  draft,
  setDraft,
  onUpload,
}: {
  draft: TeamData;
  setDraft: (d: TeamData) => void;
  onUpload: (f: File, cb: (url: string) => void) => void;
}) {
  const s = draft.settings;
  const updateSettings = (patch: Partial<typeof s>) => {
    setDraft({ ...draft, settings: { ...s, ...patch } });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black">Impostazioni</h2>
        <p className="mt-1 text-sm opacity-55">Solo identità e logo. Il resto sta in Design.</p>
      </div>

      <label className="block space-y-1">
        <span className="text-xs opacity-70">Nome squadra</span>
        <input value={s.teamName} onChange={(e) => updateSettings({ teamName: e.target.value })} className="input-field" />
      </label>
      <label className="block space-y-1">
        <span className="text-xs opacity-70">Motto</span>
        <input value={s.motto} onChange={(e) => updateSettings({ motto: e.target.value })} className="input-field" />
      </label>

      <div className="flex items-center gap-4">
        {s.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.logoUrl} alt="" className="h-16 w-16 rounded-2xl bg-white/5 object-contain p-1" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-xl">🛡️</div>
        )}
        <label className="cursor-pointer rounded-xl border border-dashed border-white/25 px-4 py-2 text-sm">
          Cambia logo
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file, (url) => updateSettings({ logoUrl: url, appIconUrl: url }));
              e.currentTarget.value = "";
            }}
          />
        </label>
      </div>
    </div>
  );
}
