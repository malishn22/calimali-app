import { UserProfile } from "@/constants/Types";
import { API_URL, headers } from "./config";
import { ApiApplyStatsResponse, ApiUserProfile } from "./types";

function mapApiProfileToUserProfile(data: ApiUserProfile): UserProfile {
  return {
    id: "user",
    level: data.level,
    xp: data.xp,
    streakCurrent: data.streakCurrent,
    streakBest: data.streakBest,
    streakStartDate: data.streakStartDate || null,
    totalReps: data.totalReps,
  };
}

export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await fetch(`${API_URL}/user-profile`);
    if (!response.ok) throw new Error("Failed to fetch profile");
    const data: ApiUserProfile = await response.json();
    return mapApiProfileToUserProfile(data);
  } catch (error) {
    // console.warn("getUserProfile failed, returning default.");
    return {
      id: "user",
      level: 1,
      xp: 0,
      streakCurrent: 0,
      streakBest: 0,
      streakStartDate: null,
      totalReps: 0,
    };
  }
};

export const updateUserProfile = async (data: any) => {
  await fetch(`${API_URL}/user-profile`, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      level: data.level,
      xp: data.xp,
      streakCurrent: data.streakCurrent,
      streakBest: data.streakBest,
      totalReps: data.totalReps,
    }),
  });
};

export interface ApplyStatsResult {
  profile: UserProfile;
  streakBreakSuggested: boolean;
  daysSinceLastActivity: number | null;
}

export const applyStats = async (
  xpGained: number,
  repsGained: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _oldProfile?: UserProfile,
): Promise<ApplyStatsResult> => {
  const response = await fetch(`${API_URL}/user-profile/apply-stats`, {
    method: "POST",
    headers,
    body: JSON.stringify({ xpGained, repsGained }),
  });

  if (!response.ok) throw new Error("Failed to apply stats");
  const data: ApiApplyStatsResponse = await response.json();

  return {
    profile: mapApiProfileToUserProfile(data.profile),
    streakBreakSuggested: data.streakBreakSuggested ?? false,
    daysSinceLastActivity: data.daysSinceLastActivity ?? null,
  };
};

export const resetStreak = async (): Promise<UserProfile> => {
  const response = await fetch(`${API_URL}/user-profile/reset-streak`, {
    method: "POST",
    headers,
  });

  if (!response.ok) throw new Error("Failed to reset streak");
  const data: ApiUserProfile = await response.json();
  return mapApiProfileToUserProfile(data);
};
