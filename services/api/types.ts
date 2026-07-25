// --- API Types (derived from the backend OpenAPI contract) ---
//
// These types are DERIVED from services/api/generated.ts (generated from the
// backend Swagger spec via `npm run gen:api`). The backend is the single source
// of truth: `Pick` below enforces that every field the app relies on still
// exists on the backend DTO, so a rename/removal on the backend surfaces as a
// TypeScript error here (and in CI) instead of a silent runtime break.
//
// `Clean` strips the null/undefined that Swashbuckle adds to most fields (C#
// reference types serialize as nullable) so the app-facing shapes stay ergonomic
// and the existing service mappers keep type-checking.

import type { components } from "./generated";

type Schemas = components["schemas"];

type Clean<T> = { [K in keyof T]-?: NonNullable<T[K]> };

export type ApiCategory = Clean<
  Pick<Schemas["ExerciseCategoryDto"], "id" | "slug" | "name" | "orderIndex">
>;

export type ApiMuscleGroup = Clean<
  Pick<Schemas["ExerciseMuscleGroupDto"], "code" | "impact" | "effect">
>;

export type ApiExercise = Clean<
  Pick<
    Schemas["ExerciseDto"],
    "id" | "name" | "difficulty" | "equipment" | "defaultReps" | "unit" | "isUnilateral"
  >
> & {
  category: ApiCategory;
  description?: string;
  baseExerciseId?: string;
  baseExercise?: ApiExercise;
  variants?: ApiExercise[];
  exerciseMuscleGroups: ApiMuscleGroup[];
};

export type ApiScheduledSession = Clean<
  Pick<Schemas["PlannedSession"], "id" | "title" | "frequency" | "color">
> & {
  startDate: string; // YYYY-MM-DD (DateOnly serialized)
  exercises: {
    exerciseId: string;
    orderIndex: number;
    targetSets?: number;
    targetReps?: number;
    notes?: string;
    sets?: {
      setIndex: number;
      targetReps?: number;
      targetSeconds?: number;
      restSeconds?: number;
    }[];
    exercise: ApiExercise;
  }[];
};

export type ApiSession = Clean<
  Pick<Schemas["Session"], "id" | "titleSnapshot" | "performedAt">
> & {
  plannedSessionId?: string;
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
};

export type ApiUserProfile = Clean<
  Pick<
    Schemas["UserProfile"],
    "id" | "level" | "xp" | "streakCurrent" | "streakBest" | "totalReps"
  >
> & {
  streakStartDate?: string;
};

/** Response from POST apply-stats; profile is always present, streak flags when gap > 14 days */
export type ApiApplyStatsResponse = Clean<
  Pick<Schemas["ApplyStatsResponseDto"], "streakBreakSuggested">
> & {
  profile: ApiUserProfile;
  daysSinceLastActivity?: number | null;
};
