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

export type ApiRoutineExercise = Clean<
  Pick<Schemas["RoutineExercise"], "exerciseId" | "orderIndex">
> & {
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
};

/** The reusable template. Carries no scheduling — see {@link ApiPlannedSession}. */
export type ApiRoutine = Clean<
  Pick<Schemas["Routine"], "id" | "name" | "color">
> & {
  exercises: ApiRoutineExercise[];
};

/**
 * A calendar placement of a routine. `startDate`/`endDate` are `YYYY-MM-DD`; they are
 * inside the `Pick` because the backend maps DateOnly to a string schema explicitly.
 */
export type ApiPlannedSession = Clean<
  Pick<
    Schemas["PlannedSession"],
    "id" | "routineId" | "startDate" | "recurrenceType" | "daysOfWeek"
  >
> & {
  // Genuinely nullable on the wire, so these keep their optionality instead of going
  // through Clean — but they still index the schema, so a backend rename breaks tsc.
  endDate?: Schemas["PlannedSession"]["endDate"];
  intervalDays?: Schemas["PlannedSession"]["intervalDays"];
};

export type ApiSession = Clean<
  Pick<Schemas["Session"], "id" | "titleSnapshot" | "performedAt">
> & {
  /** Null for an ad-hoc workout that was not started from a routine. */
  routineId?: Schemas["Session"]["routineId"];
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

export type ApiLoginRequest = Clean<
  Pick<Schemas["LoginRequest"], "username" | "password">
>;

export type ApiLoginResponse = Clean<
  Pick<Schemas["LoginResponse"], "token" | "expiresAt">
>;
