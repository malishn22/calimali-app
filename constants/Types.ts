import {
  ExerciseCategory,
  ExerciseDifficulty,
  ExerciseEffect,
  ExerciseEquipment,
  ExerciseImpact,
  ExerciseUnit,
  RecurrenceType,
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

/**
 * A reusable, named workout ("Push Day"). Says *what* you do; {@link PlannedSession}
 * says *when*. Editing a routine changes it on every day it is scheduled.
 */
export interface Routine {
  id: string;
  name: string;
  color: string;
  exercises: SessionExercise[];
}

/** A placement of a {@link Routine} on the calendar, with a recurrence rule. */
export interface PlannedSession {
  id: string;
  routineId: string;
  /** YYYY-MM-DD. Occurrences never fire before this day. */
  startDate: string;
  /** YYYY-MM-DD, or null to run indefinitely. */
  endDate?: string | null;
  recurrenceType: RecurrenceType;
  /** 0=Sun .. 6=Sat, matching Date#getDay. Used by WEEKLY. */
  daysOfWeek: number[];
  /** Day gap used by INTERVAL. */
  intervalDays?: number | null;
}

/** A planned session resolved against its routine, ready to render for a given day. */
export interface ScheduledEntry {
  plannedSession: PlannedSession;
  routine: Routine;
}

export interface SessionHistory {
  id: string;
  /** The routine this workout came from; "" for an ad-hoc session. */
  routineId: string;
  title: string;
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
