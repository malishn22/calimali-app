import { SessionExercise } from "@/constants/Types";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface Props {
  exercise: SessionExercise;
  exerciseIndex: number;
  totalExercises: number;
  currentSetIndex: number;
  isSetCompleted: boolean;
  onEditSet: () => void;
  side?: "LEFT" | "RIGHT";
  // New: Pass resolved reps directly
  currentReps: number;
}

export function ActiveSessionView({
  exercise,
  exerciseIndex,
  totalExercises,
  currentSetIndex,
  isSetCompleted,
  onEditSet,
  side,
  currentReps,
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

        {exercise.is_unilateral && (
          <View className="mb-4 flex-row items-center bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            <MaterialCommunityIcons
              name="alpha-u-box"
              size={14}
              color="#3B82F6"
              style={{ marginRight: 6 }}
            />
            <Text className="text-blue-500 font-bold text-[10px] tracking-widest uppercase">
              Unilateral
            </Text>
          </View>
        )}
        <Text className="text-4xl text-center font-black text-white mb-2 leading-tight">
          {exercise.name}
        </Text>
        <Text className="text-zinc-500 text-center font-medium">
          {exerciseIndex + 1} of {totalExercises} — "Fundamental push against a
          wall."
        </Text>
      </View>

      {/* Side Indicator */}
      {side && (
        <View
          className={`mb-8 px-6 py-2 rounded-xl border ${
            side === "LEFT"
              ? "bg-blue-500/10 border-blue-500/30"
              : "bg-purple-500/10 border-purple-500/30"
          }`}
        >
          <Text
            className={`text-2xl font-black tracking-widest text-center ${
              side === "LEFT" ? "text-blue-500" : "text-purple-500"
            }`}
          >
            {side} SIDE
          </Text>
        </View>
      )}

      {/* Set Card */}
      <View className="w-full px-6 items-center relative">
        <View className="flex-row items-center justify-center w-full relative">
          <View className="flex-row items-start">
            <Text className="text-6xl font-black text-white leading-none">
              {currentReps}
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
