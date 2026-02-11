import React from "react";
import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { getFilledBadgeGradientColors } from "@/constants/Colors";

export interface BadgeProps {
  /** Label text (e.g. "CORE", "BEGINNER") */
  label: string;
  /** Accent color (hex) */
  color: string;
  /** Outline: border + tinted bg + colored text. Filled: gradient pill + white text + bolder/larger text */
  variant?: "outline" | "filled";
  /** Optional size variant */
  size?: "sm" | "md";
  className?: string;
}

/**
 * Reusable pill-shaped badge for category, difficulty, or any labeled tag.
 */
export function Badge({
  label,
  color,
  variant = "outline",
  size = "md",
  className = "",
}: BadgeProps) {
  const isFilled = variant === "filled";
  const bgColor = isFilled ? undefined : `${color}20`;
  const textColor = isFilled ? "#FFFFFF" : color;

  const sizeClasses = size === "sm" ? "px-2 py-0.5" : "px-3 py-1";
  const textSize = size === "sm" ? (isFilled ? "text-[10px]" : "text-[9px]") : "text-[10px]";
  const textWeight = isFilled ? "font-extrabold" : "font-bold";
  const roundedClass = size === "sm" ? "rounded-md" : "rounded-full";

  const [gradientStart, gradientEnd] = getFilledBadgeGradientColors(color);

  if (isFilled) {
    const borderRadius = size === "sm" ? 6 : 9999;
    return (
      <LinearGradient
        colors={[gradientStart, gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className={`${sizeClasses} ${roundedClass} ${className}`}
        style={{ overflow: "hidden", borderRadius }}
      >
        <Text
          className={`${textSize} ${textWeight} uppercase tracking-widest`}
          style={{ color: textColor }}
        >
          {label}
        </Text>
      </LinearGradient>
    );
  }

  return (
    <View
      className={`${sizeClasses} ${roundedClass} border ${className}`}
      style={{ borderColor: color, backgroundColor: bgColor }}
    >
      <Text
        className={`${textSize} ${textWeight} uppercase tracking-widest`}
        style={{ color: textColor }}
      >
        {label}
      </Text>
    </View>
  );
}
