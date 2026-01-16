import Colors from "@/constants/Colors";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface Props {
  title: string;
  elapsedTime: number;
  progress: number;
  onClose: () => void;
}

export function SessionHeader({
  title,
  elapsedTime,
  progress,
  onClose,
}: Props) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <View className="px-6 py-4 border-b border-zinc-800 bg-background-dark z-10">
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">
            Now Training
          </Text>
          <Text className="text-xl font-extrabold text-white">{title}</Text>
        </View>
        <Pressable
          onPress={onClose}
          className="w-8 h-8 rounded-full bg-zinc-800 items-center justify-center"
        >
          <FontAwesome name="close" size={14} color={Colors.palette.zinc400} />
        </Pressable>
      </View>

      <View className="flex-row items-center gap-4">
        <View className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <View
            className="h-full bg-yellow-400 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </View>
        <Text className="text-white font-mono font-bold text-sm tracking-widest">
          {formatTime(elapsedTime)}
        </Text>
      </View>
    </View>
  );
}
