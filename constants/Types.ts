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
  defaultReps: number;
  unit: ExerciseUnit;
  isUnilateral: boolean;
  muscleGroups: MuscleWork[];
}

export interface SessionExercise {
  exerciseId: string;
  name: string;
  sets: number;
  reps: number | number[];
  weight?: number;
  isUnilateral?: boolean;
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
  sessionId: string;
  date: string;
  performanceData: string; // JSON of what happened
}

export interface UserProfile {
  id: string;
  level: number;
  xp: number;
  streakCurrent: number;
  streakBest: number;
  streakStartDate: string | null;
  totalReps: number;
}
