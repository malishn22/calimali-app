import Colors from "@/constants/Colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { Badge } from "./Badge";

export interface UnilateralIndicatorProps {
  /** inline: icon only. pill: icon + text in pill. badge: Badge component */
  variant: "inline" | "pill" | "badge";
  /** Icon size for inline variant (default 14) */
  size?: 14 | 16;
  className?: string;
}

const BLUE = Colors.palette.electricBlue;

/**
 * Visual indicator for unilateral exercises (target one side at a time).
 * Use inline in list rows, pill for emphasis, badge in sheet headers.
 */
export function UnilateralIndicator({
  variant,
  size = 14,
  className = "",
}: UnilateralIndicatorProps) {
  if (variant === "badge") {
    return (
      <Badge
        label="UNILATERAL"
        color={BLUE}
        variant="filled"
        size="md"
        className={className}
      />
    );
  }

  if (variant === "pill") {
    return (
      <View
        className={`flex-row items-center bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 ${className}`}
      >
        <MaterialCommunityIcons
          name="swap-horizontal"
          size={14}
          color={BLUE}
          style={{ marginRight: 6 }}
        />
        <Text className="text-blue-500 font-bold text-[10px] tracking-widest uppercase">
          Unilateral
        </Text>
      </View>
    );
  }

  // variant === "inline" – dark pill + light icon so it’s visible on any background (e.g. gradient rows)
  const iconSize = size === 16 ? 12 : 10;
  const pillSize = size === 16 ? 20 : 18;
  return (
    <View
      className={`rounded-full items-center justify-center ${className}`}
      style={{
        width: pillSize,
        height: pillSize,
        backgroundColor: BLUE,
      }}
    >
      <MaterialCommunityIcons
        name="swap-horizontal"
        size={iconSize}
        color={Colors.palette.cloud}
      />
    </View>
  );
}
