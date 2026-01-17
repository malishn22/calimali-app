import { defaultExercises } from "@/constants/DefaultExercises";
import {
  Exercise,
  ScheduledSession,
  SessionHistory,
  UserProfile,
} from "@/constants/Types";
import * as SQLite from "expo-sqlite";

// Re-export types for backward compatibility
export * from "@/constants/Types";

const db = SQLite.openDatabaseSync("calimali.db");

export const initDatabase = async () => {
  try {
    await db.execAsync("PRAGMA foreign_keys = ON;");

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS exercises (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        description TEXT,
        equipment TEXT NOT NULL,
        default_reps INTEGER DEFAULT 0,
        unit TEXT NOT NULL,
        is_unilateral INTEGER
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS user_profile (
        id TEXT PRIMARY KEY NOT NULL,
        level INTEGER DEFAULT 1,
        xp INTEGER DEFAULT 0,
        streak_current INTEGER DEFAULT 0,
        streak_best INTEGER DEFAULT 0,
        streak_start_date TEXT,
        total_reps INTEGER DEFAULT 0
      );
    `);

    // Migration for existing tables (quick fix for dev environment)
    try {
      await db.runAsync(
        "ALTER TABLE user_profile ADD COLUMN streak_best INTEGER DEFAULT 0;",
      );
    } catch (e) {
      /* ignore if exists */
    }
    try {
      await db.runAsync(
        "ALTER TABLE user_profile ADD COLUMN total_reps INTEGER DEFAULT 0;",
      );
    } catch (e) {
      /* ignore if exists */
    }

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS scheduled_sessions (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        frequency TEXT NOT NULL,
        color TEXT NOT NULL,
        exercises TEXT NOT NULL
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS session_history (
        id TEXT PRIMARY KEY NOT NULL,
        session_id TEXT,
        date TEXT NOT NULL,
        performance_data TEXT
      );
    `);

    // Check if empty and seed
    const countResult = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM exercises",
    );

    if (countResult && countResult.count === 0) {
      console.log("Seeding default exercises...");

      for (const ex of defaultExercises) {
        await db.runAsync(
          `INSERT INTO exercises (id, name, category, difficulty, description, equipment, default_reps, unit, is_unilateral) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            ex.id,
            ex.name,
            ex.category,
            ex.difficulty,
            ex.description,
            ex.equipment,
            ex.default_reps,
            ex.unit,
            ex.is_unilateral ? 1 : 0,
          ],
        );
      }
      console.log("Seeding complete.");
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

export const clearAllData = async () => {
  try {
    await db.runAsync("DELETE FROM scheduled_sessions");
    await db.runAsync("DELETE FROM session_history");
    // await db.runAsync("DELETE FROM exercises"); // Preserving exercises

    console.log("All user data cleared");
  } catch (e) {
    console.error("Failed to clear data", e);
  }
};

export const getExercises = async (): Promise<Exercise[]> => {
  try {
    const result = await db.getAllAsync<any>("SELECT * FROM exercises");
    return result.map(createExerciseFromRow);
  } catch (e) {
    console.error("Failed to get exercises", e);
    return [];
  }
};

export const getExercise = async (id: string): Promise<Exercise | null> => {
  try {
    const result = await db.getFirstAsync<any>(
      "SELECT * FROM exercises WHERE id = ?",
      [id],
    );
    return result ? createExerciseFromRow(result) : null;
  } catch (e) {
    console.error("Failed to get exercise", e);
    return null;
  }
};

export const addExercise = async (exercise: Exercise) => {
  try {
    await db.runAsync(
      `INSERT INTO exercises (id, name, category, difficulty, description, equipment, default_reps, unit, is_unilateral) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        exercise.id,
        exercise.name,
        exercise.category,
        exercise.difficulty,
        exercise.description,
        exercise.equipment,
        exercise.default_reps,
        exercise.unit,
        exercise.is_unilateral ? 1 : 0,
      ],
    );
  } catch (e) {
    console.error("Failed to add exercise", e);
  }
};

export const deleteExercise = async (id: string) => {
  try {
    await db.runAsync("DELETE FROM exercises WHERE id = ?", [id]);
  } catch (e) {
    console.error("Failed to delete exercise", e);
  }
};

export const addSession = async (session: ScheduledSession) => {
  try {
    await db.runAsync(
      `INSERT INTO scheduled_sessions (id, title, date, frequency, color, exercises) VALUES (?, ?, ?, ?, ?, ?);`,
      [
        session.id,
        session.title,
        session.date,
        session.frequency,
        session.color,
        session.exercises,
      ],
    );
  } catch (e) {
    console.error("Failed to add session", e);
  }
};

export const getSessions = async (): Promise<ScheduledSession[]> => {
  try {
    return await db.getAllAsync<ScheduledSession>(
      "SELECT * FROM scheduled_sessions",
    );
  } catch (e) {
    console.error("Failed to get sessions", e);
    return [];
  }
};

export const deleteSession = async (id: string) => {
  try {
    await db.runAsync("DELETE FROM scheduled_sessions WHERE id = ?", [id]);
  } catch (e) {
    console.error("Failed to delete session", e);
  }
};

export const updateSession = async (session: ScheduledSession) => {
  try {
    await db.runAsync(
      `UPDATE scheduled_sessions SET title = ?, date = ?, frequency = ?, color = ?, exercises = ? WHERE id = ?;`,
      [
        session.title,
        session.date,
        session.frequency,
        session.color,
        session.exercises,
        session.id,
      ],
    );
  } catch (e) {
    console.error("Failed to update session", e);
  }
};

export const addSessionHistory = async (history: SessionHistory) => {
  try {
    await db.runAsync(
      `INSERT INTO session_history (id, session_id, date, performance_data) VALUES (?, ?, ?, ?);`,
      [history.id, history.session_id, history.date, history.performance_data],
    );
  } catch (e) {
    console.error("Failed to add session history", e);
  }
};

export const getSessionHistory = async (): Promise<SessionHistory[]> => {
  try {
    const res = await db.getAllAsync<SessionHistory>(
      "SELECT * FROM session_history ORDER BY date DESC",
    );
    return res;
  } catch (e) {
    console.error("Failed to get session history", e);
    return [];
  }
};

const createExerciseFromRow = (row: any): Exercise => {
  return {
    ...row,
    is_unilateral: row.is_unilateral === 1,
  };
};

export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const result = await db.getFirstAsync<UserProfile>(
      "SELECT * FROM user_profile WHERE id = 'user'",
    );
    if (result) {
      return result;
    } else {
      // Create default user
      await db.runAsync(
        "INSERT INTO user_profile (id, level, xp, streak_current, streak_best, streak_start_date, total_reps) VALUES ('user', 1, 0, 0, 0, ?, 0)",
        [new Date().toISOString()],
      );
      return {
        id: "user",
        level: 1,
        xp: 0,
        streak_current: 0,
        streak_best: 0,
        streak_start_date: new Date().toISOString(),
        total_reps: 0,
      };
    }
  } catch (e) {
    console.error("Failed to get user profile", e);
    return {
      id: "user",
      level: 1,
      xp: 0,
      streak_current: 0,
      streak_best: 0,
      streak_start_date: new Date().toISOString(),
      total_reps: 0,
    };
  }
};

export const getLevelRequirement = (level: number) => {
  // Progressive XP: Level 1=500, Level 2=750, etc.
  // Base 500, increase by 25% each level?
  // Formula: Threshold = 500 * (Level ^ 1.2) roughly?
  // Let's use simpler strictly progressive: 500 + (Level-1)*250
  // L1: 0-500 (Need 500)
  // L2: 500-1250 (Need 750)
  // L3: 1250-2250 (Need 1000)

  // Total XP required to reach Level L:
  // Sum of (500 + (i-1)*250) for i=1 to L-1.

  // Inverse: Given TotalXP, what is Level?
  // We can just iterate or use approximate root.
  // Since max level isn't huge, iteration is fine.

  // However, let's keep it simple for now:
  // Level XP Requirement = 500 * Level.
  // Total XP to reach Level L = 500 * (L * (L-1) / 2) -> No that's quadratic.
  // Let's just do: Level = 1 + floor(sqrt(XP / 100))
  // IF XP=0 -> L=1. XP=100 -> L=2. XP=400 -> L=3. XP=900 -> L=4.
  // 500 is the first milestone.
  // formula: Level = floor(0.1 * sqrt(XP)) + 1 ?
  // 500xp -> sqrt(500)=22 -> 2.2 + 1 = 3? Too fast.

  // Let's stick to the user request: Increase GRAUALLY.
  // Level 1 to 2: 500 XP.
  // Level 2 to 3: 750 XP. (Total 1250)
  // Level 3 to 4: 1000 XP. (Total 2250)

  return 500 + (level - 1) * 250;
};

export const calculateLevel = (totalXP: number) => {
  let level = 1;
  let xp = totalXP;
  while (true) {
    const req = getLevelRequirement(level);
    if (xp >= req) {
      xp -= req;
      level++;
    } else {
      break;
    }
  }
  return level;
};

export const updateUserStats = async (
  xpGained: number,
  repsGained: number,
): Promise<UserProfile> => {
  try {
    // 1. Get current profile
    const profile = await getUserProfile();

    // 2. Calculate new XP and Level
    const newXP = profile.xp + xpGained;
    const newLevel = calculateLevel(newXP);

    // 3. Current Reps
    const newTotalReps = (profile.total_reps || 0) + repsGained;

    // 4. Calculate Streak
    // Get all unique session dates
    const history = await db.getAllAsync<{ date: string }>(
      "SELECT DISTINCT date FROM session_history ORDER BY date DESC",
    );

    // Normalize dates to YYYY-MM-DD
    const uniqueDays = Array.from(
      new Set(history.map((h) => h.date.split("T")[0])),
    );

    // Sort descending
    uniqueDays.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;

    // Check if we have a session today (we should, since we just finished one)
    // Helper to format date as YYYY-MM-DD
    const formatDate = (d: Date) => d.toISOString().split("T")[0];

    let checkDate = new Date(); // Today
    let count = 0;

    while (true) {
      const dateStr = formatDate(checkDate);
      if (uniqueDays.includes(dateStr)) {
        count++;
        // Move to yesterday
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    streak = count;

    // Best Streak
    const currentBest = profile.streak_best || 0;
    const newBestStreak = Math.max(currentBest, streak);

    // Streak Start Date
    // If streak is 1 (restarted or just started), today is start date.
    // If streak > 1, keep old start date.
    let streakStartDate = profile.streak_start_date;
    if (streak === 1 || !streakStartDate) {
      streakStartDate = new Date().toISOString();
    } else {
      // Just validity check, if streak broke, we would have reset but we just calculated current streak based on history
      // Wait, if streak continued, start date is same.
      // If streak broken and restarted today (count=1), we set to today.
    }

    // Wait, simpler:
    // If we just continued a streak, start date shouldn't change.
    // If we broke a streak and started a new one (streak became 1), set to today.
    // But how do we know if we broke it?
    // We calculated `count`. If `count` === 1, it means we only have today.
    // So if count === 1, set StartDate to Today.
    // If count > 1, keep existing StartDate.
    if (streak === 1) {
      streakStartDate = new Date().toISOString();
    }

    // 5. Update DB
    await db.runAsync(
      "UPDATE user_profile SET xp = ?, level = ?, streak_current = ?, streak_best = ?, streak_start_date = ?, total_reps = ? WHERE id = 'user'",
      [newXP, newLevel, streak, newBestStreak, streakStartDate, newTotalReps],
    );

    return {
      ...profile,
      xp: newXP,
      level: newLevel,
      streak_current: streak,
      streak_best: newBestStreak,
      streak_start_date: streakStartDate,
      total_reps: newTotalReps,
    };
  } catch (e) {
    console.error("Failed to update user stats", e);
    throw e;
  }
};
// Helper to check frequencies
export const isSessionActiveOnDate = (
  session: ScheduledSession,
  date: Date,
): boolean => {
  const sessionDate = new Date(session.date);
  // Normalize comparison to local date (strip time)
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const start = new Date(sessionDate);
  start.setHours(0, 0, 0, 0);

  if (target < start) return false;

  if (session.frequency === "ONCE") {
    return target.getTime() === start.getTime();
  } else if (session.frequency === "DAILY") {
    return true; // Already verified date >= start
  } else if (session.frequency === "WEEKLY") {
    return target.getDay() === start.getDay();
  } else if (session.frequency === "EVERY_2_DAYS") {
    const diffTime = Math.abs(target.getTime() - start.getTime());
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return diffDays % 2 === 0;
  }
  return false;
};
