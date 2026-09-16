"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { ROLE_BLURBS, ROLE_LABELS } from "@/lib/roles";
import { ALL_GRANTS, normalizeGrants, type UserGrant } from "@/lib/permissions";
import type { PublicUser, UserRole } from "@/lib/types";

type ListedUser = PublicUser & { createdAt?: string; grants?: UserGrant[] };
type CustomRole = { id: string; name: string; grants: UserGrant[] };

const ROLES: UserRole[] = ["fan", "player", "coach", "assistant_coach", "team_manager"];
const CREATE_ROLES: UserRole[] = ["player", "coach", "assistant_coach", "team_manager"];

export default function UsersTab() {
  const [users, setUsers] = useState<ListedUser[]>([]);
  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("coach");
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleGrants, setNewRoleGrants] = useState<UserGrant[]>(["callups"]);

  const load = async () => {
    setError("");
    const [uRes, rRes] = await Promise.all([apiFetch("/api/users"), apiFetch("/api/custom-roles")]);
    const uData = await uRes.json().catch(() => ({}));
    const rData = await rRes.json().catch(() => ({}));
    if (!uRes.ok) {
      setError(uData.error || "Elenco utenti non disponibile");
      return;
    }
    setUsers(uData.users || []);
    setRoles(rData.roles || []);
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        ROLE_LABELS[u.role].toLowerCase().includes(q)
    );
  }, [users, query]);

  const patchUser = async (id: string, body: Record<string, unknown>) => {
    setSavingId(id);
    setError("");
    try {
      const res = await apiFetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Non aggiornato");
        return;
      }
      if (data.user) {
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data.user } : u)));
      }
    } finally {
      setSavingId("");
    }
  };

  const toggleGrant = (user: ListedUser, grant: UserGrant) => {
    const current = normalizeGrants(user.role, user.grants);
    const next = current.includes(grant) ? current.filter((g) => g !== grant) : [...current, grant];
    void patchUser(user.id, { grants: next });
  };

  const applyCustom = (user: ListedUser, custom: CustomRole) => {
    void patchUser(user.id, { grants: custom.grants });
  };

  const saveCustomRole = async () => {
    if (newRoleName.trim().length < 2) {
      setError("Dai un nome al ruolo personalizzato");
      return;
    }
    const res = await apiFetch("/api/custom-roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newRoleName.trim(), grants: newRoleGrants }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Ruolo non salvato");
      return;
    }
    setRoles(data.roles || []);
    setNewRoleName("");
    setNewRoleGrants(["callups"]);
  };

  const deleteCustomRole = async (id: string) => {
    const res = await apiFetch("/api/custom-roles", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setRoles(data.roles || []);
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const res = await apiFetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Account non creato");
        return;
      }
      setName("");
      setEmail("");
      setPassword("");
      setRole("coach");
      await load();
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--team-accent)]">Admin</p>
        <h2 className="text-2xl font-black">Gestione permessi</h2>
        <p className="mt-1 text-sm opacity-65">
          Crea ruoli con il nome che vuoi e applicali agli account. Admin Noldi puo tutto.
        </p>
      </div>

      <div className="space-y-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
        <h3 className="font-bold text-amber-200">Ruolo personalizzato</h3>
        <label className="block">
          <span className="text-xs opacity-70">Nome ruolo</span>
          <input
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            className="input-field mt-1"
            placeholder="es. Dirigente partite, Addetto social, Fisioterapista"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {ALL_GRANTS.map((g) => {
            const on = newRoleGrants.includes(g.id);
            return (
              <button
                key={g.id}
                type="button"
                onClick={() =>
                  setNewRoleGrants((prev) =>
                    on ? prev.filter((x) => x !== g.id) : [...prev, g.id]
                  )
                }
                className={`rounded-lg px-3 py-2 text-xs font-bold ${
                  on ? "bg-[var(--team-accent)] text-[var(--team-secondary)]" : "bg-white/10"
                }`}
              >
                {g.label.replace(" (inserire / svuotare)", "")}
              </button>
            );
          })}
        </div>
        <button type="button" onClick={() => void saveCustomRole()} className="btn-add">
          Salva ruolo
        </button>
        {roles.length > 0 && (
          <div className="space-y-2 pt-2">
            {roles.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-black/20 px-3 py-2">
                <div>
                  <p className="font-bold">{r.name}</p>
                  <p className="text-xs opacity-60">{r.grants.join(", ") || "nessun permesso"}</p>
                </div>
                <button type="button" onClick={() => void deleteCustomRole(r.id)} className="text-xs text-red-300">
                  Elimina
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={createUser} className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <h3 className="font-bold">Nuovo account</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="text-xs opacity-70">Nome</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-field mt-1" required />
          </label>
          <label className="block">
            <span className="text-xs opacity-70">Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field mt-1" required />
          </label>
          <label className="block">
            <span className="text-xs opacity-70">Password temporanea</span>
            <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field mt-1" minLength={8} required />
          </label>
          <label className="block">
            <span className="text-xs opacity-70">Ruolo di partenza</span>
            <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="input-field mt-1">
              {CREATE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="text-xs opacity-55">{ROLE_BLURBS[role]}</p>
        <button type="submit" disabled={creating} className="btn-add disabled:opacity-50">
          {creating ? "Creazione..." : "Crea account"}
        </button>
      </form>

      {error && <p className="text-sm text-red-300">{error}</p>}

      <input value={query} onChange={(e) => setQuery(e.target.value)} className="input-field" placeholder="Cerca account..." />

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[56rem] text-left text-sm">
          <thead className="bg-white/5 text-[11px] uppercase tracking-wide opacity-70">
            <tr>
              <th className="px-3 py-3">Account</th>
              <th className="px-3 py-3">Ruolo base</th>
              <th className="px-3 py-3">Applica personalizzato</th>
              {ALL_GRANTS.map((g) => (
                <th key={g.id} className="px-2 py-3 text-center">
                  {g.label.replace(" (inserire / svuotare)", "")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const grants = normalizeGrants(u.role, u.grants);
              return (
                <tr key={u.id} className="border-t border-white/10">
                  <td className="px-3 py-3">
                    <p className="font-bold">{u.name}</p>
                    <p className="text-xs opacity-50">{u.email}</p>
                  </td>
                  <td className="px-3 py-3">
                    <select
                      value={u.role}
                      disabled={savingId === u.id}
                      onChange={(e) => void patchUser(u.id, { role: e.target.value })}
                      className="input-field min-w-40"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <select
                      defaultValue=""
                      disabled={savingId === u.id || roles.length === 0}
                      onChange={(e) => {
                        const custom = roles.find((r) => r.id === e.target.value);
                        if (custom) applyCustom(u, custom);
                        e.currentTarget.value = "";
                      }}
                      className="input-field min-w-44"
                    >
                      <option value="">{roles.length ? "Scegli ruolo…" : "Nessun ruolo custom"}</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  {ALL_GRANTS.map((g) => {
                    const on = grants.includes(g.id);
                    return (
                      <td key={g.id} className="px-2 py-3 text-center">
                        <button
                          type="button"
                          disabled={savingId === u.id}
                          onClick={() => toggleGrant(u, g.id)}
                          className={`min-h-9 min-w-14 rounded-lg text-xs font-black ${
                            on ? "bg-[var(--team-accent)] text-[var(--team-secondary)]" : "bg-white/10 opacity-50"
                          }`}
                        >
                          {on ? "ON" : "OFF"}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && <p className="text-sm opacity-60">Nessun account in elenco.</p>}
    </div>
  );
}
