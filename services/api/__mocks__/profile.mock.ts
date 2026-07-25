import { UserProfile } from "@/constants/Types";
import { ApplyStatsResult } from "../profile";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const INITIAL_PROFILE: UserProfile = {
  id: "user",
  level: 5,
  xp: 320,
  streakCurrent: 3,
  streakBest: 7,
  streakStartDate: daysAgo(3),
  totalReps: 854,
};

let profile: UserProfile = { ...INITIAL_PROFILE };

export const mockProfile = {
  get: (): UserProfile => ({ ...profile }),

  update: (data: Partial<UserProfile>): void => {
    profile = { ...profile, ...data };
  },

  applyStats: (xpGained: number, repsGained: number): ApplyStatsResult => {
    profile = {
      ...profile,
      xp: profile.xp + xpGained,
      totalReps: profile.totalReps + repsGained,
      streakCurrent: profile.streakCurrent + 1,
    };
    // Simple level-up: every 200 XP
    while (profile.xp >= profile.level * 200) {
      profile.xp -= profile.level * 200;
      profile.level += 1;
    }
    if (profile.streakCurrent > profile.streakBest) {
      profile.streakBest = profile.streakCurrent;
    }
    return {
      profile: { ...profile },
      streakBreakSuggested: false,
      daysSinceLastActivity: 0,
    };
  },

  resetStreak: (): UserProfile => {
    profile = { ...profile, streakCurrent: 0, streakStartDate: null };
    return { ...profile };
  },

  reset: (): void => {
    profile = { ...INITIAL_PROFILE };
  },
};
