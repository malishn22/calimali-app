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
  /** Position (default "bottom-right") */
  position?: "bottom-right" | "bottom-left";
  /** Bottom offset in px for footer clearance (default 96) */
  bottomOffset?: number;
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

  const positionClasses =
    position === "bottom-right" ? "right-6" : "left-6";

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        { bottom: bottomOffset },
        animatedStyle,
      ]}
      className={`absolute ${positionClasses} z-10 w-14 h-14 rounded-full bg-blue-500 items-center justify-center shadow-lg ${className}`}
    >
      <FontAwesome name={icon} size={20} color="white" />
    </AnimatedPressable>
  );
}
