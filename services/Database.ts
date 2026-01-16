import {
  ExerciseCategory,
  ExerciseDifficulty,
  ExerciseEquipment,
  ExerciseUnit,
} from "@/constants/Enums";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("calimali.db");

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  difficulty: ExerciseDifficulty;
  description: string;
  equipment: ExerciseEquipment;
  default_reps: number;
  unit: ExerciseUnit;
  is_unilateral: boolean;
}

export interface SessionExercise {
  exerciseId: string;
  name: string;
  sets: number;
  reps: number | number[]; // Can be a single number (legacy) or array per set
  weight?: number;
}

export interface ScheduledSession {
  id: string;
  title: string;
  date: string; // ISO Date string
  frequency: "ONCE" | "DAILY" | "WEEKLY" | "EVERY_2_DAYS";
  color: string;
  exercises: string; // JSON string of Exercise[]
}

export const initDatabase = async () => {
  try {
    // Enable foreign keys
    await db.execAsync("PRAGMA foreign_keys = ON;");

    // Create Tables
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS exercises (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL CHECK(category IN ('PUSH', 'PULL', 'LEGS', 'CORE', 'SKILLS', 'OTHER')),
        difficulty TEXT NOT NULL CHECK(difficulty IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE')),
        description TEXT,
        equipment TEXT NOT NULL CHECK(equipment IN ('NONE', 'BAR', 'RINGS', 'PARALLETTES', 'WEIGHTS', 'OTHER')),
        default_reps INTEGER DEFAULT 0,
        unit TEXT NOT NULL CHECK(unit IN ('REPS', 'SECS')),
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

    // For development, dropping to ensure schema update
    // await db.execAsync(`DROP TABLE IF EXISTS scheduled_sessions;`);

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

    // Removed DROP TABLE to fix locking and persistence
    // await db.execAsync(`DROP TABLE IF EXISTS session_history;`);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS session_history (
        id TEXT PRIMARY KEY NOT NULL,
        session_id TEXT,
        date TEXT NOT NULL,
        performance_data TEXT
      );
    `);

    console.log("Database initialized successfully");

    // Seed Data Check
    const countResult = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM exercises"
    );
    if (countResult && countResult.count === 0) {
      console.log("Seeding default exercises...");
      const defaultExercises = [
        {
          id: "1",
          name: "Push Up",
          category: "PUSH",
          difficulty: "BEGINNER",
          description: "Standard push up",
          equipment: "NONE",
          default_reps: 15,
          unit: "REPS",
          is_unilateral: 0,
        },
        {
          id: "2",
          name: "Pull Up",
          category: "PULL",
          difficulty: "INTERMEDIATE",
          description: "Standard chin over bar pull up",
          equipment: "BAR",
          default_reps: 8,
          unit: "REPS",
          is_unilateral: 0,
        },
        {
          id: "3",
          name: "Dip",
          category: "PUSH",
          difficulty: "INTERMEDIATE",
          description: "Parallel bar dips",
          equipment: "PARALLETTES",
          default_reps: 10,
          unit: "REPS",
          is_unilateral: 0,
        },
        {
          id: "4",
          name: "Squat",
          category: "LEGS",
          difficulty: "BEGINNER",
          description: "Bodyweight squat",
          equipment: "NONE",
          default_reps: 20,
          unit: "REPS",
          is_unilateral: 0,
        },
        {
          id: "5",
          name: "L-Sit",
          category: "CORE",
          difficulty: "INTERMEDIATE",
          description: "Hold L-shape on ground or bars",
          equipment: "NONE",
          default_reps: 15,
          unit: "SECS",
          is_unilateral: 0,
        },
        {
          id: "6",
          name: "Muscle Up",
          category: "PULL",
          difficulty: "ELITE",
          description: "Explosive pull up to support",
          equipment: "BAR",
          default_reps: 3,
          unit: "REPS",
          is_unilateral: 0,
        },
        {
          id: "7",
          name: "Handstand Push Up",
          category: "PUSH",
          difficulty: "ADVANCED",
          description: "Vertical push up against wall or free",
          equipment: "NONE",
          default_reps: 5,
          unit: "REPS",
          is_unilateral: 0,
        },
        {
          id: "8",
          name: "Dragon Flag",
          category: "CORE",
          difficulty: "ELITE",
          description: "Bruce Lee's favorite ab exercise",
          equipment: "NONE",
          default_reps: 5,
          unit: "REPS",
          is_unilateral: 0,
        },
      ];

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
            ex.is_unilateral,
          ]
        );
      }
      console.log("Seeding complete.");
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

// ... (existing exports) ...

export const clearAllData = async () => {
  try {
    await db.runAsync("DELETE FROM scheduled_sessions");
    await db.runAsync("DELETE FROM session_history");
    await db.runAsync("DELETE FROM exercises"); // Optional: if user wants full reset
    // Re-seed default exercises would be needed if we delete them.
    // For now let's just clear user generated data: sessions and history.
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
      [id]
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
      ]
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
      ]
    );
  } catch (e) {
    console.error("Failed to add session", e);
  }
};

export const getSessions = async (): Promise<ScheduledSession[]> => {
  try {
    return await db.getAllAsync<ScheduledSession>(
      "SELECT * FROM scheduled_sessions"
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
      ]
    );
  } catch (e) {
    console.error("Failed to update session", e);
  }
};

export interface SessionHistory {
  id: string;
  session_id: string;
  date: string;
  performance_data: string; // JSON of what happened
}

export const addSessionHistory = async (history: SessionHistory) => {
  try {
    await db.runAsync(
      `INSERT INTO session_history (id, session_id, date, performance_data) VALUES (?, ?, ?, ?);`,
      [history.id, history.session_id, history.date, history.performance_data]
    );
  } catch (e) {
    console.error("Failed to add session history", e);
  }
};

export const getSessionHistory = async (): Promise<SessionHistory[]> => {
  try {
    const res = await db.getAllAsync<SessionHistory>(
      "SELECT * FROM session_history ORDER BY date DESC"
    );
    return res;
  } catch (e) {
    console.error("Failed to get session history", e);
    return [];
  }
};

// Helper to convert DB row (where booleans are 0/1) to JS Object
const createExerciseFromRow = (row: any): Exercise => {
  return {
    ...row,
    is_unilateral: row.is_unilateral === 1,
  };
};
