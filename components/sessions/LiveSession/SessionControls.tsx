import { BottomActionPanel } from "@/components/routines/RoutineEditor/BottomActionPanel";
import { Button } from "@/components/ui/Button";
import { StepNavPill } from "@/components/ui/StepNavPill";
import { BOTTOM_BAR_ACTION_HEIGHT } from "@/constants/Layout";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";

interface Props {
  onMainAction: () => void;
  mainActionLabel: string;
  mainActionIcon?: keyof typeof FontAwesome.glyphMap;
  mainActionVariant?: "primary" | "completed" | "start";
  disabled?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
  isPaused?: boolean;
  onTogglePause?: () => void;
}

const iconButtonStyle = {
  height: BOTTOM_BAR_ACTION_HEIGHT,
  minHeight: BOTTOM_BAR_ACTION_HEIGHT,
};

export function SessionControls({
  onMainAction,
  mainActionLabel,
  mainActionIcon,
  mainActionVariant = "primary",
  disabled,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  isPaused,
  onTogglePause,
}: Props) {
  const hasStepNav = !!onPrevious && !!onNext;
  const hasPause = !!onTogglePause;

  const leadingAccessory =
    hasStepNav || hasPause ? (
      <View className="flex-row gap-3">
        {hasStepNav && (
          <StepNavPill
            onPrevious={onPrevious!}
            onNext={onNext!}
            canGoPrevious={!!canGoPrevious}
            canGoNext={!!canGoNext}
          />
        )}
        {hasPause && (
          <Button
            onPress={onTogglePause}
            icon={isPaused ? "play" : "pause"}
            variant="secondary"
            className="w-12 rounded-xl bg-zinc-800"
            style={iconButtonStyle}
          />
        )}
      </View>
    ) : undefined;

  return (
    <BottomActionPanel
      onPrimaryPress={onMainAction}
      primaryLabel={mainActionLabel}
      primaryIcon={mainActionIcon}
      primaryVariant={mainActionVariant}
      disabled={disabled}
      leadingAccessory={leadingAccessory}
    />
  );
}
