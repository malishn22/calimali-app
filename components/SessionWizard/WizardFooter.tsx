import React from "react";
import { BottomActionPanel } from "./BottomActionPanel";
import { WizardStep } from "./types";

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
  if (step === "CONFIG") return null; // Config has its own footer

  // Case: List Step with no items -> Full width Back
  if (step === "LIST" && !canGoNext) {
    return <BottomActionPanel onBack={onBack} fullWidthBack />;
  }

  // Case: Search Step -> Full width Back
  if (step === "SEARCH") {
    return <BottomActionPanel onBack={onBack} fullWidthBack />;
  }

  // Case: Final Step -> SAVE (Green)
  if (step === "FINAL") {
    return (
      <BottomActionPanel
        primaryLabel="SAVE"
        onPrimaryPress={onSave}
        primaryVariant="completed" // Using 'completed' for green style (was bg-green-600)
        onBack={onBack}
      />
    );
  }

  // Default: List Step with items (NEXT)
  return (
    <BottomActionPanel
      primaryLabel="NEXT"
      onPrimaryPress={onNext}
      onBack={onBack}
    />
  );
}
