import Colors from "@/constants/Colors";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Pressable, View } from "react-native";

interface Props {
  onOpenOverview: () => void;
}

export function SessionHeader({ onOpenOverview }: Props) {
  return (
    <View className="px-6 py-4 border-t border-zinc-800 bg-background-dark z-10 items-end">
      <Pressable
        onPress={onOpenOverview}
        className="w-8 h-8 rounded-full bg-zinc-700 items-center justify-center"
      >
        <FontAwesome name="list" size={14} color={Colors.palette.white} />
      </Pressable>
    </View>
  );
}
