import { API_URL } from "./config";
import * as Exercises from "./exercises";
import * as Profile from "./profile";
import * as Sessions from "./sessions";

export const Api = {
  ...Exercises,
  ...Sessions,
  ...Profile,
  async resetUserData(): Promise<void> {
    const response = await fetch(`${API_URL}/system/reset`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Failed to reset data");
  },

};

export * from "./exercises";
export * from "./profile";
export * from "./sessions";
export * from "./types";
