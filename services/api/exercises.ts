import { Exercise } from "@/constants/Types";
import { apiFetch } from "./config";
import { ApiExercise } from "./types";

export const getExerciseCategories = async (): Promise<any[]> => {
  const response = await apiFetch("/exercise-categories");
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Fetch Failed (${response.status}): ${text.substring(0, 100)}`);
  }
  return await response.json();
};

export const getExercises = async (): Promise<Exercise[]> => {
  // try-catch removed to allow UI to handle errors
  const response = await apiFetch("/exercises");
  if (!response.ok) throw new Error("Failed to fetch exercises");
  const data: ApiExercise[] = await response.json();

  return data.map((e) => ({
    id: e.id,
    name: e.name,
    category: e.category, // Now matches ExerciseCategoryModel
    difficulty: e.difficulty as any,
    description: e.description || "",
    equipment: e.equipment as any,
    defaultReps: e.defaultReps,
    unit: e.unit as any,
    isUnilateral: e.isUnilateral,
    muscleGroups: e.exerciseMuscleGroups
      ? e.exerciseMuscleGroups.map((g) => ({
          muscleDescription: g.code,
          impact: g.impact as any,
          effect: g.effect as any,
        }))
      : [],
  }));
};

export const getExercise = async (id: string): Promise<Exercise | null> => {
  try {
    const response = await apiFetch(`/exercises/${id}`);
    if (!response.ok) return null;
    const e: ApiExercise = await response.json();

    const mapToExercise = (apiEx: ApiExercise): Exercise => ({
        id: apiEx.id,
        name: apiEx.name,
        category: apiEx.category,
        baseExerciseId: apiEx.baseExerciseId,
        difficulty: apiEx.difficulty as any,
        description: apiEx.description || "",
        equipment: apiEx.equipment as any,
        defaultReps: apiEx.defaultReps,
        unit: apiEx.unit as any,
        isUnilateral: apiEx.isUnilateral,
        muscleGroups: apiEx.exerciseMuscleGroups
          ? apiEx.exerciseMuscleGroups.map((g) => ({
              muscleDescription: g.code,
              impact: g.impact as any,
              effect: g.effect as any,
            }))
          : [],
    });

    const result = mapToExercise(e);
    if (e.baseExercise) result.baseExercise = mapToExercise(e.baseExercise);
    if (e.variants) result.variants = e.variants.map(mapToExercise);

    return result;
  } catch (error) {
    return null;
  }
};

export const postExercise = async (
  exercise: Partial<Exercise>,
): Promise<Exercise | null> => {
  try {
    const body = {
      name: exercise.name,
      category: exercise.category?.slug, // Send slug or ID. If UI sends whole object, take slug.
      categoryId: exercise.category?.id, // Send ID if available
      difficulty: exercise.difficulty,
      description: exercise.description,
      equipment: exercise.equipment,
      defaultReps: exercise.defaultReps,
      unit: exercise.unit,
      isUnilateral: exercise.isUnilateral,
      isDefault: false,
      baseExerciseId: exercise.baseExerciseId,
      exerciseMuscleGroups: exercise.muscleGroups
        ? exercise.muscleGroups.map((mw) => ({
            code: mw.muscleDescription,
            impact: mw.impact,
            effect: mw.effect,
          }))
        : [],
    };

    const response = await apiFetch("/exercises", {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error("Failed to create exercise");
    const e: ApiExercise = await response.json();

    return {
      id: e.id,
      name: e.name,
      category: e.category,
      difficulty: e.difficulty as any,
      description: e.description || "",
      equipment: e.equipment as any,
      defaultReps: e.defaultReps,
      unit: e.unit as any,
      isUnilateral: e.isUnilateral,
      muscleGroups: e.exerciseMuscleGroups
        ? e.exerciseMuscleGroups.map((g) => ({
            muscleDescription: g.code,
            impact: g.impact as any,
            effect: g.effect as any,
          }))
        : [],
    };
  } catch (e) {
    return null;
  }
};
