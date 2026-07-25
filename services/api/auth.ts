import { apiFetch } from "./config";
import { ApiLoginResponse } from "./types";

/**
 * Exchange the configured username/password for a JWT. Throws on bad credentials
 * (or any non-2xx). `skipAuthRedirect` so a 401 here surfaces as "invalid
 * credentials" instead of triggering the global sign-out handler.
 */
export async function login(
  username: string,
  password: string,
): Promise<ApiLoginResponse> {
  const response = await apiFetch(
    "/auth/login",
    { method: "POST", body: JSON.stringify({ username, password }) },
    { skipAuthRedirect: true },
  );

  if (!response.ok) {
    throw new Error("Invalid username or password.");
  }

  return response.json();
}
