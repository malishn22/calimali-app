import { SessionButton } from "@/components/ui/SessionButton";
import {
  BOTTOM_BAR_ACTION_GAP,
  BOTTOM_BAR_ACTION_HEIGHT,
  BOTTOM_BAR_ACTION_PADDING_TOP,
} from "@/constants/Layout";
import React, { ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  onPrimaryPress: () => void;
  primaryLabel: string;
  primaryIcon?: any;
  primaryIconPosition?: "left" | "right";
  primaryVariant?: "primary" | "completed" | "destructive" | "start";
  disabled?: boolean;
  /** Optional control(s) rendered before the primary button (e.g. prev step, pause). */
  leadingAccessory?: ReactNode;
  /** Optional control(s) rendered after the primary button (e.g. next step). */
  trailingAccessory?: ReactNode;
}

export function BottomActionPanel({
  onPrimaryPress,
  primaryLabel,
  primaryIcon,
  primaryIconPosition = "left",
  primaryVariant = "primary",
  disabled,
  leadingAccessory,
  trailingAccessory,
}: Props) {
  const insets = useSafeAreaInsets();

  // Action-bar band: BOTTOM_ACTION_BAR_HEIGHT + insets.bottom. Taller than the tab
  // bar on purpose — filled buttons need a real tap target and real nav-bar clearance.
  const barStyle = {
    paddingTop: BOTTOM_BAR_ACTION_PADDING_TOP,
    paddingBottom: insets.bottom + BOTTOM_BAR_ACTION_GAP,
  };
  // minHeight too: Button's size classes carry a `min-h-*`, and in RN a larger
  // minHeight silently wins over height — which is what made this bar too tall.
  const actionHeight = {
    height: BOTTOM_BAR_ACTION_HEIGHT,
    minHeight: BOTTOM_BAR_ACTION_HEIGHT,
  };

  return (
    <View
      className="px-6 border-t border-zinc-800 flex-row items-center gap-3"
      style={barStyle}
    >
      {leadingAccessory}
      <SessionButton
        variant={primaryVariant}
        title={primaryLabel}
        icon={primaryIcon}
        iconPosition={primaryIconPosition}
        onPress={onPrimaryPress}
        disabled={disabled}
        size="compact"
        style={{ flex: 1, ...actionHeight }}
      />
      {trailingAccessory}
    </View>
  );
}
