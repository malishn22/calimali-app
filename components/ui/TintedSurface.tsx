import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ColorValue, StyleProp, View, ViewStyle } from "react-native";

/** Blend base hex with tint hex; weight 0 = all base, 1 = all tint */
export function blendHex(baseHex: string, tintHex: string, weight: number): string {
  const b = baseHex.replace(/^#/, "");
  const t = tintHex.replace(/^#/, "");
  const r = Math.round(parseInt(b.slice(0, 2), 16) * (1 - weight) + parseInt(t.slice(0, 2), 16) * weight);
  const g = Math.round(parseInt(b.slice(2, 4), 16) * (1 - weight) + parseInt(t.slice(2, 4), 16) * weight);
  const bl = Math.round(parseInt(b.slice(4, 6), 16) * (1 - weight) + parseInt(t.slice(4, 6), 16) * weight);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bl.toString(16).padStart(2, "0")}`;
}

const DEFAULT_BASE = "#1c1c1e";

export interface TintedSurfaceProps {
  /** Accent/category color (hex) */
  tintColor: string;
  /** Base dark color (default #1c1c1e) */
  baseColor?: string;
  /** Tint strength 0–1 (e.g. 0.06–0.12) */
  intensity?: number;
  /** gradient = smooth fade; flat = single blended color */
  variant?: "gradient" | "flat";
  /** For gradient: where the tint sits (top = tint at top fading to base; bottom = base at top, tint at bottom) */
  tintAt?: "top" | "bottom";
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/**
 * Wraps content in a surface with an optional tint. Use gradient for sheets/screens,
 * flat for cards or uniform tint.
 */
export function TintedSurface({
  tintColor,
  baseColor = DEFAULT_BASE,
  intensity = 0.1,
  variant = "gradient",
  tintAt = "top",
  children,
  style,
  className = "",
}: TintedSurfaceProps) {
  const blended = blendHex(baseColor, tintColor, intensity);

  if (variant === "flat") {
    return (
      <View style={[{ backgroundColor: blended }, style]} className={className}>
        {children}
      </View>
    );
  }

  const colors = tintAt === "bottom" ? [baseColor, blended] : [blended, baseColor];

  return (
    <LinearGradient
      colors={colors as [ColorValue, ColorValue]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={style}
      className={className}
    >
      {children}
    </LinearGradient>
  );
}
