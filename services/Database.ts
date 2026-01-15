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
    await db.execAsync(`DROP TABLE IF EXISTS scheduled_sessions;`);

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

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
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

// Helper to convert DB row (where booleans are 0/1) to JS Object
const createExerciseFromRow = (row: any): Exercise => {
  return {
    ...row,
    is_unilateral: row.is_unilateral === 1,
  };
};
