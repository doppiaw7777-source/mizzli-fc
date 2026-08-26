"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { ROLE_LABELS } from "@/lib/roles";
import type { PublicUser, UserRole } from "@/lib/types";

type ListedUser = PublicUser & { createdAt?: string };

const ROLES: UserRole[] = ["fan", "coach", "assistant_coach", "team_manager"];

export default function UsersTab() {
  const [users, setUsers] = useState<ListedUser[]>([]);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");

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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial users fetch
    void load();
  }, []);

  const setRole = async (id: string, role: UserRole) => {
    setSavingId(id);
    setError("");
    try {
      const res = await apiFetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Ruolo non aggiornato");
        return;
      }
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    } finally {
      setSavingId("");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Utenti e ruoli</h2>
        <p className="mt-1 text-sm opacity-60">
          Tifoso vota e legge. Mister: formazione, convocati, live. Team manager: multe, documenti, eventi.
        </p>
      </div>
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
                onChange={(e) => void setRole(u.id, e.target.value as UserRole)}
                className="input-field mt-1"
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
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
