"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { ROLE_BLURBS, ROLE_LABELS } from "@/lib/roles";
import type { PublicUser, UserRole } from "@/lib/types";

type ListedUser = PublicUser & { createdAt?: string };

const ROLES: UserRole[] = ["fan", "player", "coach", "assistant_coach", "team_manager"];
const CREATE_ROLES: UserRole[] = ["player", "coach", "assistant_coach", "team_manager"];

const PERMISSIONS: { label: string; roles: Array<UserRole | "admin"> }[] = [
  { label: "Vedere il sito pubblico", roles: ["fan", "player", "coach", "assistant_coach", "team_manager", "admin"] },
  { label: "Votare e profilo tifoso", roles: ["fan", "player", "coach", "assistant_coach", "team_manager", "admin"] },
  { label: "Vedere convocati e formazione", roles: ["player", "coach", "assistant_coach", "team_manager", "admin"] },
  { label: "Modificare convocati / formazione / live", roles: ["coach", "assistant_coach", "admin"] },
  { label: "Modificare calendario partite", roles: ["coach", "assistant_coach", "admin"] },
  { label: "Multe e documenti", roles: ["team_manager", "admin"] },
  { label: "Eventi club", roles: ["coach", "assistant_coach", "team_manager", "admin"] },
  { label: "Pannello Admin (tutto il sito)", roles: ["admin"] },
];

function hasPerm(role: UserRole | "admin", item: (typeof PERMISSIONS)[number]) {
  return item.roles.includes(role);
}

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

  const setUserRole = async (id: string, next: UserRole) => {
    setSavingId(id);
    setError("");
    try {
      const res = await apiFetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Ruolo non aggiornato");
        return;
      }
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: next } : u)));
    } finally {
      setSavingId("");
    }
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
          Solo l&apos;admin Noldi con PIN vede il pannello Admin. Agli altri assegni un ruolo qui sotto.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wide opacity-60">
            <tr>
              <th className="px-3 py-2 font-medium">Permesso</th>
              <th className="px-2 py-2 font-medium">Tifoso</th>
              <th className="px-2 py-2 font-medium">Giocatore</th>
              <th className="px-2 py-2 font-medium">Mister</th>
              <th className="px-2 py-2 font-medium">Vice</th>
              <th className="px-2 py-2 font-medium">TM</th>
              <th className="px-2 py-2 font-medium">Admin</th>
            </tr>
          </thead>
          <tbody>
            {PERMISSIONS.map((item) => (
              <tr key={item.label} className="border-t border-white/10">
                <td className="px-3 py-2">{item.label}</td>
                {(["fan", "player", "coach", "assistant_coach", "team_manager", "admin"] as const).map((r) => (
                  <td key={r} className="px-2 py-2 text-center">
                    {hasPerm(r, item) ? "Sì" : "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={createUser} className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <h3 className="font-bold">Crea account con permessi</h3>
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
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input-field mt-1"
          placeholder="Nome, email o ruolo"
        />
      </label>

      {filtered.length === 0 && !error && (
        <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-sm opacity-60">
          Nessun account in elenco.
        </p>
      )}
      <div className="space-y-3">
        {filtered.map((u) => (
          <div
            key={u.id}
            className="flex flex-col gap-3 rounded-xl border border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="font-bold">{u.name}</p>
              <p className="truncate text-sm opacity-60">{u.email}</p>
              <p className="mt-1 text-xs opacity-50">{ROLE_BLURBS[u.role]}</p>
            </div>
            <label className="block sm:w-56">
              <span className="text-xs opacity-70">Permesso / ruolo</span>
              <select
                value={u.role}
                disabled={savingId === u.id}
                onChange={(e) => void setUserRole(u.id, e.target.value as UserRole)}
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
        ))}
      </div>
    </div>
  );
}
