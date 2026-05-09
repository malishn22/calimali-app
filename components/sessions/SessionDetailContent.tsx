import { palette } from "@/constants/Colors";
import { SessionHistory } from "@/constants/Types";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SessionPerformanceData {
  elapsedTime?: number;
  exercises?: Array<{
    name: string;
    reps: number | number[];
    sets?: number;
  }>;
}

interface SessionDetailContentProps {
  session: SessionHistory;
}

export default function SessionDetailContent({
  session,
}: SessionDetailContentProps) {
  const insets = useSafeAreaInsets();

  let parsedData: SessionPerformanceData = {};
  if (session?.performance_data) {
    try {
      parsedData =
        typeof session.performance_data === "string"
          ? (JSON.parse(session.performance_data) as SessionPerformanceData)
          : (session.performance_data as SessionPerformanceData);
    } catch {
      parsedData = {};
    }
  }

  const date = new Date(session.date).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const duration = parsedData.elapsedTime
    ? Math.floor(parsedData.elapsedTime / 60) +
      "m " +
      (parsedData.elapsedTime % 60) +
      "s"
    : "-";

  return (
    <ScrollView className="flex-1 bg-card-dark" contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}>
      {/* Header */}
      <View className="px-6 pt-4 pb-4 border-b border-zinc-800 flex-row justify-between items-start">
        <View>
          <Text className="text-zinc-400 font-bold text-xs uppercase tracking-wider mb-1">
            SESSION DETAILS
          </Text>
          <Text className="text-2xl font-bold text-white mb-1">
            Workout Session
          </Text>
          <Text className="text-zinc-500 text-sm font-semibold">{date}</Text>
        </View>
      </View>

      {/* Stats Bar */}
      <View className="flex-row border-b border-zinc-800">
        <View className="flex-1 p-4 items-center border-r border-zinc-800">
          <Feather
            name="clock"
            size={14}
            color={palette.electricBlue}
            style={{ marginBottom: 4 }}
          />
          <Text className="text-white font-bold">{duration}</Text>
          <Text className="text-[10px] text-zinc-500 font-bold uppercase">
            Duration
          </Text>
        </View>
        <View className="flex-1 p-4 items-center">
          <Feather
            name="layers"
            size={14}
            color={palette.emeraldGreen}
            style={{ marginBottom: 4 }}
          />
          <Text className="text-white font-bold">
            {parsedData?.exercises?.length || 0}
          </Text>
          <Text className="text-[10px] text-zinc-500 font-bold uppercase">
            Exercises
          </Text>
        </View>
      </View>

      {/* Exercises List */}
      <View style={{ padding: 24 }}>
        {parsedData?.exercises?.map((ex, idx) => (
          <View key={idx} className="mb-6">
            <Text className="text-lg font-bold text-white mb-3">
              {ex.name}
            </Text>
            <View className="bg-zinc-900 rounded-xl overflow-hidden">
              <View className="flex-row bg-zinc-800/50 p-2 border-b border-zinc-800">
                <Text className="flex-1 text-center text-zinc-500 font-bold text-[10px] uppercase">
                  Set
                </Text>
                <Text className="flex-1 text-center text-zinc-500 font-bold text-[10px] uppercase">
                  Reps
                </Text>
                <Text className="flex-1 text-center text-zinc-500 font-bold text-[10px] uppercase">
                  Weight
                </Text>
              </View>
              {Array.isArray(ex.reps) ? (
                ex.reps.map((r: number, sIdx: number) => (
                  <View
                    key={sIdx}
                    className="flex-row p-3 border-b border-zinc-800/50"
                  >
                    <Text className="flex-1 text-center text-zinc-400 font-bold text-xs">
                      {sIdx + 1}
                    </Text>
                    <Text className="flex-1 text-center text-white font-bold text-xs">
                      {r}
                    </Text>
                    <Text className="flex-1 text-center text-zinc-400 font-bold text-xs">
                      -
                    </Text>
                  </View>
                ))
              ) : (
                <View className="p-3">
                  <Text className="text-zinc-500 text-xs italic text-center">
                    {ex.sets} Sets x {ex.reps} Reps
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
