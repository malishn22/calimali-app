import { Exercise } from "@/constants/Types";
import { API_URL, headers } from "./config";
import { ApiExercise } from "./types";

export const getExercises = async (): Promise<Exercise[]> => {
  try {
    const response = await fetch(`${API_URL}/exercises`);
    if (!response.ok) throw new Error("Failed to fetch exercises");
    const data: ApiExercise[] = await response.json();

    return data.map((e) => ({
      id: e.id,
      name: e.name,
      category: e.category as any,
      difficulty: e.difficulty as any,
      description: e.description || "",
      equipment: e.equipment as any,
      default_reps: e.defaultReps,
      unit: e.unit as any,
      is_unilateral: e.isUnilateral,
      muscleGroups: e.exerciseMuscleGroups
        ? e.exerciseMuscleGroups.map((g) => ({
            muscleDescription: g.muscleGroup.code,
            impact: g.impact as any,
            effect: g.effect as any,
          }))
        : [],
    }));
  } catch (error) {
    return [];
  }
};

export const getExercise = async (id: string): Promise<Exercise | null> => {
  try {
    const response = await fetch(`${API_URL}/exercises/${id}`);
    if (!response.ok) return null;
    const e: ApiExercise = await response.json();

    return {
      id: e.id,
      name: e.name,
      category: e.category as any,
      difficulty: e.difficulty as any,
      description: e.description || "",
      equipment: e.equipment as any,
      default_reps: e.defaultReps,
      unit: e.unit as any,
      is_unilateral: e.isUnilateral,
      muscleGroups: e.exerciseMuscleGroups
        ? e.exerciseMuscleGroups.map((g) => ({
            muscleDescription: g.muscleGroup.code,
            impact: g.impact as any,
            effect: g.effect as any,
          }))
        : [],
    };
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
      category: exercise.category,
      difficulty: exercise.difficulty,
      description: exercise.description,
      equipment: exercise.equipment,
      defaultReps: exercise.default_reps,
      unit: exercise.unit,
      isUnilateral: exercise.is_unilateral,
      isDefault: false,
      exerciseMuscleGroups: exercise.muscleGroups
        ? exercise.muscleGroups.map((mw) => ({
            muscleGroup: { code: mw.muscleDescription, side: "Both" },
            impact: mw.impact,
            effect: mw.effect,
          }))
        : [],
    };

    const response = await fetch(`${API_URL}/exercises`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error("Failed to create exercise");
    const e: ApiExercise = await response.json();

    return {
      id: e.id,
      name: e.name,
      category: e.category as any,
      difficulty: e.difficulty as any,
      description: e.description || "",
      equipment: e.equipment as any,
      default_reps: e.defaultReps,
      unit: e.unit as any,
      is_unilateral: e.isUnilateral,
      muscleGroups: e.exerciseMuscleGroups
        ? e.exerciseMuscleGroups.map((g) => ({
            muscleDescription: g.muscleGroup.code,
            impact: g.impact as any,
            effect: g.effect as any,
          }))
        : [],
    };
  } catch (e) {
    return null;
  }
};
