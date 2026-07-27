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

/** Per-request timeout. React Native's fetch has no default JS-level timeout, so
 * without this a slow/unreachable backend hangs until the native socket timeout
 * (minutes). Kept at 30s to tolerate cold starts over Tailscale/LAN. */
const REQUEST_TIMEOUT_MS = 30_000;

/**
 * Thrown when a request never produces an HTTP response — a timeout, DNS failure,
 * or refused connection. Distinct from a non-2xx `Response` so callers can tell a
 * transport failure ("can't reach server") apart from a real 401 ("bad credentials").
 */
export class ApiNetworkError extends Error {
  constructor(cause?: unknown) {
    super("Can't reach the server. Check your connection and try again.");
    this.name = "ApiNetworkError";
    this.cause = cause;
  }
}

/**
 * Single chokepoint for every API request. Injects the JSON + bearer headers and
 * routes 401s to the registered handler (sign-out). Returns the raw Response so
 * callers keep their existing `.ok` handling. `path` must start with "/".
 *
 * Bounded by a {@link REQUEST_TIMEOUT_MS} abort timeout; transport failures are
 * rethrown as {@link ApiNetworkError}.
 */
export async function apiFetch(
  path: string,
  init: RequestInit = {},
  options: ApiFetchOptions = {},
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(init.headers ?? {}),
      },
    });
  } catch (e) {
    // Timeout (AbortError) or network failure (TypeError) — never an HTTP response.
    throw new ApiNetworkError(e);
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 401 && !options.skipAuthRedirect) {
    onUnauthorized?.();
  }

  return response;
}
