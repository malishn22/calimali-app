import { SessionExercise } from "@/services/Database";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
// Ideally EditSetModal should also be moved/refactored, assuming it's already in components/LiveSession/EditSetModal.tsx from previous step.
// We just need to ensure the import path is correct relative to this file.
// Since we are in components/LiveSession/ExerciseActiveView.tsx, and EditSetModal is in components/LiveSession/EditSetModal.tsx
// formatting import { EditSetModal } from "./EditSetModal" works if we move the file or if we keep it there.

interface Props {
  exercise: SessionExercise;
  exerciseIndex: number;
  totalExercises: number;
  completedSets: Record<string, boolean>;
  onToggleSet: (key: string) => void;
}

export function ExerciseActiveView({
  exercise,
  exerciseIndex,
  totalExercises,
  completedSets,
  onToggleSet,
}: Props) {
  // We can add "Edit Set" logic here if needed, keeping it simple for now as per "refactor" scope.
  // The original LiveSession had complex Edit Modal logic.
  // For this componentization, we'll focus on the display first.
  // If editing is required, we can add local state or hoist it to index.

  return (
    <ScrollView className="flex-1 p-6">
      <Text className="text-zinc-500 font-bold text-xs uppercase tracking-widest mb-2">
        Exercise {exerciseIndex + 1} of {totalExercises}
      </Text>
      <Text className="text-4xl font-black text-white mb-10 leading-10">
        {exercise.name}
      </Text>

      {/* Sets Grid */}
      <View className="gap-4">
        {Array.from({ length: exercise.sets }).map((_, i) => {
          const setKey = `${exerciseIndex}-${i}`;
          const isCompleted = completedSets[setKey];

          return (
            <Pressable
              key={i}
              onPress={() => onToggleSet(setKey)}
              className={`flex-row items-center justify-between p-5 rounded-2xl border-2 ${
                isCompleted
                  ? "bg-green-500/10 border-green-500"
                  : "bg-card-dark border-transparent"
              }`}
            >
              <View className="flex-row items-center gap-4">
                <View
                  className={`w-8 h-8 rounded-full items-center justify-center ${
                    isCompleted ? "bg-green-500" : "bg-zinc-800"
                  }`}
                >
                  <Text
                    className={`font-bold text-xs ${
                      isCompleted ? "text-black" : "text-zinc-400"
                    }`}
                  >
                    {i + 1}
                  </Text>
                </View>
                <Text
                  className={`text-xl font-bold ${
                    isCompleted ? "text-green-500" : "text-white"
                  }`}
                >
                  {exercise.reps}{" "}
                  <Text className="text-sm text-zinc-500 font-normal">
                    REPS
                  </Text>
                </Text>
              </View>

              {isCompleted && (
                <FontAwesome name="check" size={20} color="#22C55E" />
              )}
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
