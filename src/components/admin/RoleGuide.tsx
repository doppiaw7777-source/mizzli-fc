"use client";

import { ALL_GRANTS, ROLE_SETUP } from "@/lib/permissions";

export default function RoleGuide() {
  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
      <div>
        <h3 className="font-bold">Come si configura</h3>
        <ol className="mt-2 list-decimal space-y-1 pl-5 opacity-80">
          <li>Scegli il ruolo base (tifoso, giocatore, mister, vice, team manager).</li>
          <li>Le spunte ON/OFF dicono cosa può fare quella persona, anche oltre il default.</li>
          <li>Oppure crea un ruolo personalizzato, salvalo e applicalo dalla colonna dedicata.</li>
          <li>Admin Noldi non sta in lista: può sempre tutto.</li>
        </ol>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {ROLE_SETUP.map((r) => (
          <div key={r.id} className="rounded-xl border border-white/10 p-3">
            <p className="font-bold">{r.label}</p>
            <p className="mt-1 text-xs opacity-70">{r.detail}</p>
          </div>
        ))}
      </div>
      <div>
        <h3 className="mb-2 font-bold">Cosa fa ogni concessione</h3>
        <div className="grid gap-2 md:grid-cols-2">
          {ALL_GRANTS.map((g) => (
            <div key={g.id} className="rounded-xl border border-white/10 p-3">
              <p className="font-bold">{g.label}</p>
              <p className="mt-1 text-xs opacity-70">{g.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
