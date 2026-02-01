// --- API Types (matching Backend DTOs) ---

export interface ApiCategory {
  id: number;
  slug: string;
  name: string;
  orderIndex: number;
}

export interface ApiExercise {
  id: string;
  name: string;
  category: ApiCategory;
  baseExerciseId?: string;
  baseExercise?: ApiExercise;
  variants?: ApiExercise[];
  difficulty: string;
  description?: string;
  equipment: string;
  defaultReps: number;
  unit: string;
  isUnilateral: boolean;
  exerciseMuscleGroups: {
      code: string;
    impact: number;
    effect: string;
  }[];
}

export interface ApiScheduledSession {
  id: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  frequency: string;
  color: string;
  exercises: {
    exerciseId: string;
    orderIndex: number;
    targetSets?: number;
    targetReps?: number;
    notes?: string;
    // New
    sets?: {
      setIndex: number;
      targetReps?: number;
      targetSeconds?: number;
      restSeconds?: number;
    }[];
    exercise: ApiExercise;
  }[];
}

export interface ApiSession {
  id: string;
  plannedSessionId?: string;
  titleSnapshot: string;
  performedAt: string; // ISO
  durationSeconds?: number;
  notes?: string;
  sessionExercises: {
    exerciseId: string;
    orderIndex: number;
    exerciseNameSnapshot: string;
    unitSnapshot: string;
    sets: {
      setIndex: number;
      reps?: number;
      weight?: number;
      seconds?: number;
    }[];
  }[];
}

export interface ApiUserProfile {
  id: string;
  level: number;
  xp: number;
  streakCurrent: number;
  streakBest: number;
  streakStartDate?: string;
  totalReps: number;
}
