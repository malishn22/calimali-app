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
    // 401 => the server evaluated the credentials and rejected them. Any other
    // non-2xx is a server-side problem, not the user's password.
    throw new Error(
      response.status === 401
        ? "Invalid username or password."
        : "Something went wrong. Please try again.",
    );
  }

  return response.json();
}
