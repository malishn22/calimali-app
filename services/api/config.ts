// Configuration
export const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Optional shared secret for the destructive POST /system/reset endpoint. Only
// sent when configured; the backend enforces it when ADMIN_RESET_TOKEN is set.
export const ADMIN_RESET_TOKEN = process.env.EXPO_PUBLIC_ADMIN_RESET_TOKEN;

if (!API_URL) {
  console.warn("EXPO_PUBLIC_API_URL is not set. API calls will fail.");
}

export const headers = {
  "Content-Type": "application/json",
};
