import { FontAwesome } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface FABProps {
  /** FontAwesome icon name (default "plus") */
  icon?: keyof typeof FontAwesome.glyphMap;
  onPress: () => void;
  /** Position: floating bottom corners, or inline (no absolute, for layout embedding) */
  position?: "bottom-right" | "bottom-left" | "inline";
  /** Bottom offset in px for footer clearance when floating (default 96) */
  bottomOffset?: number;
  /** Size when inline: "sm" | "md" (default "md" = 56px, "sm" = 40px) */
  size?: "sm" | "md";
  className?: string;
}

/**
 * Floating Action Button. Use for primary add/create actions.
 * Shared across Planner and SessionWizard for consistent UX.
 */
export function FAB({
  icon = "plus",
  onPress,
  position = "bottom-right",
  bottomOffset = 96,
  size = "md",
  className = "",
}: FABProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 80, stiffness: 1500 });
  };

  const isInline = position === "inline";
  const sizeClasses = size === "sm" ? "w-10 h-10" : "w-14 h-14";
  const iconSize = size === "sm" ? 18 : 20;

  const positionClasses =
    position === "bottom-right" ? "right-6" : position === "bottom-left" ? "left-6" : "";

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[!isInline && { bottom: bottomOffset }, animatedStyle]}
      className={`${isInline ? "" : "absolute"} ${positionClasses} ${isInline ? "" : "z-10"} ${sizeClasses} rounded-full bg-blue-500 items-center justify-center shadow-lg ${className}`}
    >
      <FontAwesome name={icon} size={iconSize} color="white" />
    </AnimatedPressable>
  );
}
