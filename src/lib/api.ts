const TOKEN_KEY = "squadra_admin_token";

export function getApiBase() {
  return process.env.NEXT_PUBLIC_API_URL || "";
}

function readStorage(storage: Storage | undefined) {
  try {
    return storage?.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

export function getStoredToken() {
  if (typeof window === "undefined") return null;
  return readStorage(window.localStorage) || readStorage(window.sessionStorage);
}

export function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      window.localStorage.setItem(TOKEN_KEY, token);
      window.sessionStorage.setItem(TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(TOKEN_KEY);
      window.sessionStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    /* Safari private mode */
  }
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const token = getStoredToken();
  const isUserAuth =
    path.startsWith("/api/auth/user") ||
    path.startsWith("/api/auth/register") ||
    path.startsWith("/api/auth/google");
  if (token && !headers.has("Authorization") && !isUserAuth) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(`${getApiBase()}${path}`, {
    ...init,
    headers,
    credentials: "include",
    cache: init.cache ?? "no-store",
  });
}
