import React from "react";
import { View } from "react-native";
import { Button } from "../ui/Button";
import { WizardStep } from "./index";

interface Props {
  step: WizardStep;
  onBack: () => void;
  onNext: () => void;
  onSave: () => void;
  canGoNext: boolean;
}

export function WizardFooter({
  step,
  onBack,
  onNext,
  onSave,
  canGoNext,
}: Props) {
  if (step === "CONFIG") return null; // Config has its own confirm button

  return (
    <View className="px-6 pb-2 pt-4 flex-row gap-4">
      <Button
        variant="ghost"
        title={step === "LIST" ? "Cancel" : "Back"}
        onPress={onBack}
        className="flex-1"
      />
      {step === "FINAL" ? (
        <Button
          variant="primary"
          title="Save Session"
          onPress={onSave}
          className="flex-[2]"
        />
      ) : (
        step !== "SEARCH" && (
          <Button
            variant={canGoNext ? "primary" : "secondary"}
            title="Next"
            onPress={onNext}
            disabled={!canGoNext}
            className="flex-[2]"
          />
        )
      )}
    </View>
  );
}
