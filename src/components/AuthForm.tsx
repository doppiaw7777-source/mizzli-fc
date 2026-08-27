"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch, setStoredToken } from "@/lib/api";
import { collectClientSnapshot, startPreciseLocation } from "@/lib/client-session";
import { useUser } from "@/context/UserContext";
import SmsCodeFields from "@/components/SmsCodeFields";
import { postLoginPath } from "@/lib/roles";

function friendlyAuthError(raw: string) {
  const t = raw.toLowerCase();
  if (!t) return "";
  if (
    t.includes("redirect_uri") ||
    t.includes("rifiutato il codice") ||
    t.includes("mismatch") ||
    t.includes("invalid_client")
  ) {
    return "Google non accetta questo link. Usa email e password qui sotto.";
  }
  return raw;
}

function isAdminUsername(value: string) {
  return value.trim().toLowerCase() === "noldi";
}

async function snapshotForLogin() {
  try {
    return await Promise.race([
      collectClientSnapshot(0),
      new Promise<Record<string, never>>((resolve) =>
        setTimeout(() => resolve({}), 1200)
      ),
    ]);
  } catch {
    return {};
  }
}

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const { refreshUser, googleEnabled } = useUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState(friendlyAuthError(params.get("error") || ""));
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";
  const adminLogin = !isSignup && isAdminUsername(email);

  useEffect(() => {
    void startPreciseLocation();
  }, []);

  const googleButtonClass = `mt-6 flex w-full items-center justify-center gap-3 rounded-xl py-3 font-semibold transition ${
    googleEnabled
      ? "bg-white text-black hover:bg-white/90"
      : "bg-white/70 text-black/80"
  }`;

  const googleLabel = (
    <>
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      Continua con Google
    </>
  );

  async function loginAsAdmin(
    username: string,
    adminPass: string,
    adminPin: string,
    device: unknown
  ) {
    if (!adminPin.trim()) {
      setError("Inserisci anche il PIN admin");
      return;
    }
    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password: adminPass,
        pin: adminPin.trim(),
        device,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Accesso admin non riuscito");
      return;
    }
    if (data.token) setStoredToken(data.token);
    router.push("/admin");
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (isSignup && isAdminUsername(email)) {
      setError("Questo utente è riservato. Usa un'email.");
      setLoading(false);
      return;
    }
    if (isSignup && smsCode.replace(/\D/g, "").length !== 6) {
      setError("Inserisci il codice di 6 cifre ricevuto via SMS");
      setLoading(false);
      return;
    }
    const device = await snapshotForLogin();
    try {
      if (adminLogin) {
        await loginAsAdmin(email.trim(), password, pin, device);
        return;
      }

      const path = isSignup ? "/api/auth/register" : "/api/auth/user-login";
      const body = isSignup
        ? { name, email, password, phone, smsCode, device }
        : { email, password, device };
      const res = await apiFetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Operazione non riuscita");
        return;
      }
      await refreshUser();
      router.push(data.user ? postLoginPath(data.user) : "/profilo");
    } catch {
      setError("Connessione non riuscita. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-3xl border border-white/10 bg-[var(--team-card-bg)] p-8 backdrop-blur-md">
        <h1 className="text-center text-3xl font-black">
          {isSignup ? "Crea account" : "Accedi"}
        </h1>
        <p className="mt-2 text-center text-sm opacity-70">
          {googleEnabled
            ? isSignup
              ? "Registrati con email o Google"
              : "Entra con email o Google"
            : "Per ora usa email e password. Google si attiva con Client ID e Secret."}
        </p>

        {error && (
          <p className="mt-4 rounded-xl bg-red-500/15 px-3 py-2 text-center text-sm text-red-300">
            {error}
          </p>
        )}

        {googleEnabled ? (
          <a href="/api/auth/google" className={googleButtonClass}>
            {googleLabel}
          </a>
        ) : (
          <button
            type="button"
            onClick={() =>
              setError(
                "Google non è ancora collegato. Per ora usa email e password qui sotto."
              )
            }
            className={googleButtonClass}
          >
            {googleLabel}
          </button>
        )}
        {!googleEnabled && (
          <p className="mt-2 text-center text-xs opacity-60">
            Per ora usa email e password qui sotto. Google si accende quando inserisci Client ID e Secret.
          </p>
        )}


        <div className="my-5 flex items-center gap-3 text-xs opacity-50">
          <span className="h-px flex-1 bg-white/20" />
          oppure con email
          <span className="h-px flex-1 bg-white/20" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          {isSignup && (
            <div>
              <label className="mb-1 block text-xs opacity-70">Nome</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                autoComplete="name"
                required
              />
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs opacity-70">
              {isSignup ? "Email" : "Email o utente"}
            </label>
            <input
              type={isSignup ? "email" : "text"}
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              autoComplete={isSignup ? "email" : "username"}
              required
            />
          </div>
          {isSignup && (
            <div>
              <label className="mb-1 block text-xs opacity-70">Cellulare</label>
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field"
                autoComplete="tel"
                placeholder="+39 333 123 4567"
                required
              />
              <p className="mt-1 text-xs opacity-50">Ti arriva un SMS con un codice da inserire qui sotto.</p>
              <div className="mt-3">
                <SmsCodeFields
                  key={phone}
                  phone={phone}
                  email={email}
                  purpose="register"
                  code={smsCode}
                  onCodeChange={setSmsCode}
                />
              </div>
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs opacity-70">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              autoComplete={isSignup ? "new-password" : "current-password"}
              minLength={isSignup ? 8 : undefined}
              required
            />
            {isSignup && (
              <p className="mt-1 text-xs opacity-50">Minimo 8 caratteri, lettere e numeri</p>
            )}
          </div>
          {adminLogin && (
            <div>
              <label className="mb-1 block text-xs opacity-70">PIN Admin</label>
              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="input-field"
                autoComplete="one-time-code"
                required
              />
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[var(--team-accent)] py-3 font-bold text-[var(--team-secondary)] disabled:opacity-50"
          >
            {loading ? "Attendi..." : isSignup ? "Verifica e registrati" : "Accedi"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm opacity-70">
          {isSignup ? (
            <>
              Hai già un account?{" "}
              <Link href="/accedi" className="text-[var(--team-accent)]">
                Accedi
              </Link>
            </>
          ) : (
            <>
              Non hai un account?{" "}
              <Link href="/registrati" className="text-[var(--team-accent)]">
                Registrati
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
