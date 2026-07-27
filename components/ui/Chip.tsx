/**
 * Selectable chip — filters, toggles and presets.
 *
 * White-on-black is the app's "selected" treatment (see the Vault filters it replaces).
 * The unselected fill is zinc-800 rather than card-dark because card-dark is only two
 * points per channel away from the bottom-sheet surface (#1E1E22 vs #1c1c1e), which made
 * chips inside sheets effectively invisible. zinc-800 + a zinc-700 edge reads clearly on
 * both the screen background (#121214) and the sheet surface.
 *
 * Both states carry a border so selecting never changes the box size by a pixel.
 */
import React from "react";
import { Pressable, Text } from "react-native";

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  disabled?: boolean;
  /** "pill" for text filters, "circle" for fixed-size toggles (e.g. weekday initials). */
  shape?: "pill" | "circle";
  /**
   * Horizontal breathing room. "sm" for pills sharing a row (they get their width from
   * flex, not padding); "md" for free-flowing filter rows. An explicit prop rather than
   * a padding override via className, which would depend on NativeWind class ordering.
   */
  size?: "sm" | "md";
  /** Extra layout classes, e.g. "flex-1" to share a row evenly. */
  className?: string;
}

export function Chip({
  label,
  selected = false,
  onPress,
  disabled = false,
  shape = "pill",
  size = "md",
  className = "",
}: ChipProps) {
  const shapeClass =
    shape === "circle"
      ? "w-10 h-10 rounded-full items-center justify-center"
      : `${size === "sm" ? "px-3 py-1.5" : "px-5 py-2"} rounded-2xl justify-center`;

  const stateClass = selected
    ? "bg-white border-white"
    : "bg-zinc-800 border-zinc-700";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`border ${shapeClass} ${stateClass} ${
        disabled ? "opacity-40" : ""
      } ${className}`}
    >
      <Text
        className={`font-bold text-xs text-center ${
          selected ? "text-black" : "text-zinc-400"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
