import {
  ExerciseCategory,
  ExerciseDifficulty,
  ExerciseEquipment,
  ExerciseUnit,
} from "./Enums";

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
  muscleGroups: string[];
}

export interface SessionExercise {
  exerciseId: string;
  name: string;
  sets: number;
  reps: number | number[];
  weight?: number;
  is_unilateral?: boolean;
}

export interface ScheduledSession {
  id: string;
  title: string;
  date: string;
  frequency: "ONCE" | "DAILY" | "WEEKLY" | "EVERY 2 DAYS";
  color: string;
  exercises: string;
}

export interface SessionHistory {
  id: string;
  session_id: string;
  date: string;
  performance_data: string; // JSON of what happened
}

export interface UserProfile {
  id: string;
  level: number;
  xp: number;
  streak_current: number;
  streak_best: number;
  streak_start_date: string | null;
  total_reps: number;
}
