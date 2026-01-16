import { Exercise } from "@/services/Database";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Button } from "../ui/Button";
import { WizardActionPanel } from "./WizardActionPanel";
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
    if (Array.isArray(initialReps)) {
      // If we have an array (editing), keep it.
      // If initialSets changed (unlikely in this flow but safe to handle), trim or pad?
      // For now just trust the array passed in matches the sets.
      return initialReps.length > 0 ? initialReps : [defaultVal];
    } else if (typeof initialReps === "number") {
      // Legacy single number -> map to array
      return Array(initialSets).fill(initialReps);
    }
    // Default -> map default reps to array
    return Array(initialSets).fill(defaultVal);
  };

  const [reps, setReps] = useState<number[]>(getInitialReps());

  const handleAddSet = () => {
    const lastRep =
      reps.length > 0 ? reps[reps.length - 1] : exercise.default_reps || 10;
    setReps([...reps, lastRep]);
  };

  const handleRemoveSet = () => {
    if (reps.length > 1) {
      setReps(reps.slice(0, -1));
    }
  };

  const updateRep = (index: number, delta: number) => {
    const newReps = [...reps];
    newReps[index] = Math.max(1, newReps[index] + delta);
    setReps(newReps);
  };

  const sets = reps.length;

  return (
    <View className="flex-1">
      <WizardScreenWrapper className="pb-0">
        {/* Header */}
        <View className="items-center py-4 mb-4">
          <Text className="text-xl font-bold text-white mb-2">
            Configure Sets
          </Text>
          <Text className="text-4xl font-extrabold text-white text-center leading-tight mb-1">
            {exercise.name}
          </Text>
          <Text className="text-blue-500 font-bold uppercase tracking-widest text-xs mb-6">
            {exercise.category}
          </Text>

          {/* Set Controls - Minimalistic */}
          <View className="flex-row items-center justify-center gap-4 bg-zinc-800/50 p-2 rounded-2xl border border-zinc-700/50">
            <Button
              variant="secondary"
              icon="minus"
              onPress={handleRemoveSet}
              disabled={sets <= 1}
              className={`w-8 h-8 rounded-lg bg-zinc-700 items-center justify-center ${
                sets <= 1 ? "opacity-30" : ""
              }`}
            />
            <View className="w-2" />
            <Button
              variant="secondary"
              icon="plus"
              onPress={handleAddSet}
              className="w-8 h-8 rounded-lg bg-zinc-700 items-center justify-center"
            />
          </View>
        </View>

        <ScrollView className="flex-1 mb-4">
          {reps.map((repCount, i) => (
            <View
              key={i}
              className="bg-zinc-800 rounded-2xl p-4 mb-2 border border-zinc-700 mx-1"
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-zinc-500 font-bold text-sm mb-1">
                    Set {i + 1}
                  </Text>
                  <Text className="text-blue-500 font-bold text-sm uppercase tracking-wider">
                    {exercise.unit}
                  </Text>
                </View>

                <View className="flex-row items-center gap-4">
                  <Button
                    variant="secondary"
                    icon="minus"
                    onPress={() => updateRep(i, -1)}
                    className="w-8 h-8 rounded-full bg-zinc-700"
                  />
                  <Text className="text-3xl font-extrabold text-white w-12 text-center">
                    {repCount}
                  </Text>
                  <Button
                    variant="secondary"
                    icon="plus"
                    onPress={() => updateRep(i, 1)}
                    className="w-8 h-8 rounded-full bg-zinc-700"
                  />
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </WizardScreenWrapper>

      {/* Footer using Standard Action Panel */}
      <WizardActionPanel
        primaryLabel="CONFIRM"
        primaryIcon="check"
        onPrimaryPress={() => onConfirm(sets, reps)}
        onBack={onBack}
      />
    </View>
  );
}
