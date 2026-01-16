import React from "react";
import { Button } from "./Button";

interface SessionButtonProps {
  onPress: () => void;
  title: string;
  variant?: "primary" | "secondary" | "destructive" | "completed"; // Enforcing standard variants
  icon?: any; // Component or icon name
  disabled?: boolean;
  className?: string;
}

/**
 * specialized button for primary session actions.
 * Used for: "Next", "Confirm", "Save" (Wizard) AND "Start Session", "Next Exercise", "Complete Session" (LiveSession).
 */
export function SessionButton({
  onPress,
  title,
  variant = "primary",
  icon,
  disabled,
  className,
}: SessionButtonProps) {
  return (
    <Button
      onPress={onPress}
      title={title}
      variant={variant}
      icon={icon}
      disabled={disabled}
      className={`h-14 rounded-2xl ${className}`} // Enforce height and roundness
      // We can enforce specific text styles inside Button if needed, or pass className overrides
    />
  );
}
