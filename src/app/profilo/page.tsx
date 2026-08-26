"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { useUser } from "@/context/UserContext";
import { useTeam } from "@/context/TeamContext";
import { apiFetch } from "@/lib/api";
import { formatItPhone, normalizePhone } from "@/lib/phone";
import {
  ROLE_BLURBS,
  ROLE_LABELS,
  canAccessStaff,
  canEditLive,
  isFanRole,
  isTeamManagerRole,
} from "@/lib/roles";
import SmsCodeFields from "@/components/SmsCodeFields";
import { upcomingMatch } from "@/lib/club";

export default function ProfiloPage() {
  const { user, loading, logout, refreshUser } = useUser();
  const { data } = useTeam();
  const router = useRouter();
  const [draftPhone, setDraftPhone] = useState<string | undefined>(undefined);
  const [smsCode, setSmsCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/accedi");
  }, [loading, user, router]);

  const phone =
    draftPhone !== undefined
      ? draftPhone
      : formatItPhone(user?.phone) || user?.phone || "";

  if (loading || !user) {
    return (
      <AppShell page="home">
        <p className="text-center opacity-70">Caricamento profilo...</p>
      </AppShell>
    );
  }

  const savePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const current = normalizePhone(user.phone || "");
      const next = normalizePhone(phone);
      if (current && next === current && user.phoneVerified) {
        setMessage("Numero già confermato");
        return;
      }
      const res = await apiFetch("/api/auth/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, smsCode }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload.error || "Numero non aggiornato");
        return;
      }
      setDraftPhone(undefined);
      await refreshUser();
      setMessage("Numero salvato");
    } catch {
      setError("Connessione non riuscita. Riprova.");
    } finally {
      setSaving(false);
    }
  };

  const next = data ? upcomingMatch(data) : undefined;
  const fan = isFanRole(user.role);

  return (
    <AppShell page="home">
      <div className="mx-auto max-w-lg space-y-6">
        <div className="rounded-3xl border border-white/10 bg-[var(--team-card-bg)] p-8 text-center backdrop-blur-md">
          {user.photoUrl ? (
            <img
              src={user.photoUrl}
              alt={user.name}
              className="mx-auto h-20 w-20 rounded-full object-cover ring-2 ring-[var(--team-accent)]"
            />
          ) : (
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--team-primary)] text-3xl">
              👤
            </div>
          )}
          <h1 className="mt-4 text-2xl font-black">{user.name}</h1>
          <p className="opacity-70">{user.email}</p>
          <p className="mt-1 text-sm font-semibold text-[var(--team-accent)]">
            {formatItPhone(user.phone) || "Nessun numero associato"}
          </p>
          <p className="mt-2 text-xs uppercase tracking-wider opacity-50">
            Account {user.provider === "google" ? "Google" : user.provider === "both" ? "Email + Google" : "Email"}
          </p>
          <p className="mt-2 text-xs uppercase tracking-wider text-[var(--team-accent)]">
            Ruolo {ROLE_LABELS[user.role]}
          </p>
          <p className="mx-auto mt-3 max-w-sm text-sm opacity-70">{ROLE_BLURBS[user.role]}</p>
          <button
            type="button"
            onClick={async () => {
              await logout();
              router.push("/");
            }}
            className="mt-6 rounded-xl border border-white/20 px-5 py-2 text-sm"
          >
            Esci
          </button>
        </div>

        {fan && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href={next ? `/formazione?matchId=${encodeURIComponent(next.id)}` : "/formazione"}
              className="rounded-2xl border border-white/10 bg-[var(--team-card-bg)] p-4"
            >
              <p className="text-xs uppercase tracking-wider text-[var(--team-accent)]">Vota</p>
              <p className="mt-1 font-bold">Voti giocatori</p>
              <p className="mt-1 text-sm opacity-60">Da 1 a 10 sulla formazione</p>
            </Link>
            <Link href="/tifosi" className="rounded-2xl border border-white/10 bg-[var(--team-card-bg)] p-4">
              <p className="text-xs uppercase tracking-wider text-[var(--team-accent)]">Sondaggi</p>
              <p className="mt-1 font-bold">Curva e votazioni</p>
              <p className="mt-1 text-sm opacity-60">Scegli e leggi i risultati</p>
            </Link>
            <Link href="/calendario" className="rounded-2xl border border-white/10 bg-[var(--team-card-bg)] p-4">
              <p className="text-xs uppercase tracking-wider text-[var(--team-accent)]">Leggi</p>
              <p className="mt-1 font-bold">Calendario</p>
              <p className="mt-1 text-sm opacity-60">Partite, allenamenti, amichevoli</p>
            </Link>
            <Link href="/documenti" className="rounded-2xl border border-white/10 bg-[var(--team-card-bg)] p-4">
              <p className="text-xs uppercase tracking-wider text-[var(--team-accent)]">Leggi</p>
              <p className="mt-1 font-bold">Documenti</p>
              <p className="mt-1 text-sm opacity-60">Regolamento e carte del club</p>
            </Link>
          </div>
        )}

        {canAccessStaff(user) && (
          <div className="grid gap-3">
            <Link
              href="/staff"
              className="rounded-2xl bg-[var(--team-accent)] px-5 py-4 text-center font-bold text-[var(--team-secondary)]"
            >
              Apri area {ROLE_LABELS[user.role]}
            </Link>
            {canEditLive(user) && (
              <div className="grid gap-3 sm:grid-cols-3">
                <Link href="/staff" className="rounded-2xl border border-white/10 p-4 text-sm font-semibold">
                  🔴 Live
                </Link>
                <Link href="/formazione" className="rounded-2xl border border-white/10 p-4 text-sm font-semibold">
                  ⚽ Formazione
                </Link>
                <Link href="/convocati" className="rounded-2xl border border-white/10 p-4 text-sm font-semibold">
                  📋 Convocati
                </Link>
              </div>
            )}
            {isTeamManagerRole(user.role) && (
              <div className="grid gap-3 sm:grid-cols-3">
                <Link href="/staff" className="rounded-2xl border border-white/10 p-4 text-sm font-semibold">
                  💶 Multe
                </Link>
                <Link href="/documenti" className="rounded-2xl border border-white/10 p-4 text-sm font-semibold">
                  📄 Documenti
                </Link>
                <Link href="/calendario" className="rounded-2xl border border-white/10 p-4 text-sm font-semibold">
                  🎉 Eventi
                </Link>
              </div>
            )}
          </div>
        )}

        <form
          onSubmit={savePhone}
          className="rounded-3xl border border-white/10 bg-[var(--team-card-bg)] p-6 space-y-3"
        >
          <h2 className="text-lg font-bold">Numero di telefono</h2>
          <p className="text-xs opacity-60">
            Ti inviamo un SMS con un codice. Inseriscilo per confermare il numero.
          </p>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => {
              setDraftPhone(e.target.value);
              setSmsCode("");
            }}
            className="input-field"
            placeholder="+39 333 123 4567"
            required
          />
          <SmsCodeFields
            key={phone}
            phone={phone}
            purpose="update"
            code={smsCode}
            onCodeChange={setSmsCode}
          />
          {error && <p className="text-sm text-red-300">{error}</p>}
          {message && <p className="text-sm text-green-300">{message}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-[var(--team-accent)] py-3 font-bold text-[var(--team-secondary)] disabled:opacity-50"
          >
            {saving ? "Salvataggio..." : "Conferma numero"}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
