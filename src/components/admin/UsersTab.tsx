"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { ROLE_LABELS } from "@/lib/roles";
import type { PublicUser, UserRole } from "@/lib/types";

type ListedUser = PublicUser & { createdAt?: string };

const ROLES: UserRole[] = ["fan", "player", "coach", "assistant_coach", "team_manager"];
const CREATE_ROLES: UserRole[] = ["player", "coach", "assistant_coach", "team_manager"];

export default function UsersTab() {
  const [users, setUsers] = useState<ListedUser[]>([]);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");
  const [creating, setCreating] = useState(false);
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
        <h2 className="text-xl font-bold">Utenti e ruoli</h2>
        <p className="mt-1 text-sm opacity-60">
          Ospite: sito aperto. Tifoso: account normale. Giocatore: legge convocati.
          Allenatore e vice: convocazioni, formazione e calendario. Admin: tutto.
        </p>
      </div>

      <form onSubmit={createUser} className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <h3 className="font-bold">Crea account staff</h3>
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
        <button type="submit" disabled={creating} className="btn-add disabled:opacity-50">
          {creating ? "Creazione..." : "Crea account"}
        </button>
      </form>

      {error && <p className="text-sm text-red-300">{error}</p>}
      {users.length === 0 && !error && (
        <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-sm opacity-60">
          Nessun account registrato.
        </p>
      )}
      <div className="space-y-3">
        {users.map((u) => (
          <div
            key={u.id}
            className="flex flex-col gap-3 rounded-xl border border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="font-bold">{u.name}</p>
              <p className="truncate text-sm opacity-60">{u.email}</p>
            </div>
            <label className="block sm:w-56">
              <span className="text-xs opacity-70">Ruolo</span>
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
