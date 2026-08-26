import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import { getAuthData, saveAuthData } from "./storage";
import { requestIsHttps } from "./public-origin";
import {
  ADMIN_PASSWORD,
  ADMIN_PIN,
  ADMIN_USERNAME,
} from "./admin-credentials";

export { ADMIN_PIN, ADMIN_USERNAME };
export const SESSION_COOKIE = "squadra_admin_session";
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "squadra-calcio-secret-key-noldi-2026"
);

export async function ensureAuthInitialized() {
  const existing = await getAuthData();
  if (!existing) {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await saveAuthData({ username: ADMIN_USERNAME, passwordHash });
  }
}

export function adminSessionCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export function applyAdminSessionCookie(
  response: { cookies: { set: (name: string, value: string, options: object) => void } },
  token: string,
  request?: Request
) {
  const secure = request
    ? requestIsHttps(request)
    : process.env.NODE_ENV === "production";
  response.cookies.set(SESSION_COOKIE, token, adminSessionCookieOptions(secure));
}

export async function verifyCredentials(
  username: string,
  password: string
): Promise<boolean> {
  await ensureAuthInitialized();
  const auth = await getAuthData();
  const user = username.trim();
  if (!auth || auth.username.toLowerCase() !== user.toLowerCase()) return false;
  if (await bcrypt.compare(password, auth.passwordHash)) return true;
  if (
    auth.username.toLowerCase() === ADMIN_USERNAME.toLowerCase() &&
    password === ADMIN_PASSWORD
  ) {
    await saveAuthData({
      username: ADMIN_USERNAME,
      passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 10),
    });
    return true;
  }
  return false;
}


export function verifyAdminPin(pin: string) {
  return String(pin || "").trim() === ADMIN_PIN;
}

export async function signAuthToken(username: string) {
  return new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (typeof payload.username === "string") {
      return { username: payload.username };
    }
    return null;
  } catch {
    return null;
  }
}

export async function createSession(username: string, request?: Request) {
  const token = await signAuthToken(username);
  const cookieStore = await cookies();
  const headerStore = await headers();
  const secure = requestIsHttps(request, headerStore);
  cookieStore.set(SESSION_COOKIE, token, adminSessionCookieOptions(secure));
  return token;
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<{ username: string } | null> {
  const headerStore = await headers();
  const auth = headerStore.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    const fromHeader = await verifyToken(auth.slice(7));
    if (fromHeader) return fromHeader;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

const DEV_COOKIE = "squadra_dev_unlock";

export async function unlockDeveloper(pin: string) {
  if (!verifyAdminPin(pin)) return false;
  const token = await new SignJWT({ developer: true })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("2h")
    .sign(JWT_SECRET);
  const cookieStore = await cookies();
  const headerStore = await headers();
  cookieStore.set(DEV_COOKIE, token, {
    httpOnly: true,
    secure: requestIsHttps(undefined, headerStore),
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 2,
  });
  return true;
}

export async function requireDeveloper() {
  await requireAdmin();
  const cookieStore = await cookies();
  const token = cookieStore.get(DEV_COOKIE)?.value;
  if (!token) throw new Error("Unauthorized");
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.developer !== true) throw new Error("Unauthorized");
  } catch {
    throw new Error("Unauthorized");
  }
}
