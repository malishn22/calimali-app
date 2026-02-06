import { getUnitColor } from "@/constants/Colors";
import { Stepper } from "@/components/ui/Stepper";
import React from "react";
import { Text, View } from "react-native";

export interface SetRepsRowProps {
  /** Primary label (e.g. "Set 1", "LEFT", "RIGHT") */
  label: string;
  /** Optional secondary label (e.g. "REPS" unit) - when present, shows two-line left layout */
  unit?: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  size?: "sm" | "md" | "lg";
  /** Use compact layout (e.g. for unilateral LEFT/RIGHT rows) */
  compact?: boolean;
  containerClassName?: string;
}

/**
 * A reusable row: label(s) on the left, Stepper on the right.
 * Default mode: Two-line label (Set N + unit).
 * Compact mode: Single-line label (e.g. LEFT/RIGHT).
 */
export function SetRepsRow({
  label,
  unit,
  value,
  onIncrement,
  onDecrement,
  min = 1,
  size = "md",
  compact = false,
  containerClassName = "",
}: SetRepsRowProps) {
  return (
    <View
      className={`flex-row items-center justify-between ${compact ? "bg-zinc-900/50 p-2 rounded-xl" : ""} ${containerClassName}`}
    >
      <View className={compact ? "" : "flex-1"}>
        <Text
          className={`font-bold ${compact ? "text-zinc-400 text-xs w-10" : "text-zinc-400 text-base mb-1"}`}
        >
          {label}
        </Text>
        {unit && !compact && (
          <Text
            className="font-bold text-base uppercase tracking-wider"
            style={{ color: getUnitColor(unit) }}
          >
            {unit}
          </Text>
        )}
      </View>

      <Stepper
        value={value}
        onIncrement={onIncrement}
        onDecrement={onDecrement}
        min={min}
        size={size}
        containerClassName="bg-transparent border-0 p-0"
      />
    </View>
  );
}
