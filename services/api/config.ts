// Configuration
export const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Optional shared secret for the destructive POST /system/reset endpoint. Only
// sent when configured; the backend enforces it when ADMIN_RESET_TOKEN is set.
export const ADMIN_RESET_TOKEN = process.env.EXPO_PUBLIC_ADMIN_RESET_TOKEN;

if (!API_URL) {
  console.warn("EXPO_PUBLIC_API_URL is not set. API calls will fail.");
}

// --- Auth (JWT bearer) ---
// The bearer token and a 401 handler live at module scope so the (React-free)
// fetch layer stays decoupled from AuthContext. AuthProvider wires both up:
// setAuthToken() on login/restore/logout, setUnauthorizedHandler() once on mount.
let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

export interface ApiFetchOptions {
  /** Skip the global 401 -> sign-out handler (used by the login request itself). */
  skipAuthRedirect?: boolean;
}

/**
 * Single chokepoint for every API request. Injects the JSON + bearer headers and
 * routes 401s to the registered handler (sign-out). Returns the raw Response so
 * callers keep their existing `.ok` handling. `path` must start with "/".
 */
export async function apiFetch(
  path: string,
  init: RequestInit = {},
  options: ApiFetchOptions = {},
): Promise<Response> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  if (response.status === 401 && !options.skipAuthRedirect) {
    onUnauthorized?.();
  }

  return response;
}
