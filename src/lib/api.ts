const TOKEN_KEY = "squadra_admin_token";

export function getApiBase() {
  return process.env.NEXT_PUBLIC_API_URL || "";
}

export function getStoredToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
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
