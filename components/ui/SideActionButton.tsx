import Colors from "@/constants/Colors";
import { FAB_BOTTOM_OFFSET, FAB_EDGE_OFFSET } from "@/constants/Layout";
import { FontAwesome } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface SideActionButtonProps {
  /** FontAwesome icon name (default "plus") */
  icon?: keyof typeof FontAwesome.glyphMap;
  onPress: () => void;
  /** Which bottom corner the button floats in (default "bottom-right") */
  position?: "bottom-right" | "bottom-left";
  /** Distance from the bottom of the container (defaults to FAB_BOTTOM_OFFSET) */
  bottomOffset?: number;
  /** Distance from the left/right screen edge (defaults to FAB_EDGE_OFFSET) */
  edgeOffset?: number;
  /** Diameter: "sm" = 44px, "md" = 56px (default) */
  size?: "sm" | "md";
  className?: string;
}

/**
 * Circular floating action button, anchored to a bottom corner of its container.
 * Use for the primary add/create action on a screen.
 */
export function SideActionButton({
  icon = "plus",
  onPress,
  position = "bottom-right",
  bottomOffset = FAB_BOTTOM_OFFSET,
  edgeOffset = FAB_EDGE_OFFSET,
  size = "md",
  className = "",
}: SideActionButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withTiming(0.96, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 80, stiffness: 1500 });
  };

  const isRight = position === "bottom-right";
  const diameter = size === "sm" ? 44 : 56;
  const iconSize = size === "sm" ? 18 : 24;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        animatedStyle,
        {
          position: "absolute",
          zIndex: 10,
          bottom: bottomOffset,
          [isRight ? "right" : "left"]: edgeOffset,
        },
      ]}
    >
      <View
        style={{
          width: diameter,
          height: diameter,
          borderRadius: diameter / 2,
          backgroundColor: Colors.palette.burntOrange,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: 6,
        }}
        className={className}
      >
        <FontAwesome name={icon} size={iconSize} color="white" />
      </View>
    </AnimatedPressable>
  );
}
