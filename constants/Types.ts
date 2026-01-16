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
