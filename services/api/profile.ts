import { UserProfile } from "@/constants/Types";
import { API_URL, headers } from "./config";
import { ApiUserProfile } from "./types";

export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await fetch(`${API_URL}/user-profile`);
    if (!response.ok) throw new Error("Failed to fetch profile");
    const data: ApiUserProfile = await response.json();

    return {
      id: "user",
      level: data.level,
      xp: data.xp,
      streak_current: data.streakCurrent,
      streak_best: data.streakBest,
      streak_start_date: data.streakStartDate || null,
      total_reps: data.totalReps,
    };
  } catch (error) {
    console.error(error);
    return {
      id: "user",
      level: 1,
      xp: 0,
      streak_current: 0,
      streak_best: 0,
      streak_start_date: null,
      total_reps: 0,
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
      streakCurrent: data.streak_current,
      streakBest: data.streak_best,
      totalReps: data.total_reps,
    }),
  });
};

export const applyStats = async (
  xpGained: number,
  repsGained: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _oldProfile?: UserProfile, // Kept for compatibility if we need to optimistically update
): Promise<UserProfile> => {
  const response = await fetch(`${API_URL}/user-profile/apply-stats`, {
    method: "POST",
    headers,
    body: JSON.stringify({ xpGained, repsGained }),
  });

  if (!response.ok) throw new Error("Failed to apply stats");
  const data: ApiUserProfile = await response.json();

  return {
    id: "user",
    level: data.level,
    xp: data.xp,
    streak_current: data.streakCurrent,
    streak_best: data.streakBest,
    streak_start_date: data.streakStartDate || null,
    total_reps: data.totalReps,
  };
};
