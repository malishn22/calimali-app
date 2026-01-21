import Colors from "@/constants/Colors";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, ViewStyle } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
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
  const interaction = useSharedValue(0); // 0 = idle, 1 = pressed

  const handlePressIn = () => {
    if (!disabled) {
      // Minimal bounce, crisp response
      interaction.value = withSpring(1, { damping: 50, stiffness: 500 });
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      interaction.value = withSpring(0, { damping: 50, stiffness: 500 });
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(interaction.value, [0, 1], [1, 0.92]); // Slightly deeper scale for juice

    // Shadow animation logic (simulating button press depth)
    const shadowOpacity = interpolate(interaction.value, [0, 1], [0.3, 0.1]);
    const shadowRadius = interpolate(interaction.value, [0, 1], [8, 4]);
    const translateY = interpolate(interaction.value, [0, 1], [0, 2]); // Move button down physically

    return {
      transform: [{ scale }, { translateY }],
      shadowOpacity,
      shadowRadius,
      // Elevation for Android
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
      iconColor = Colors.palette.zinc400;
      break;
    case "destructive":
      bgClass = "bg-red-900"; // Darker red background
      textClass = "text-red-400";
      iconColor = Colors.palette.red500;
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
