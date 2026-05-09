import { getCategoryColor } from "@/constants/Colors";
import React, { ReactNode } from "react";
import { Text, View } from "react-native";

export interface WizardHeaderProps {
  /** Step/screen title (e.g. "Plan Routine", "Configure Sets") */
  title: string;
  /** Optional main content below title (e.g. exercise name) - larger text */
  subtitle?: string;
  /** Optional category label (e.g. "CORE") - colored by category */
  category?: string;
  /** Optional content below category (e.g. unilateral badge) */
  children?: ReactNode;
  /** Optional control aligned to the start of the top row (balances title centering) */
  leftAccessory?: ReactNode;
  /** Optional control aligned to the end of the top row */
  rightAccessory?: ReactNode;
  /** Bottom margin class */
  className?: string;
}

/**
 * Reusable header for wizard/screen steps.
 * Simple: title only.
 * Full: title + subtitle + category with proper size hierarchy.
 */
export function WizardHeader({
  title,
  subtitle,
  category,
  children,
  leftAccessory,
  rightAccessory,
  className = "mb-4",
}: WizardHeaderProps) {
  const hasSubcontent = !!subtitle || !!category || !!children;
  const hasTopRowAccessories = leftAccessory != null || rightAccessory != null;

  const titleTextClass = hasSubcontent ? "mb-1 text-lg text-zinc-300" : "text-xl text-white";

  return (
    <View
      className={`-mx-6 items-center px-6 pt-3 pb-4 border-b border-zinc-800/80 bg-zinc-900/60 ${className}`}
    >
      {hasTopRowAccessories ? (
        <View className="mb-1 w-full flex-row items-center self-stretch">
          <View className="min-h-10 flex-1 flex-row items-center justify-start">
            {leftAccessory}
          </View>
          <View className="min-h-10 flex-1 items-center justify-center px-1">
            <Text className={`text-center font-bold ${titleTextClass}`}>{title}</Text>
          </View>
          <View className="min-h-10 flex-1 flex-row items-center justify-end">
            {rightAccessory}
          </View>
        </View>
      ) : (
        <Text className={`text-center font-bold ${titleTextClass}`}>{title}</Text>
      )}

      {subtitle && (
        <Text className="text-3xl font-extrabold text-white text-center leading-tight mb-1">
          {subtitle}
        </Text>
      )}
      {category && (
        <Text
          className="mb-4 text-center font-bold uppercase tracking-widest text-xs"
          style={{ color: getCategoryColor(category) }}
        >
          {category}
        </Text>
      )}
      {children}
    </View>
  );
}
