import { ScheduledEntry } from "@/constants/Types";
import { formatRecurrence } from "@/utilities/recurrence";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface PlannerSessionRowProps {
  entry: ScheduledEntry;
  isCompleted?: boolean;
  /** Opens the routine behind this row for editing. */
  onPress: () => void;
  /** Opens this placement's recurrence for editing. */
  onLongPress?: () => void;
  /** Removes the calendar placement only — the routine itself is kept. */
  onRemove: () => void;
}

export function PlannerSessionRow({
  entry,
  isCompleted = false,
  onPress,
  onLongPress,
  onRemove,
}: PlannerSessionRowProps) {
  const { routine, plannedSession } = entry;
  const exCount = routine.exercises.length;

  return (
    <Pressable
      onPress={isCompleted ? undefined : onPress}
      onLongPress={isCompleted ? undefined : onLongPress}
      disabled={isCompleted}
      className={`flex-row justify-between items-center bg-card-dark rounded-2xl p-4 mb-3 border ${isCompleted ? "border-green-500/50 opacity-90" : "border-zinc-800"}`}
    >
      <View className="flex-row items-center bg-transparent flex-1">
        <View
          className="w-1 h-8 rounded-full mr-4"
          style={{ backgroundColor: routine.color }}
        />
        <View className="bg-transparent flex-1">
          <Text
            className={`text-base font-bold mb-0.5 ${isCompleted ? "text-zinc-400 line-through" : "text-white"}`}
            numberOfLines={1}
          >
            {routine.name}
          </Text>
          <Text className="text-zinc-400 text-xs">
            {exCount} {exCount === 1 ? "Exercise" : "Exercises"} •{" "}
            {formatRecurrence(plannedSession)}
            {isCompleted ? " • Completed" : ""}
          </Text>
        </View>
      </View>
      {!isCompleted && (
        <Pressable onPress={onRemove} hitSlop={12}>
          <FontAwesome name="trash" size={16} color="#3F3F46" />
        </Pressable>
      )}
    </Pressable>
  );
}
