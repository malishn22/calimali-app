// Configuration
export const API_URL = process.env.EXPO_PUBLIC_API_URL;
export const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === "true";

if (!API_URL && !USE_MOCK) {
  console.warn("EXPO_PUBLIC_API_URL is not set. API calls will fail.");
}

export const headers = {
  "Content-Type": "application/json",
};
