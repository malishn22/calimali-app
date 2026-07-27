import { Button } from "@/components/ui/Button";
import { SessionButton } from "@/components/ui/SessionButton";
import Colors from "@/constants/Colors";
import {
  BOTTOM_BAR_ACTION_GAP,
  BOTTOM_BAR_ACTION_HEIGHT,
  BOTTOM_BAR_ACTION_PADDING_TOP,
} from "@/constants/Layout";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props =
  | {
    fullWidthBack: true;
    onBack: () => void;
    onPrimaryPress?: never;
    primaryLabel?: never;
    primaryIcon?: never;
    primaryIconPosition?: never;
    primaryVariant?: never;
    backLabel?: never;
    onSecondaryPress?: never;
  }
  | {
    fullWidthBack?: false;
    onBack: () => void;
    onPrimaryPress: () => void;
    primaryLabel: string;
    primaryIcon?: any;
    primaryIconPosition?: "left" | "right";
    primaryVariant?: "primary" | "completed" | "destructive" | "start";
    backLabel?: string;
    onSecondaryPress?: () => void;
  };

export function BottomActionPanel({
  onPrimaryPress,
  primaryLabel,
  primaryIcon,
  primaryIconPosition = "left",
  primaryVariant = "primary",
  onBack,
  backLabel,
  fullWidthBack = false,
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

  if (fullWidthBack) {
    return (
      <View className="px-6 border-t border-zinc-800" style={barStyle}>
        <Button
          variant="secondary"
          size="sm"
          onPress={onBack}
          className="bg-zinc-800 w-full rounded-xl items-center justify-center"
          style={actionHeight}
        >
          <FontAwesome
            name="chevron-left"
            size={16}
            color={Colors.palette.silver}
          />
        </Button>
      </View>
    );
  }

  return (
    <View
      className="px-6 border-t border-zinc-800 flex-row items-center gap-4"
      style={barStyle}
    >
      <Button
        variant="secondary"
        size="sm"
        onPress={onBack}
        className="bg-zinc-800 w-24 rounded-xl items-center justify-center"
        style={actionHeight}
      >
        <FontAwesome
          name={!backLabel ? "chevron-left" : undefined}
          size={16}
          color={Colors.palette.silver}
        />
        {backLabel && (
          <Text className="text-zinc-400 font-bold ml-2">{backLabel}</Text>
        )}
      </Button>
      <SessionButton
        variant={primaryVariant}
        title={primaryLabel!}
        icon={primaryIcon}
        iconPosition={primaryIconPosition}
        onPress={onPrimaryPress!}
        size="compact"
        className="flex-1" // SessionButton enforces height, we enforce flex
      />
    </View>
  );
}
