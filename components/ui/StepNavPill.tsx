import Colors from "@/constants/Colors";
import { BOTTOM_BAR_ACTION_HEIGHT } from "@/constants/Layout";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, View } from "react-native";

interface StepNavPillProps {
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

export function StepNavPill({
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
}: StepNavPillProps) {
  const handlePrevious = () => {
    if (!canGoPrevious) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPrevious();
  };

  const handleNext = () => {
    if (!canGoNext) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onNext();
  };

  return (
    <View
      className="flex-row items-center bg-zinc-800 rounded-xl overflow-hidden"
      style={{ height: BOTTOM_BAR_ACTION_HEIGHT, minHeight: BOTTOM_BAR_ACTION_HEIGHT }}
    >
      <Pressable
        onPress={handlePrevious}
        disabled={!canGoPrevious}
        className={`w-10 h-full items-center justify-center ${
          canGoPrevious ? "active:bg-zinc-700" : "opacity-30"
        }`}
      >
        <FontAwesome name="chevron-left" size={14} color={Colors.palette.silver} />
      </Pressable>
      <View className="w-px h-1/2 bg-zinc-700" />
      <Pressable
        onPress={handleNext}
        disabled={!canGoNext}
        className={`w-10 h-full items-center justify-center ${
          canGoNext ? "active:bg-zinc-700" : "opacity-30"
        }`}
      >
        <FontAwesome name="chevron-right" size={14} color={Colors.palette.silver} />
      </Pressable>
    </View>
  );
}
