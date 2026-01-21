import { ScheduledSession } from "@/constants/Types";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { Pressable, Text, View } from "react-native";

import { SessionColors } from "@/constants/Colors";

interface SessionCardProps {
  session: ScheduledSession;
  onPress?: () => void;
  isCompleted?: boolean;
}

// Map SessionColors (Bright) to Mid-Dark Variants (700-ish) for smoother Gradient
const GradientMap: Record<string, string> = {
  [SessionColors.BLUE]: "#1D4ED8", // Blue 700
  [SessionColors.GREEN]: "#15803D", // Green 700
  [SessionColors.RED]: "#B91C1C", // Red 700
  [SessionColors.ORANGE]: "#C2410C", // Orange 700
  [SessionColors.PURPLE]: "#7E22CE", // Purple 700
  [SessionColors.PINK]: "#BE185D", // Pink 700
};

export default function SessionCard({
  session,
  onPress,
  isCompleted = false,
}: SessionCardProps) {
  const gradientStart = GradientMap[session.color] || session.color; // Fallback

  const totalSets = useMemo(() => {
    try {
      const exercises = JSON.parse(session.exercises);
      return exercises.reduce(
        (acc: number, ex: any) =>
          acc + (typeof ex.sets === "number" ? ex.sets : ex.sets?.length || 0),
        0,
      );
    } catch {
      return 0;
    }
  }, [session.exercises]);

  return (
    <Pressable
      onPress={isCompleted ? undefined : onPress}
      disabled={isCompleted}
      className={`mb-5 ${
        isCompleted ? "opacity-90" : "active:scale-95 active:opacity-90"
      }`}
    >
      <LinearGradient
        colors={
          isCompleted
            ? ["#2f2f35", "#18181b"] // Subtle dark gradient, almost black but with hint
            : [gradientStart, "#1E1E22"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className={`p-5 rounded-3xl w-full h-40 justify-between ${
          isCompleted ? "border border-green-500" : ""
        }`}
      >
        <View className="flex-row justify-between items-start">
          <Text
            className={`text-2xl font-bold text-white max-w-[80%] ${
              isCompleted ? "text-zinc-400 line-through" : ""
            }`}
          >
            {session.title}
          </Text>
          {isCompleted && (
            <View className="bg-green-500/15 py-1.5 px-3 rounded-xl border border-green-500/30">
              <Text className="text-[10px] font-extrabold text-green-500 tracking-wider">
                COMPLETED
              </Text>
            </View>
          )}
        </View>

        <View className="flex-row justify-between items-center">
          <View
            className={`flex-row items-center bg-zinc-900 py-2.5 px-4 rounded-2xl ${
              isCompleted ? "opacity-40" : ""
            }`}
          >
            <View>
              <Text className="text-[10px] text-zinc-400 font-bold mb-0.5 uppercase">
                EXP
              </Text>
              <Text className="text-sm text-white font-bold">
                +{totalSets * 10}
              </Text>
            </View>
            <View className="w-[1px] h-5 bg-zinc-700 mx-3" />
            <View>
              <Text className="text-[10px] text-zinc-400 font-bold mb-0.5 uppercase">
                VOLUME
              </Text>
              <Text className="text-sm text-white font-bold">
                {totalSets} Sets
              </Text>
            </View>
          </View>

          {isCompleted ? (
            <View className="w-12 h-12 rounded-full bg-green-500 items-center justify-center shadow-lg shadow-green-500/40">
              <FontAwesome name="check" size={20} color="#000" />
            </View>
          ) : (
            <View
              className="w-12 h-12 rounded-2xl items-center justify-center"
              style={{ backgroundColor: session.color }}
            >
              <FontAwesome
                name="play"
                size={16}
                color="#fff" // White icon as requested
                style={{ marginLeft: 2 }}
              />
            </View>
          )}
        </View>
      </LinearGradient>
    </Pressable>
  );
}
