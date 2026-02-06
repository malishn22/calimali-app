import MuscleMapView from "@/components/exercises/MuscleMapView";
import { Badge } from "@/components/ui/Badge";
import { SessionExercise } from "@/constants/Types";
import { FontAwesome } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Pressable, Text, View } from "react-native";

interface Props {
  exercise: SessionExercise;
  exerciseIndex: number;
  totalExercises: number;
  currentSetIndex: number;
  totalSets: number;
  isSetCompleted: boolean;
  onEditSet: () => void;
  side?: "LEFT" | "RIGHT";
  currentReps: number;
}

export function ActiveSessionView({
  exercise,
  exerciseIndex,
  totalExercises,
  currentSetIndex,
  totalSets,
  isSetCompleted,
  onEditSet,
  side,
  currentReps,
}: Props) {
  const NECK_MUSCLE_GROUPS = [
    "front_neck_flexors",
    "front_neck_rotators",
    "front_neck_lateral_flexors",
    "back_neck_extensors",
    "back_neck_lateral_extensors",
    "back_neck_rotators",
  ];

  const isNeckExercise = useMemo(() => {
    if (!exercise?.muscleGroups) return false;
    return exercise.muscleGroups.some((group) =>
      NECK_MUSCLE_GROUPS.includes(group.muscleDescription)
    );
  }, [exercise?.muscleGroups]);

  return (
    <View className="flex-1 items-center justify-start pt-10 px-6">
      {/* Exercise Info */}
      <View className="items-center mb-12">
        <Badge label="Push" color="#3B82F6" size="md" className="mb-4" />

        <Text className="text-4xl text-center font-black text-white mb-2 leading-tight">
          {exercise.name}
        </Text>

        {exercise.description && (
          <Text className="text-zinc-400 text-center text-sm px-4 leading-relaxed mb-4">
            {exercise.description}
          </Text>
        )}
      </View>

      {/* Set Card */}
      <View className="w-full px-6 items-center relative">
        <View className="flex-row items-center justify-center w-full relative">
          <View className="flex-row items-start">
            <Text className="text-6xl font-black text-white leading-none">
              {currentReps ?? "-"}
            </Text>
            <Text className="text-zinc-500 font-bold ml-2 text-lg">REPS</Text>
          </View>
          <Pressable
            onPress={onEditSet}
            className="absolute right-8 w-12 h-12 bg-zinc-800 rounded-full items-center justify-center"
          >
            <FontAwesome name="pencil" size={16} color="#71717a" />
          </Pressable>
        </View>
      </View>

      {/* Muscle Map - Body or Neck according to exercise targets */}
      <View className="flex-1 justify-center items-center mb-8">
        <MuscleMapView
          muscleGroups={exercise.muscleGroups || []}
          displayMode={isNeckExercise ? "neck" : "body"}
          height={300}
        />
      </View>
    </View>
  );
}
