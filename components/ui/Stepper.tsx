import Colors from "@/constants/Colors";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, Text, View } from "react-native";

export interface StepperProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  containerClassName?: string;
  valueClassName?: string;
}

export function Stepper({
  value,
  onIncrement,
  onDecrement,
  min = 1,
  max,
  size = "md",
  showValue = true,
  containerClassName = "",
  valueClassName = "",
}: StepperProps) {
  const decrementDisabled = value <= min;
  const incrementDisabled = max !== undefined && value >= max;

  const handleDecrement = () => {
    if (!decrementDisabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onDecrement();
    }
  };

  const handleIncrement = () => {
    if (!incrementDisabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onIncrement();
    }
  };

  const sizeConfig = {
    sm: {
      button: "w-8 h-8 rounded-lg",
      icon: 12,
      valueWidth: "w-10",
      valueSize: "text-2xl",
      gap: "gap-3",
    },
    md: {
      button: "w-12 h-12 rounded-xl",
      icon: 16,
      valueWidth: "w-14",
      valueSize: "text-4xl",
      gap: "gap-4",
    },
    lg: {
      button: "w-16 h-16 rounded-3xl",
      icon: 16,
      valueWidth: "min-w-[80px]",
      valueSize: "text-5xl",
      gap: "gap-6",
    },
  };

  const config = sizeConfig[size];
  const iconColor = Colors.palette.white;

  return (
    <View
      className={`flex-row items-center ${config.gap} bg-zinc-800/50 p-2 rounded-2xl border border-zinc-700/50 ${containerClassName}`}
    >
      <Pressable
        onPress={handleDecrement}
        disabled={decrementDisabled}
        className={`${config.button} bg-zinc-700 items-center justify-center ${decrementDisabled ? "opacity-30" : "active:bg-zinc-600"}`}
      >
        <FontAwesome name="minus" size={config.icon} color={iconColor} />
      </Pressable>

      {showValue && (
        <Text
          className={`${config.valueWidth} ${config.valueSize} font-extrabold text-white text-center ${valueClassName}`}
        >
          {value}
        </Text>
      )}

      <Pressable
        onPress={handleIncrement}
        disabled={incrementDisabled}
        className={`${config.button} bg-zinc-700 items-center justify-center ${incrementDisabled ? "opacity-30" : "active:bg-zinc-600"}`}
      >
        <FontAwesome name="plus" size={config.icon} color={iconColor} />
      </Pressable>
    </View>
  );
}
