import Colors from "@/constants/Colors";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, ViewStyle } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface SessionButtonProps {
  onPress: () => void;
  title: string;
  variant?: "primary" | "secondary" | "destructive" | "completed" | "start";
  icon?: keyof typeof FontAwesome.glyphMap;
  disabled?: boolean;
  className?: string;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SessionButton({
  onPress,
  title,
  variant = "primary",
  icon,
  disabled,
  className = "",
  style,
}: SessionButtonProps) {
  // Animation State
  const interaction = useSharedValue(0);

  const handlePressIn = () => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      interaction.value = withTiming(1, { duration: 100 });
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      interaction.value = withSpring(0, { damping: 80, stiffness: 1500 });
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(interaction.value, [0, 1], [1, 0.95]);
    const shadowOpacity = interpolate(interaction.value, [0, 1], [0.3, 0.1]);
    const shadowRadius = interpolate(interaction.value, [0, 1], [8, 4]);
    const translateY = interpolate(interaction.value, [0, 1], [0, 2]);

    return {
      transform: [{ scale }, { translateY }],
      shadowOpacity,
      shadowRadius,
      elevation: interpolate(interaction.value, [0, 1], [5, 2]),
    };
  });

  // Variant Styles
  let bgClass = "bg-blue-500";
  let textClass = "text-white";
  let iconColor = "white";

  switch (variant) {
    case "primary":
      bgClass = "bg-blue-600"; // Slightly darker for better shadow contrast
      textClass = "text-white";
      iconColor = "white";
      break;
    case "secondary":
      bgClass = "bg-zinc-800";
      textClass = "text-zinc-300";
      iconColor = Colors.palette.silver;
      break;
    case "destructive":
      bgClass = "bg-red-900"; // Darker red background
      textClass = "text-red-400";
      iconColor = Colors.palette.crimsonRed;
      break;
    case "completed":
      bgClass = "bg-green-500";
      textClass = "text-black";
      iconColor = "black";
      break;
    case "start":
      bgClass = "bg-white";
      textClass = "text-black";
      iconColor = "black";
      break;
  }

  if (disabled) {
    bgClass += " opacity-50";
  }

  return (
    <AnimatedPressable
      onPress={disabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className={`h-16 rounded-2xl flex-row items-center justify-center shadow-black/40 ${bgClass} ${className}`}
      style={[
        {
          shadowOffset: { width: 0, height: 4 }, // Fixed offset
        },
        style,
        animatedStyle,
      ]}
    >
      {icon && (
        <FontAwesome
          name={icon}
          size={20}
          color={iconColor}
          style={{ marginRight: 10 }}
        />
      )}
      <Text
        className={`font-extrabold text-lg uppercase tracking-wider ${textClass}`}
      >
        {title}
      </Text>
    </AnimatedPressable>
  );
}
