import React from "react";
import { BottomActionPanel } from "./BottomActionPanel";
import { WizardStep } from "./types";

interface Props {
  step: WizardStep;
  onNext: () => void;
  onSave: () => void;
  canGoNext: boolean;
}

export function WizardFooter({ step, onNext, onSave, canGoNext }: Props) {
  if (step === "CONFIG") return null; // Config has its own footer

  // Case: List Step with no items -> back-only lived here; back is now in the header.
  if (step === "LIST" && !canGoNext) {
    return null;
  }

  // Case: Search Step -> back-only lived here; back is now in the header.
  if (step === "SEARCH") {
    return null;
  }

  // Case: Final Step -> SAVE (Green)
  if (step === "FINAL") {
    return (
      <BottomActionPanel
        primaryLabel="SAVE"
        primaryIcon="check"
        onPrimaryPress={onSave}
        primaryVariant="completed" // Using 'completed' for green style (was bg-green-600)
      />
    );
  }

  // Default: List Step with items (NEXT)
  return (
    <BottomActionPanel
      primaryLabel="NEXT"
      primaryIcon="arrow-right"
      primaryIconPosition="right" // forward action — arrow trails the label
      onPrimaryPress={onNext}
    />
  );
}
