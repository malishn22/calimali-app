import React from "react";
import { View } from "react-native";
import { Button } from "../ui/Button";

interface Props {
  onPrev: () => void;
  onNext: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function SessionControls({ onPrev, onNext, isFirst, isLast }: Props) {
  return (
    <View className="px-6 pb-6 pt-4 flex-row gap-4">
      <Button
        variant="secondary"
        title="Prev"
        onPress={onPrev}
        disabled={isFirst}
        className="flex-1"
      />
      <Button
        variant={isLast ? "completed" : "primary"}
        title={isLast ? "Finish Workout" : "Next Exercise"}
        onPress={onNext}
        className="flex-[2]"
      />
    </View>
  );
}
