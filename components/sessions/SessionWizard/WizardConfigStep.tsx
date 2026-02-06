import { SetRepsArea } from "@/components/ui/SetRepsArea";
import { UnilateralIndicator } from "@/components/ui/UnilateralIndicator";
import { WizardHeader } from "@/components/ui/WizardHeader";
import { getCategoryColor } from "@/constants/Colors";
import { Exercise } from "@/constants/Types";
import React, { useState } from "react";
import { Text, View } from "react-native";
import { BottomActionPanel } from "./BottomActionPanel";
import { WizardScreenWrapper } from "./WizardScreenWrapper";

interface Props {
  exercise: Exercise;
  initialSets?: number;
  initialReps?: number | number[];
  onConfirm: (sets: number, reps: number[]) => void;
  onBack: () => void;
}

export function WizardConfigStep({
  exercise,
  initialSets = 1,
  initialReps,
  onConfirm,
  onBack,
}: Props) {
  // Initialize reps array
  const getInitialReps = (): number[] => {
    const defaultVal = exercise.default_reps || 10;
    let baseReps: number[] = [];

    if (Array.isArray(initialReps)) {
      // Clone to avoid reference issues
      baseReps = [...initialReps];
      // Pad if length mismatch with initialSets
      if (baseReps.length < initialSets) {
        const lastVal = baseReps.length > 0 ? baseReps[baseReps.length - 1] : defaultVal;
        while (baseReps.length < initialSets) {
          baseReps.push(lastVal);
        }
      }
    } else if (typeof initialReps === "number") {
      baseReps = Array(initialSets).fill(initialReps);
    } else {
      baseReps = Array(initialSets).fill(defaultVal);
    }

    // Ensure even length for Unilateral
    if (exercise.is_unilateral && baseReps.length % 2 !== 0) {
      baseReps.push(baseReps[baseReps.length - 1] || defaultVal);
    }

    return baseReps;
  };

  const [reps, setReps] = useState<number[]>(getInitialReps());
  const [isLinked, setIsLinked] = useState(true);

  const handleAddSet = () => {
    const lastRep =
      reps.length > 0 ? reps[reps.length - 1] : exercise.default_reps || 10;

    if (exercise.is_unilateral) {
      // Add Pair
      setReps([...reps, lastRep, lastRep]);
    } else {
      setReps([...reps, lastRep]);
    }
  };

  const handleRemoveSet = () => {
    if (exercise.is_unilateral) {
      if (reps.length > 2) {
        setReps(reps.slice(0, -2));
      }
    } else {
      if (reps.length > 1) {
        setReps(reps.slice(0, -1));
      }
    }
  };

  const updateRep = (index: number, delta: number) => {
    const newReps = [...reps];
    newReps[index] = Math.max(1, newReps[index] + delta);

    // Linked Editing for Unilateral
    // Linked Editing for Unilateral
    if (exercise.is_unilateral && isLinked) {
      if (index % 2 === 0) {
        // Updated Left -> Update Right (index + 1)
        if (index + 1 < newReps.length) {
          newReps[index + 1] = newReps[index];
        }
      } else {
        // Updated Right -> Update Left (index - 1)
        if (index - 1 >= 0) {
          newReps[index - 1] = newReps[index];
        }
      }
    }

    setReps(newReps);
  };

  const sets = exercise.is_unilateral ? reps.length / 2 : reps.length;

  return (
    <View className="flex-1">
      <WizardScreenWrapper className="pb-0">
        <WizardHeader title="Configure Sets" className="mb-4" />

        <View className="items-center mb-4">
          <Text className="text-3xl font-extrabold text-white text-center leading-tight mb-1">
            {exercise.name}
          </Text>
          <Text
            className="font-bold uppercase tracking-widest text-xs mb-2"
            style={{ color: getCategoryColor(exercise.category?.name || "") }}
          >
            {exercise.category?.name}
          </Text>
          {exercise.is_unilateral && <UnilateralIndicator variant="pill" />}
        </View>

        <SetRepsArea
          mode={exercise.is_unilateral ? "unilateral" : "default"}
          reps={reps}
          unit={exercise.unit || "REPS"}
          onAddSet={handleAddSet}
          onRemoveSet={handleRemoveSet}
          onUpdateRep={updateRep}
          isLinked={isLinked}
          onToggleLinked={
            exercise.is_unilateral ? () => setIsLinked(!isLinked) : undefined
          }
          stepperSize={exercise.is_unilateral ? "sm" : "md"}
        />
      </WizardScreenWrapper >

      {/* Footer using Standard Action Panel */}
      < BottomActionPanel
        primaryLabel="CONFIRM"
        primaryIcon="check"
        onPrimaryPress={() => onConfirm(sets, reps)
        }
        onBack={onBack}
      />
    </View >
  );
}
