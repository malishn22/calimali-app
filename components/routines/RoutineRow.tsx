import { Routine } from "@/constants/Types";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface RoutineRowProps {
  routine: Routine;
  /** How many days this routine is currently scheduled on, if known. */
  scheduleLabel?: string;
  onPress: () => void;
  onDelete?: (id: string) => void;
}

export function RoutineRow({
  routine,
  scheduleLabel,
  onPress,
  onDelete,
}: RoutineRowProps) {
  const exCount = routine.exercises.length;
  const setCount = routine.exercises.reduce((sum, e) => sum + (e.sets || 0), 0);

  return (
    <Pressable
      onPress={onPress}
      className="flex-row justify-between items-center bg-card-dark rounded-2xl p-4 border border-zinc-800"
    >
      <View className="flex-row items-center bg-transparent flex-1">
        <View
          className="w-1 h-8 rounded-full mr-4"
          style={{ backgroundColor: routine.color }}
        />
        <View className="bg-transparent flex-1">
          <Text className="text-base font-bold mb-0.5 text-white" numberOfLines={1}>
            {routine.name}
          </Text>
          <Text className="text-zinc-400 text-xs">
            {exCount} {exCount === 1 ? "Exercise" : "Exercises"} • {setCount} Sets
            {scheduleLabel ? ` • ${scheduleLabel}` : ""}
          </Text>
        </View>
      </View>
      {onDelete && (
        <Pressable onPress={() => onDelete(routine.id)} hitSlop={12}>
          <FontAwesome name="trash" size={16} color="#3F3F46" />
        </Pressable>
      )}
    </Pressable>
  );
}
