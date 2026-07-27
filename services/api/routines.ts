import { Routine, SessionExercise } from "@/constants/Types";
import { apiFetch } from "./config";
import { ApiRoutine } from "./types";

/** Shape sent to POST/PUT /routines. */
const toRequestBody = (routine: Pick<Routine, "name" | "color" | "exercises">) => ({
  name: routine.name,
  color: routine.color,
  exercises: routine.exercises.map((e, idx) => ({
    exerciseId: e.exerciseId,
    orderIndex: idx,
    targetSets: e.sets,
    targetReps: Array.isArray(e.reps) ? e.reps[0] : e.reps,
    sets: Array.isArray(e.reps)
      ? e.reps.map((r, i) => ({
          setIndex: i,
          targetReps: r,
          targetSeconds: 0,
          restSeconds: 0,
        }))
      : Array.from({ length: e.sets || 1 }).map((_, i) => ({
          setIndex: i,
          targetReps: e.reps,
          targetSeconds: 0,
          restSeconds: 0,
        })),
  })),
});

const fromApi = (r: ApiRoutine): Routine => ({
  id: r.id,
  name: r.name,
  color: r.color,
  exercises: (r.exercises ?? []).map((e): SessionExercise => ({
    exerciseId: e.exerciseId,
    name: e.exercise?.name || "Unknown Exercise",
    description: e.exercise?.description,
    categorySlug: e.exercise?.category?.slug,
    muscleGroups: e.exercise?.exerciseMuscleGroups?.map((mg: any) => ({
      muscleDescription: mg.muscleGroup?.code,
      impact: mg.impact as any,
      effect: mg.effect as any,
    })),
    isUnilateral: e.exercise?.isUnilateral,
    // A unilateral exercise stores two rows per logical set (left, right), so the set
    // count halves while the per-set reps array stays as-is.
    sets:
      e.sets && e.sets.length > 0
        ? e.exercise?.isUnilateral
          ? Math.ceil(e.sets.length / 2)
          : e.sets.length
        : e.targetSets || 3,
    reps:
      e.sets && e.sets.length > 0
        ? e.sets
            .slice()
            .sort((a, b) => a.setIndex - b.setIndex)
            .map((s) => s.targetReps || 0)
        : e.targetReps || 10,
  })),
});

export const getRoutines = async (): Promise<Routine[]> => {
  try {
    const response = await apiFetch("/routines");
    if (!response.ok) throw new Error("Failed to fetch routines");
    const data: ApiRoutine[] = await response.json();
    return data.map(fromApi);
  } catch (error) {
    return [];
  }
};

export const getRoutine = async (id: string): Promise<Routine | null> => {
  try {
    const response = await apiFetch(`/routines/${id}`);
    if (!response.ok) throw new Error("Failed to fetch routine");
    return fromApi(await response.json());
  } catch (error) {
    return null;
  }
};

export const createRoutine = async (
  routine: Pick<Routine, "name" | "color" | "exercises">,
): Promise<Routine> => {
  const response = await apiFetch("/routines", {
    method: "POST",
    body: JSON.stringify(toRequestBody(routine)),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to create routine: ${response.status} ${text}`);
  }

  return fromApi(await response.json());
};

/**
 * Updates in place, keeping the routine id — which is what lets every schedule pointing
 * at it, and every completed session recorded against it, survive an edit.
 */
export const updateRoutine = async (routine: Routine): Promise<Routine> => {
  const response = await apiFetch(`/routines/${routine.id}`, {
    method: "PUT",
    body: JSON.stringify(toRequestBody(routine)),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to update routine: ${response.status} ${text}`);
  }

  return fromApi(await response.json());
};

export const deleteRoutine = async (id: string) => {
  const response = await apiFetch(`/routines/${id}`, { method: "DELETE" });
  if (!response.ok) {
    throw new Error("Failed to delete routine");
  }
};
