"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { NotifyToggle } from "@/components/NotifyCenter";
import { apiFetch } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import { useTeam } from "@/context/TeamContext";
import { canAccessStaff } from "@/lib/roles";

type Notice = {
  id: string;
  title: string;
  body: string;
  href: string;
  createdAt: string;
};

export default function AvvisiPage() {
  const { user } = useUser();
  const { isAdmin } = useTeam();
  const canSend = isAdmin || canAccessStaff(user);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await apiFetch("/api/notices");
    const data = await res.json().catch(() => ({ notices: [] }));
    setNotices(data.notices || []);
  };

  useEffect(() => {
    void load();
  }, []);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await apiFetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, href: "/" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Avviso non inviato");
        return;
      }
      setTitle("");
      setBody("");
      await load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell page="home">
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <p className="page-kicker">Club</p>
          <h1 className="text-4xl font-black">Avvisi</h1>
          <p className="mt-2 text-sm opacity-70">
            Attiva le notifiche per ricevere convocati e comunicazioni sul telefono.
          </p>
        </div>
        <NotifyToggle />
        {canSend && (
          <form onSubmit={send} className="space-y-3 rounded-2xl border border-white/10 bg-[var(--team-card-bg)] p-4">
            <h2 className="font-bold">Invia un avviso</h2>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="Titolo" required />
            <textarea value={body} onChange={(e) => setBody(e.target.value)} className="input-field min-h-24" placeholder="Testo" />
            {error && <p className="text-sm text-red-300">{error}</p>}
            <button type="submit" disabled={saving} className="btn-add disabled:opacity-50">
              {saving ? "Invio..." : "Invia a tutti"}
            </button>
          </form>
        )}
        <div className="space-y-3">
          {notices.length === 0 && <p className="text-sm opacity-60">Nessun avviso al momento.</p>}
          {notices.map((n) => (
            <a key={n.id} href={n.href || "/"} className="block rounded-2xl border border-white/10 bg-[var(--team-card-bg)] p-4">
              <p className="font-bold">{n.title}</p>
              {n.body && <p className="mt-1 text-sm opacity-70">{n.body}</p>}
              <p className="mt-2 text-xs opacity-40">{new Date(n.createdAt).toLocaleString("it-IT")}</p>
            </a>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
