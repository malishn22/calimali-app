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
}

export interface SessionExercise {
  exerciseId: string;
  name: string;
  sets: number;
  reps: number | number[];
  weight?: number;
}

export interface ScheduledSession {
  id: string;
  title: string;
  date: string;
  frequency: "ONCE" | "DAILY" | "WEEKLY" | "EVERY_2_DAYS";
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

export const getLevelRank = (level: number): string => {
  if (level >= 100) return "GODLIKE";
  if (level >= 90) return "MYTHIC";
  if (level >= 80) return "IMMORTAL";
  if (level >= 70) return "TITAN";
  if (level >= 60) return "LEGEND";
  if (level >= 50) return "MASTER";
  if (level >= 40) return "ELITE";
  if (level >= 30) return "VETERAN";
  if (level >= 20) return "WARRIOR";
  if (level >= 10) return "CHALLENGER";
  if (level >= 5) return "ROOKIE";
  return "BEGINNER";
};
