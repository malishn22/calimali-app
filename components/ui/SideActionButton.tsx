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
  /** Position: attached to screen edge or inline in layout */
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left" | "inline";
  /** Bottom offset in px for footer clearance when bottom edge (default 96) */
  bottomOffset?: number;
  /** Top offset in px for top-edge positions (e.g. below header) */
  topOffset?: number;
  /** Size: "sm" = compact, "md" = default pill */
  size?: "sm" | "md";
  className?: string;
}

/**
 * Side-attached action button. Pill shape with rounded corners from the edge.
 * Use for primary add/create actions instead of a circular FAB.
 */
export function SideActionButton({
  icon = "plus",
  onPress,
  position = "bottom-right",
  bottomOffset = 96,
  topOffset = 0,
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

  const isInline = position === "inline";
  const isRight = position === "bottom-right" || position === "top-right";
  const isTop = position === "top-right" || position === "top-left";

  const height = size === "sm" ? 40 : 52;
  const paddingHorizontal = size === "sm" ? 14 : 18;
  const iconSize = size === "sm" ? 18 : 20;
  const borderRadius = height / 2;

  const edgeStyle =
    !isInline &&
    (isTop
      ? { top: topOffset, [isRight ? "right" : "left"]: 0 }
      : { bottom: bottomOffset, [isRight ? "right" : "left"]: 0 });

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        animatedStyle,
        !isInline && {
          position: "absolute",
          zIndex: 10,
          ...edgeStyle,
        },
      ]}
      className={isInline ? "" : ""}
    >
      <View
        style={{
          height,
          paddingHorizontal: isInline ? paddingHorizontal : paddingHorizontal + 6,
          borderTopLeftRadius: isInline || isRight ? borderRadius : 0,
          borderBottomLeftRadius: isInline || isRight ? borderRadius : 0,
          borderTopRightRadius: isInline || !isRight ? borderRadius : 0,
          borderBottomRightRadius: isInline || !isRight ? borderRadius : 0,
          backgroundColor: "#3B82F6",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          minWidth: height,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 4,
        }}
        className={className}
      >
        <FontAwesome name={icon} size={iconSize} color="white" />
      </View>
    </AnimatedPressable>
  );
}
