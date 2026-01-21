import { ScheduledSession } from "@/constants/Types";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface SessionCardProps {
  session: ScheduledSession;
  onPress: () => void;
  onDelete: (id: string) => void;
}

export function PlannerSessionRow({
  session,
  onPress,
  onDelete,
}: SessionCardProps) {
  const exCount = JSON.parse(session.exercises || "[]").length;

  return (
    <Pressable
      onPress={onPress}
      className="flex-row justify-between items-center bg-card-dark rounded-2xl p-4 mb-3 border border-zinc-800"
    >
      <View className="flex-row items-center bg-transparent">
        <View
          className="w-1 h-8 rounded-full mr-4"
          style={{ backgroundColor: session.color }}
        />
        <View className="bg-transparent">
          <Text className="text-white text-base font-bold mb-0.5">
            {session.title}
          </Text>
          <Text className="text-zinc-400 text-xs">
            {exCount} Exercises • {session.frequency}
          </Text>
        </View>
      </View>
      <Pressable onPress={() => onDelete(session.id)}>
        <FontAwesome name="trash" size={16} color="#3F3F46" />
      </Pressable>
    </Pressable>
  );
}
