import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import { randomUUID } from "crypto";
import type { AppUser, PublicUser } from "./types";
import { findUserByEmail, findUserById, findUserByPhone, toPublicUser, upsertUser } from "./users";
import { requestIsHttps as originIsHttps } from "./public-origin";
import { isValidPhone, normalizePhone } from "./phone";
import { consumePhoneCode } from "./phone-otp";
import { sessionCookieOptions } from "./auth-cookies";

export const USER_COOKIE = "squadra_user_session";
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "squadra-calcio-secret-key-noldi-2026"
);

export function userSessionCookieOptions(secure: boolean, request?: Request) {
  return sessionCookieOptions(secure, request);
}

export function requestIsHttps(request?: Request) {
  if (request) return originIsHttps(request);
  return process.env.NODE_ENV === "production";
}

export function applyUserSessionCookie(
  response: { cookies: { set: (name: string, value: string, options: object) => void } },
  token: string,
  request?: Request
) {
  response.cookies.set(
    USER_COOKIE,
    token,
    userSessionCookieOptions(requestIsHttps(request), request)
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string) {
  return EMAIL_RE.test(email.trim().toLowerCase());
}

export function validatePassword(password: string) {
  if (password.length < 8) return "La password deve avere almeno 8 caratteri";
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "La password deve contenere lettere e numeri";
  }
  return null;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function signUserToken(user: PublicUser) {
  return new SignJWT({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(JWT_SECRET);
}

async function verifyUserToken(token: string): Promise<PublicUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (typeof payload.userId !== "string") return null;
    const user = await findUserById(payload.userId);
    return user ? toPublicUser(user) : null;
  } catch {
    return null;
  }
}

export async function createUserSession(user: AppUser, request?: Request) {
  const publicUser = toPublicUser(user);
  const token = await signUserToken(publicUser);
  const cookieStore = await cookies();
  const headerStore = await headers();
  cookieStore.set(
    USER_COOKIE,
    token,
    userSessionCookieOptions(requestIsHttps(request) || originIsHttps(undefined, headerStore), request)
  );
  return { token, user: publicUser };
}

export async function destroyUserSession() {
  const cookieStore = await cookies();
  cookieStore.delete(USER_COOKIE);
}

export async function getUserSession(): Promise<PublicUser | null> {
  const headerStore = await headers();
  const auth = headerStore.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    const fromHeader = await verifyUserToken(auth.slice(7));
    if (fromHeader) return fromHeader;
  }
  const cookieStore = await cookies();
  const token = cookieStore.get(USER_COOKIE)?.value;
  if (!token) return null;
  return verifyUserToken(token);
}

export async function registerWithEmail(
  name: string,
  email: string,
  password: string,
  phone = "",
  smsCode = ""
) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();
  const cleanPhone = phone.trim();
  if (cleanName.length < 2) throw new Error("Inserisci il tuo nome");
  if (
    cleanName.toLowerCase() === "noldi" ||
    cleanEmail === "noldi" ||
    cleanEmail.split("@")[0] === "noldi"
  ) {
    throw new Error("Questo utente è riservato. Usa un'email.");
  }
  if (!isValidEmail(cleanEmail)) throw new Error("Email non valida");
  if (!isValidPhone(cleanPhone)) throw new Error("Inserisci un numero di cellulare valido");
  const pwdError = validatePassword(password);
  if (pwdError) throw new Error(pwdError);

  const existing = await findUserByEmail(cleanEmail);
  if (existing) throw new Error("Questa email è già registrata. Accedi.");
  const taken = await findUserByPhone(normalizePhone(cleanPhone));
  if (taken) throw new Error("Questo numero è già associato a un account. Accedi.");

  await consumePhoneCode(cleanPhone, smsCode, "register");

  const user: AppUser = {
    id: randomUUID(),
    email: cleanEmail,
    name: cleanName,
    passwordHash: await hashPassword(password),
    googleId: null,
    photoUrl: "",
    provider: "email",
    role: "fan",
    createdAt: new Date().toISOString(),
    phone: normalizePhone(cleanPhone),
    phoneVerified: true,
  };
  await upsertUser(user);
  return createUserSession(user);
}

export async function updateUserPhone(userId: string, phone: string, smsCode = "") {
  if (!isValidPhone(phone)) throw new Error("Numero di cellulare non valido");
  const user = await findUserById(userId);
  if (!user) throw new Error("Utente non trovato");
  const nextPhone = normalizePhone(phone);
  const taken = await findUserByPhone(nextPhone);
  if (taken && taken.id !== userId) {
    throw new Error("Questo numero è già associato a un account");
  }
  await consumePhoneCode(phone, smsCode, "update");
  user.phone = nextPhone;
  user.phoneVerified = true;
  await upsertUser(user);
  return toPublicUser(user);
}

export async function requireUser() {
  const user = await getUserSession();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireStaffUser() {
  const user = await requireUser();
  if (user.role !== "coach" && user.role !== "assistant_coach" && user.role !== "team_manager") {
    throw new Error("Unauthorized");
  }
  return user;
}

/** @deprecated Use requireStaffUser. */
export async function requireTeamManagerUser() {
  return requireStaffUser();
}

export async function requireCoachUser() {
  const user = await requireUser();
  if (user.role !== "coach" && user.role !== "assistant_coach") {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireManagerUser() {
  const user = await requireUser();
  if (user.role !== "team_manager") {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function loginWithEmail(email: string, password: string) {
  const cleanEmail = email.trim().toLowerCase();
  if (!isValidEmail(cleanEmail) || !password) {
    throw new Error("Email o password non validi");
  }
  const user = await findUserByEmail(cleanEmail);
  if (!user || !user.passwordHash) {
    throw new Error("Email o password non validi");
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error("Email o password non validi");
  return createUserSession(user);
}
