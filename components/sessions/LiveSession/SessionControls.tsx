import { FontAwesome } from "@expo/vector-icons";
import { BottomActionPanel } from "../SessionWizard/BottomActionPanel";

interface Props {
  onBack: () => void;
  onMainAction: () => void;
  mainActionLabel: string;
  mainActionIcon?: keyof typeof FontAwesome.glyphMap;
  mainActionVariant?: "primary" | "completed" | "start";
  backLabel?: string;
}

export function SessionControls({
  onBack,
  onMainAction,
  mainActionLabel,
  mainActionIcon,
  mainActionVariant = "primary",
  backLabel = "Cancel",
}: Props) {
  return (
    <BottomActionPanel
      onBack={onBack}
      onPrimaryPress={onMainAction}
      primaryLabel={mainActionLabel}
      primaryIcon={mainActionIcon}
      primaryVariant={mainActionVariant}
      backLabel={backLabel}
    />
  );
}
