import Colors from "@/constants/Colors";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable } from "react-native";

interface BackButtonProps {
  onPress: () => void;
  size?: number;
  color?: string;
  hitSlop?: number | { top: number; bottom: number; left: number; right: number };
}

export function BackButton({
  onPress,
  size = 22,
  color = Colors.palette.silver,
  hitSlop = { top: 12, bottom: 12, left: 12, right: 12 },
}: BackButtonProps) {
  return (
    <Pressable onPress={onPress} hitSlop={hitSlop}>
      <Feather name="arrow-left" size={size} color={color} />
    </Pressable>
  );
}
