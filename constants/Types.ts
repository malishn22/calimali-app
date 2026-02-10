import {
  ExerciseCategory,
  ExerciseDifficulty,
  ExerciseEffect,
  ExerciseEquipment,
  ExerciseImpact,
  ExerciseUnit,
} from "./Enums";

export interface MuscleWork {
  muscleDescription: string; // The group code, e.g. "front_chest_lower"
  impact: ExerciseImpact;
  effect: ExerciseEffect;
}

export interface ExerciseCategoryModel {
  id: number;
  slug: string;
  name: string;
  orderIndex: number;
}

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategoryModel;
  baseExerciseId?: string;
  baseExercise?: Exercise;
  variants?: Exercise[];
  difficulty: ExerciseDifficulty;
  description: string;
  equipment: ExerciseEquipment;
  default_reps: number;
  unit: ExerciseUnit;
  is_unilateral: boolean;
  muscleGroups: MuscleWork[];
}

export interface SessionExercise {
  exerciseId: string;
  name: string;
  sets: number;
  reps: number | number[];
  weight?: number;
  is_unilateral?: boolean;
  description?: string;
  muscleGroups?: MuscleWork[];
  categorySlug?: string;
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
