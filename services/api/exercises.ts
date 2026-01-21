import { Exercise } from "@/constants/Types";
import { API_URL, headers } from "./config";
import { ApiExercise } from "./types";

export const getExercises = async (): Promise<Exercise[]> => {
  try {
    const response = await fetch(`${API_URL}/exercises`);
    if (!response.ok) throw new Error("Failed to fetch exercises");
    const data: ApiExercise[] = await response.json();

    // Map to frontend Exercise type
    return data.map((e) => ({
      id: e.id,
      name: e.name,
      category: e.category as any, // Cast to enum
      difficulty: e.difficulty as any,
      description: e.description || "",
      equipment: e.equipment as any,
      default_reps: e.defaultReps,
      unit: e.unit as any,
      is_unilateral: e.isUnilateral,
    }));
  } catch (error) {
    console.error(error);
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
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const postExercise = async (
  exercise: Partial<Exercise>,
): Promise<Exercise | null> => {
  try {
    // Transform to backend DTO
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
      muscleGroups: [], // For now empty, as UI doesn't allow selecting them yet
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
    };
  } catch (e) {
    console.error(e);
    return null;
  }
};
