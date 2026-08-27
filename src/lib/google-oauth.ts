import { createHmac, randomUUID } from "crypto";
import { findUserByEmail, findUserByGoogleId, upsertUser } from "./users";
import { createUserSession } from "./user-auth";
import { getRequestOrigin } from "./public-origin";
import { isValidPhone, normalizePhone } from "./phone";

export { getRequestOrigin };

export function googleConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim()
  );
}

function stateSecret() {
  return (
    process.env.JWT_SECRET ||
    process.env.GOOGLE_CLIENT_SECRET ||
    "mizzli-google-state"
  );
}

export function signGoogleState() {
  const body = Buffer.from(
    JSON.stringify({ n: randomUUID(), exp: Date.now() + 10 * 60 * 1000 })
  ).toString("base64url");
  const sig = createHmac("sha256", stateSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyGoogleState(state: string) {
  const [body, sig] = String(state || "").split(".");
  if (!body || !sig) return false;
  const expected = createHmac("sha256", stateSecret()).update(body).digest("base64url");
  if (expected !== sig) return false;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString()) as { exp?: number };
    return typeof data.exp === "number" && Date.now() < data.exp;
  } catch {
    return false;
  }
}

export function googleOAuthOrigin(request: Request) {
  const configured = (process.env.NEXT_PUBLIC_APP_URL || "").trim().replace(/\/$/, "");
  if (configured.startsWith("https://") || configured.startsWith("http://")) {
    return configured;
  }
  return getRequestOrigin(request);
}

export function googleRedirectUri(origin: string) {
  return `${origin.replace(/\/$/, "")}/api/auth/google/callback`;
}

const GOOGLE_BASE_SCOPES = ["openid", "email", "profile"];

export function googleScopes() {
  const extras = (process.env.GOOGLE_EXTRA_SCOPES || "")
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set([...GOOGLE_BASE_SCOPES, ...extras])];
}

export function googleAuthUrl(origin: string, state: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    redirect_uri: googleRedirectUri(origin),
    response_type: "code",
    scope: googleScopes().join(" "),
    prompt: "select_account",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

interface GoogleProfile {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}

export async function exchangeGoogleCode(code: string, origin: string) {
  const body = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
    redirect_uri: googleRedirectUri(origin),
    grant_type: "authorization_code",
  });

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!tokenRes.ok) {
    const details = await tokenRes.text();
    throw new Error(`Google ha rifiutato il codice di accesso: ${details}`);
  }
  const tokens = await tokenRes.json();
  const accessToken = tokens.access_token as string | undefined;
  if (!accessToken) throw new Error("Token Google mancante");

  const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!profileRes.ok) throw new Error("Impossibile leggere il profilo Google");
  const profile = (await profileRes.json()) as GoogleProfile;
  const wantsPhone = googleScopes().some((s) => s.includes("phonenumbers"));
  const phone = wantsPhone ? await fetchGooglePhone(accessToken) : "";
  return { profile, phone };
}

async function fetchGooglePhone(accessToken: string) {
  try {
    const res = await fetch(
      "https://people.googleapis.com/v1/people/me?personFields=phoneNumbers",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!res.ok) return "";
    const data = (await res.json()) as {
      phoneNumbers?: Array<{ canonicalForm?: string; value?: string; metadata?: { primary?: boolean } }>;
    };
    const nums = data.phoneNumbers || [];
    const primary = nums.find((n) => n.metadata?.primary) || nums[0];
    const raw = primary?.canonicalForm || primary?.value || "";
    return isValidPhone(raw) ? normalizePhone(raw) : "";
  } catch {
    return "";
  }
}

function isReservedClubIdentity(email: string, name?: string) {
  const local = email.split("@")[0]?.toLowerCase() || "";
  const n = (name || "").trim().toLowerCase();
  return local === "noldi" || n === "noldi";
}

export async function loginOrRegisterGoogle(profile: GoogleProfile, phone = "") {
  if (!profile.email) throw new Error("Google non ha fornito un'email");
  const email = profile.email.toLowerCase();
  if (isReservedClubIdentity(email, profile.name)) {
    throw new Error("Questo utente è riservato. Usa un altro account Google.");
  }

  let user =
    (await findUserByGoogleId(profile.sub)) || (await findUserByEmail(email));

  if (user) {
    user = {
      ...user,
      googleId: user.googleId || profile.sub,
      name: user.name || profile.name || email.split("@")[0],
      photoUrl: user.photoUrl || profile.picture || "",
      provider: user.passwordHash ? "both" : "google",
      phone: user.phone || phone || "",
      phoneVerified: user.phoneVerified || Boolean(phone),
      role: user.role || "fan",
    };
  } else {
    user = {
      id: randomUUID(),
      email,
      name: profile.name || email.split("@")[0],
      passwordHash: null,
      googleId: profile.sub,
      photoUrl: profile.picture || "",
      provider: "google",
      role: "fan",
      createdAt: new Date().toISOString(),
      phone: phone || "",
      phoneVerified: Boolean(phone),
    };
  }

  await upsertUser(user);
  return createUserSession(user);
}
