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
  className = "mb-4",
}: WizardHeaderProps) {
  const hasSubcontent = !!subtitle || !!category || !!children;
  return (
    <View
      className={`-mx-6 px-6 pt-3 pb-4 border-b border-zinc-800/80 bg-zinc-900/60 items-center ${className}`}
    >
      <Text
        className={`font-bold ${
          hasSubcontent ? "mb-1 text-lg text-zinc-300" : "text-xl text-white"
        }`}
      >
        {title}
      </Text>
      {subtitle && (
        <Text className="text-3xl font-extrabold text-white text-center leading-tight mb-1">
          {subtitle}
        </Text>
      )}
      {category && (
        <Text
          className="font-bold uppercase tracking-widest text-xs mb-4"
          style={{ color: getCategoryColor(category) }}
        >
          {category}
        </Text>
      )}
      {children}
    </View>
  );
}
