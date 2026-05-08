import { API_URL, headers, USE_MOCK } from "./config";
import * as Exercises from "./exercises";
import * as Profile from "./profile";
import * as Sessions from "./sessions";
import { mockDelay } from "./__mocks__/utils";
import { mockExerciseStore } from "./__mocks__/exercises.generated";
import { mockPlannedSessionStore, mockSessionHistoryStore } from "./__mocks__/sessions.mock";
import { mockProfile } from "./__mocks__/profile.mock";

export const Api = {
  ...Exercises,
  ...Sessions,
  ...Profile,
  async resetUserData(): Promise<void> {
    if (USE_MOCK) {
      await mockDelay();
      mockExerciseStore.reset();
      mockPlannedSessionStore.reset();
      mockSessionHistoryStore.reset();
      mockProfile.reset();
      return;
    }
    const response = await fetch(`${API_URL}/system/reset`, {
      method: "POST",
      headers,
    });
    if (!response.ok) throw new Error("Failed to reset data");
  },

};

export * from "./exercises";
export * from "./profile";
export * from "./sessions";
export * from "./types";
