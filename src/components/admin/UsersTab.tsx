"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { ROLE_BLURBS, ROLE_LABELS } from "@/lib/roles";
import { ALL_GRANTS, normalizeGrants, type UserGrant } from "@/lib/permissions";
import type { PublicUser, UserRole } from "@/lib/types";

type ListedUser = PublicUser & { createdAt?: string; grants?: UserGrant[] };

const ROLES: UserRole[] = ["fan", "player", "coach", "assistant_coach", "team_manager"];
const CREATE_ROLES: UserRole[] = ["player", "coach", "assistant_coach", "team_manager"];

export default function UsersTab() {
  const [users, setUsers] = useState<ListedUser[]>([]);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("coach");

  const load = async () => {
    setError("");
    const res = await apiFetch("/api/users");
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Elenco utenti non disponibile");
      return;
    }
    setUsers(data.users || []);
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
        <h2 className="text-xl font-bold">Gestione permessi</h2>
        <p className="mt-1 text-sm opacity-60">
          Admin, Mister e Vice gestiscono i convocati. Qui scegli ruolo e concessioni per ogni account.
        </p>
      </div>

      <form onSubmit={createUser} className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <h3 className="font-bold">Crea account</h3>
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
            <span className="text-xs opacity-70">Ruolo</span>
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

      <label className="block">
        <span className="text-xs opacity-70">Cerca utente</span>
        <input value={query} onChange={(e) => setQuery(e.target.value)} className="input-field mt-1" placeholder="Nome, email o ruolo" />
      </label>

      <div className="space-y-3">
        {filtered.map((u) => {
          const grants = normalizeGrants(u.role, u.grants);
          return (
            <div key={u.id} className="space-y-3 rounded-xl border border-white/10 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-bold">{u.name}</p>
                  <p className="truncate text-sm opacity-60">{u.email}</p>
                </div>
                <label className="block sm:w-56">
                  <span className="text-xs opacity-70">Ruolo</span>
                  <select
                    value={u.role}
                    disabled={savingId === u.id}
                    onChange={(e) => void patchUser(u.id, { role: e.target.value })}
                    className="input-field mt-1"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {ALL_GRANTS.map((g) => {
                  const on = grants.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      type="button"
                      disabled={savingId === u.id}
                      onClick={() => toggleGrant(u, g.id)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                        on ? "bg-[var(--team-accent)] text-[var(--team-secondary)]" : "bg-white/10 opacity-70"
                      }`}
                    >
                      {g.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
