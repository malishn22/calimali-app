import { defaultExercises } from "@/constants/DefaultExercises";
import { Exercise, ScheduledSession, SessionHistory } from "@/constants/Types";
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
        streak_start_date TEXT
      );
    `);

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
