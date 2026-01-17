import { SessionExercise } from "@/services/Database";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface Props {
  exercise: SessionExercise;
  exerciseIndex: number;
  totalExercises: number;
  currentSetIndex: number;
  isSetCompleted: boolean;
  onEditSet: () => void;
}

export function ActiveSessionView({
  exercise,
  exerciseIndex,
  totalExercises,
  currentSetIndex,
  isSetCompleted,
  onEditSet,
}: Props) {
  return (
    <View className="flex-1 items-center justify-start pt-10 px-6">
      {/* Exercise Info */}
      <View className="items-center mb-12">
        <View className="bg-blue-500/20 px-3 py-1 rounded-full mb-4">
          <Text className="text-blue-500 text-xs font-bold uppercase tracking-wider">
            Push
          </Text>
        </View>
        <Text className="text-4xl text-center font-black text-white mb-2 leading-tight">
          {exercise.name}
        </Text>
        <Text className="text-zinc-500 text-center font-medium">
          {exerciseIndex + 1} of {totalExercises} — "Fundamental push against a
          wall."
        </Text>
      </View>

      {/* Set Card */}
      <View className="w-full px-6 items-center relative">
        <View className="flex-row items-center justify-center w-full relative">
          <View className="flex-row items-start">
            <Text className="text-6xl font-black text-white leading-none">
              {Array.isArray(exercise.reps)
                ? exercise.reps[currentSetIndex]
                : exercise.reps}
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
    </View>
  );
}
