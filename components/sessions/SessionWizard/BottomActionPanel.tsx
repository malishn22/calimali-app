import { Button } from "@/components/ui/Button";
import { SessionButton } from "@/components/ui/SessionButton";
import Colors from "@/constants/Colors";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

type Props =
  | {
    fullWidthBack: true;
    onBack: () => void;
    onPrimaryPress?: never;
    primaryLabel?: never;
    primaryIcon?: never;
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
    primaryVariant?: "primary" | "completed" | "destructive" | "start";
    backLabel?: string;
    onSecondaryPress?: () => void;
  };

export function BottomActionPanel({
  onPrimaryPress,
  primaryLabel,
  primaryIcon,
  primaryVariant = "primary",
  onBack,
  backLabel,
  fullWidthBack = false,
}: Props) {
  if (fullWidthBack) {
    return (
      <View className="px-6 pb-6 pt-4 border-t border-zinc-800">
        <Button
          variant="secondary"
          onPress={onBack}
          className="bg-zinc-800 w-full h-14 rounded-2xl items-center justify-center"
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
    <View className="px-6 pb-6 pt-4 border-t border-zinc-800 flex-row items-center gap-4">
      <Button
        variant="secondary"
        onPress={onBack}
        className="bg-zinc-800 w-24 h-14 rounded-2xl items-center justify-center"
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
        onPress={onPrimaryPress!}
        className="flex-1" // SessionButton enforces height, we enforce flex
      />
    </View>
  );
}
