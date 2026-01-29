import * as Crypto from "expo-crypto";
import {
  ExerciseCategory,
  ExerciseDifficulty,
  ExerciseEffect,
  ExerciseImpact,
  ExerciseUnit,
  ExerciseEquipment,
} from "./Enums";
import { Exercise, MuscleWork } from "./Types";

const generateId = () => {
  try {
    if (Crypto.randomUUID) {
      return Crypto.randomUUID();
    }
  } catch (e) {}
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const mw = (muscleDescription: string, impact: ExerciseImpact, effect: ExerciseEffect): MuscleWork => ({
  muscleDescription,
  impact,
  effect,
});

export const defaultExercises: Exercise[] = [
  // --- STRENGTH (PUSH / PULL / LEGS / CORE / NECK) ---
  {
    id: generateId(),
    name: "Push Up",
    category: ExerciseCategory.PUSH,
    difficulty: ExerciseDifficulty.BEGINNER,
    description: "Standard push up on the floor. Keep core tight and elbows at 45 degrees.",
    equipment: ExerciseEquipment.FLOOR,
    default_reps: 15,
    unit: ExerciseUnit.REPS,
    is_unilateral: false,
    muscleGroups: [
      mw("front_chest_lower", ExerciseImpact.PRIMARY, ExerciseEffect.TRAIN),
      mw("back_triceps", ExerciseImpact.SECONDARY, ExerciseEffect.TRAIN),
      mw("front_anterior_delts", ExerciseImpact.STABILIZER, ExerciseEffect.TRAIN),
    ],
  },
  {
    id: generateId(),
    name: "Pull Up",
    category: ExerciseCategory.PULL,
    difficulty: ExerciseDifficulty.INTERMEDIATE,
    description: "Classic overhand pull up. Pull chest to bar.",
    equipment: ExerciseEquipment.PULL_UP_BAR,
    default_reps: 8,
    unit: ExerciseUnit.REPS,
    is_unilateral: false,
    muscleGroups: [
      mw("back_lats", ExerciseImpact.PRIMARY, ExerciseEffect.TRAIN),
      mw("front_biceps", ExerciseImpact.SECONDARY, ExerciseEffect.TRAIN),
      mw("back_mid_traps", ExerciseImpact.STABILIZER, ExerciseEffect.TRAIN),
    ],
  },
  {
    id: generateId(),
    name: "Bodyweight Squat",
    category: ExerciseCategory.LEGS,
    difficulty: ExerciseDifficulty.BEGINNER,
    description: "Standard squat focusing on depth and upright posture.",
    equipment: ExerciseEquipment.FLOOR,
    default_reps: 20,
    unit: ExerciseUnit.REPS,
    is_unilateral: false,
    muscleGroups: [
      mw("front_quad_femoris", ExerciseImpact.PRIMARY, ExerciseEffect.TRAIN),
      mw("back_glutes", ExerciseImpact.SECONDARY, ExerciseEffect.TRAIN),
      mw("back_hamstrings", ExerciseImpact.STABILIZER, ExerciseEffect.TRAIN),
    ],
  },
  {
    id: generateId(),
    name: "Dead Bug",
    category: ExerciseCategory.CORE,
    difficulty: ExerciseDifficulty.BEGINNER,
    description: "Core stability exercise. Keep lower back pressed into floor.",
    equipment: ExerciseEquipment.FLOOR,
    default_reps: 12,
    unit: ExerciseUnit.REPS,
    is_unilateral: false,
    muscleGroups: [
      mw("front_abs", ExerciseImpact.PRIMARY, ExerciseEffect.TRAIN),
      mw("front_obliques", ExerciseImpact.SECONDARY, ExerciseEffect.TRAIN),
    ],
  },
  {
    id: generateId(),
    name: "Neck Extension",
    category: ExerciseCategory.NECK,
    difficulty: ExerciseDifficulty.BEGINNER,
    description: "Gentle neck extension for posterior muscle strength.",
    equipment: ExerciseEquipment.NONE,
    default_reps: 15,
    unit: ExerciseUnit.REPS,
    is_unilateral: false,
    muscleGroups: [
      mw("back_neck_extensors", ExerciseImpact.PRIMARY, ExerciseEffect.TRAIN),
      mw("back_neck_rotators", ExerciseImpact.SECONDARY, ExerciseEffect.TRAIN),
    ],
  },

  // --- MOVEMENT / RECOVERY ---
  {
    id: generateId(),
    name: "Deep Squat Hold",
    category: ExerciseCategory.STRETCH,
    difficulty: ExerciseDifficulty.BEGINNER,
    description: "Passive hold in deep squat for hip mobility.",
    equipment: ExerciseEquipment.NONE,
    default_reps: 60,
    unit: ExerciseUnit.SECS,
    is_unilateral: false,
    muscleGroups: [
      mw("back_glutes", ExerciseImpact.PRIMARY, ExerciseEffect.STRETCH),
      mw("front_hip_flexors", ExerciseImpact.SECONDARY, ExerciseEffect.STRETCH),
    ],
  },
  {
    id: generateId(),
    name: "Shoulder CARs",
    category: ExerciseCategory.MOBILITY,
    difficulty: ExerciseDifficulty.BEGINNER,
    description: "Controlled Articular Rotations for shoulder health.",
    equipment: ExerciseEquipment.NONE,
    default_reps: 5,
    unit: ExerciseUnit.REPS,
    is_unilateral: true,
    muscleGroups: [
      mw("front_anterior_delts", ExerciseImpact.PRIMARY, ExerciseEffect.MOBILITY),
      mw("front_side_delts", ExerciseImpact.SECONDARY, ExerciseEffect.MOBILITY),
      mw("back_rear_deltoids", ExerciseImpact.STABILIZER, ExerciseEffect.MOBILITY),
    ],
  },

  // --- CONDITIONING / SKILL ---
  {
    id: generateId(),
    name: "Jumping Jacks",
    category: ExerciseCategory.CARDIO,
    difficulty: ExerciseDifficulty.BEGINNER,
    description: "Total body cardiovascular movement.",
    equipment: ExerciseEquipment.FLOOR,
    default_reps: 50,
    unit: ExerciseUnit.REPS,
    is_unilateral: false,
    muscleGroups: [
      mw("back_calves", ExerciseImpact.PRIMARY, ExerciseEffect.TRAIN),
      mw("front_side_delts", ExerciseImpact.SECONDARY, ExerciseEffect.TRAIN),
    ],
  },
  {
    id: generateId(),
    name: "Handstand (Wall Support)",
    category: ExerciseCategory.SKILL,
    difficulty: ExerciseDifficulty.INTERMEDIATE,
    description: "Upper body strength and vertical balance skill.",
    equipment: ExerciseEquipment.NONE,
    default_reps: 30,
    unit: ExerciseUnit.SECS,
    is_unilateral: false,
    muscleGroups: [
      mw("front_side_delts", ExerciseImpact.PRIMARY, ExerciseEffect.ISOMETRIC),
      mw("back_triceps", ExerciseImpact.SECONDARY, ExerciseEffect.ISOMETRIC),
      mw("front_abs", ExerciseImpact.STABILIZER, ExerciseEffect.ISOMETRIC),
    ],
  },
];
