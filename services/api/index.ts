import { ADMIN_RESET_TOKEN, apiFetch } from "./config";
import * as Exercises from "./exercises";
import * as Profile from "./profile";
import * as Routines from "./routines";
import * as Sessions from "./sessions";

export const Api = {
  ...Exercises,
  ...Routines,
  ...Sessions,
  ...Profile,
  async resetUserData(): Promise<void> {
    const response = await apiFetch("/system/reset", {
      method: "POST",
      headers: ADMIN_RESET_TOKEN ? { "X-Admin-Token": ADMIN_RESET_TOKEN } : undefined,
    });
    if (!response.ok) throw new Error("Failed to reset data");
  },
};

export * from "./auth";

export * from "./exercises";
export * from "./profile";
export * from "./routines";
export * from "./sessions";
export * from "./types";
