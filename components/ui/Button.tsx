import Colors from "@/constants/Colors";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ButtonProps {
  onPress?: () => void;
  title?: string;
  variant?:
    | "primary"
    | "secondary"
    | "destructive"
    | "ghost"
    | "outline"
    | "completed";
  size?: "sm" | "md" | "lg";
  icon?: keyof typeof FontAwesome.glyphMap;
  iconPosition?: "left" | "right";
  iconColor?: string; // Explicit color override
  disabled?: boolean;
  textClassName?: string;
  style?: any;
  children?: React.ReactNode;
  className?: string;
}

export function Button({
  onPress,
  title,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  iconColor: customIconColor,
  disabled = false,
  textClassName = "",
  style,
  children,
  className = "",
}: ButtonProps) {
  // Animation State
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.99, { damping: 20, stiffness: 500 });
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      scale.value = withSpring(1, { damping: 20, stiffness: 500 });
    }
  };

  // Base styles
  const baseContainer = "items-center justify-center flex-row";
  const disabledStyle = "opacity-50";

  // Variant Styles
  let variantContainer = "";
  let variantText = "";
  let defaultIconColor = "";

  switch (variant) {
    case "primary":
      variantContainer = "bg-blue-500";
      variantText = "text-white font-extrabold";
      defaultIconColor = "white";
      break;
    case "secondary":
      variantContainer = "bg-card-dark";
      variantText = "text-zinc-400 font-bold";
      defaultIconColor = Colors.palette.zinc400;
      break;
    case "destructive":
      variantContainer = "bg-card-dark border border-red-500/30";
      variantText = "text-red-500 font-bold";
      defaultIconColor = Colors.palette.red500;
      break;
    case "ghost":
      variantContainer = "bg-transparent";
      variantText = "text-zinc-400 font-bold";
      defaultIconColor = Colors.palette.zinc400;
      break;
    case "outline":
      variantContainer = "bg-transparent border border-zinc-700";
      variantText = "text-zinc-400 font-bold";
      defaultIconColor = Colors.palette.zinc400;
      break;
    case "completed":
      variantContainer = "bg-green-500";
      variantText = "text-black font-extrabold";
      defaultIconColor = "black";
      break;
  }

  const activeIconColor = customIconColor || defaultIconColor;

  // Size Styles
  let sizeContainer = "";
  let sizeText = "";
  let iconSize = 16;

  // If no title (Icon Only)
  const isIconOnly = !title && !children && !!icon;

  switch (size) {
    case "sm":
      sizeContainer = isIconOnly
        ? "w-8 h-8 p-0 rounded-xl"
        : "py-2 px-3 min-h-[32px] rounded-xl";
      sizeText = "text-xs";
      iconSize = 12;
      break;
    case "md":
      sizeContainer = isIconOnly
        ? "w-14 h-14 p-0 rounded-2xl"
        : "py-4 px-6 min-h-[56px] rounded-2xl";
      sizeText = "text-base tracking-wide";
      iconSize = 16;
      break;
    case "lg":
      sizeContainer = isIconOnly
        ? "w-16 h-16 p-0 rounded-3xl"
        : "py-5 px-8 min-h-[64px] rounded-3xl";
      sizeText = "text-lg tracking-widest";
      iconSize = 20;
      break;
  }

  const containerClasses = [
    baseContainer,
    variantContainer,
    sizeContainer,
    disabled ? disabledStyle : "", // Removed active:scale-95 since we handle it manually
    className,
  ].join(" ");

  const textClasses = [variantText, sizeText, textClassName].join(" ");

  return (
    <AnimatedPressable
      onPress={disabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className={containerClasses}
      style={[style, animatedStyle]}
    >
      {children ? (
        children
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <FontAwesome
              name={icon}
              size={iconSize}
              color={activeIconColor}
              style={{ marginRight: title ? 8 : 0 }}
            />
          )}
          {title && <Text className={textClasses}>{title}</Text>}
          {icon && iconPosition === "right" && (
            <FontAwesome
              name={icon}
              size={iconSize}
              color={activeIconColor}
              style={{ marginLeft: title ? 8 : 0 }}
            />
          )}
        </>
      )}
    </AnimatedPressable>
  );
}
