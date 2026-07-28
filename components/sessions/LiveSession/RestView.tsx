import { CircularTimer } from "@/components/ui/CircularTimer";
import Colors from "@/constants/Colors";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface RestViewProps {
  remainingSeconds: number;
  totalSeconds: number;
  onSkip: () => void;
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function RestView({ remainingSeconds, totalSeconds, onSkip }: RestViewProps) {
  const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;

  return (
    <View className="flex-1 items-center justify-center px-6">
      <Text className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-8">
        Rest
      </Text>

      <CircularTimer
        progress={progress}
        label={formatTime(remainingSeconds)}
        color={Colors.palette.silver}
      />

      <Pressable onPress={onSkip} hitSlop={12} className="mt-10 px-4 py-2">
        <Text className="text-zinc-400 font-bold text-sm uppercase tracking-widest">
          Skip
        </Text>
      </Pressable>
    </View>
  );
}
