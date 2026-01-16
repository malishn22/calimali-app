import React from "react";
import { WizardActionPanel } from "./WizardActionPanel";
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
    return <WizardActionPanel onBack={onBack} fullWidthBack />;
  }

  // Case: Search Step -> Full width Back
  if (step === "SEARCH") {
    return <WizardActionPanel onBack={onBack} fullWidthBack />;
  }

  // Case: Final Step -> SAVE (Green)
  if (step === "FINAL") {
    return (
      <WizardActionPanel
        primaryLabel="SAVE"
        onPrimaryPress={onSave}
        primaryVariant="completed" // Using 'completed' for green style (was bg-green-600)
        onBack={onBack}
      />
    );
  }

  // Default: List Step with items (NEXT)
  return (
    <WizardActionPanel
      primaryLabel="NEXT"
      onPrimaryPress={onNext}
      onBack={onBack}
    />
  );
}
