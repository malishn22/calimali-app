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
  streak_current: 3,
  streak_best: 7,
  streak_start_date: daysAgo(3),
  total_reps: 854,
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
      total_reps: profile.total_reps + repsGained,
      streak_current: profile.streak_current + 1,
    };
    // Simple level-up: every 200 XP
    while (profile.xp >= profile.level * 200) {
      profile.xp -= profile.level * 200;
      profile.level += 1;
    }
    if (profile.streak_current > profile.streak_best) {
      profile.streak_best = profile.streak_current;
    }
    return {
      profile: { ...profile },
      streakBreakSuggested: false,
      daysSinceLastActivity: 0,
    };
  },

  resetStreak: (): UserProfile => {
    profile = { ...profile, streak_current: 0, streak_start_date: null };
    return { ...profile };
  },

  reset: (): void => {
    profile = { ...INITIAL_PROFILE };
  },
};
