import React from "react";
import { Text, View } from "react-native";

export interface BadgeProps {
  /** Label text (e.g. "CORE", "BEGINNER") */
  label: string;
  /** Accent color (hex) */
  color: string;
  /** Outline: border + tinted bg + colored text. Filled: solid bg + white text */
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
  const bgColor = isFilled ? color : `${color}20`;
  const textColor = isFilled ? "#FFFFFF" : color;

  const sizeClasses = size === "sm" ? "px-2 py-0.5" : "px-3 py-1";
  const textSize = size === "sm" ? "text-[9px]" : "text-[10px]";
  const roundedClass = size === "sm" ? "rounded-md" : "rounded-full";

  return (
    <View
      className={`${sizeClasses} ${roundedClass} border ${className}`}
      style={{
        borderColor: isFilled ? color : color,
        backgroundColor: bgColor,
      }}
    >
      <Text
        className={`${textSize} font-bold uppercase tracking-widest`}
        style={{ color: textColor }}
      >
        {label}
      </Text>
    </View>
  );
}
