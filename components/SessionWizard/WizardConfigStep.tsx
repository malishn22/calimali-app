import { Exercise } from "@/services/Database";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Button } from "../ui/Button";
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
      baseReps = initialReps.length > 0 ? initialReps : [defaultVal];
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
    if (exercise.is_unilateral) {
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

          {exercise.is_unilateral && (
            <View className="mb-6 flex-row items-center bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              <MaterialCommunityIcons
                name="alpha-u-box"
                size={14}
                color="#3B82F6"
                style={{ marginRight: 6 }}
              />
              <Text className="text-blue-500 font-bold text-[10px] tracking-widest uppercase">
                Unilateral
              </Text>
            </View>
          )}

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
          {exercise.is_unilateral
            ? // UNILATERAL RENDER (Pairs)
              Array.from({ length: sets }).map((_, i) => {
                const leftIndex = i * 2;
                const rightIndex = i * 2 + 1;
                const leftReps = reps[leftIndex];
                const rightReps = reps[rightIndex];

                return (
                  <View
                    key={i}
                    className="bg-zinc-800 rounded-2xl p-4 mb-2 border border-zinc-700 mx-1"
                  >
                    <View className="mb-3 flex-row justify-between items-center">
                      <Text className="text-zinc-500 font-bold text-sm">
                        Set {i + 1}
                      </Text>
                      <Text className="text-blue-500 font-bold text-xs uppercase tracking-wider">
                        {exercise.unit}
                      </Text>
                    </View>

                    {/* Left Control */}
                    <View className="flex-row items-center justify-between mb-3 bg-zinc-900/50 p-2 rounded-xl">
                      <Text className="text-zinc-400 font-bold text-xs w-10">
                        LEFT
                      </Text>
                      <View className="flex-row items-center gap-3">
                        <Button
                          variant="secondary"
                          icon="minus"
                          size="sm"
                          onPress={() => updateRep(leftIndex, -1)}
                          className="w-8 h-8 rounded-full bg-zinc-700"
                        />
                        <Text className="text-2xl font-extrabold text-white w-10 text-center">
                          {leftReps}
                        </Text>
                        <Button
                          variant="secondary"
                          icon="plus"
                          size="sm"
                          onPress={() => updateRep(leftIndex, 1)}
                          className="w-8 h-8 rounded-full bg-zinc-700"
                        />
                      </View>
                    </View>

                    {/* Right Control */}
                    <View className="flex-row items-center justify-between bg-zinc-900/50 p-2 rounded-xl">
                      <Text className="text-zinc-400 font-bold text-xs w-10">
                        RIGHT
                      </Text>
                      <View className="flex-row items-center gap-3">
                        <Button
                          variant="secondary"
                          icon="minus"
                          size="sm"
                          onPress={() => updateRep(rightIndex, -1)}
                          className="w-8 h-8 rounded-full bg-zinc-700"
                        />
                        <Text className="text-2xl font-extrabold text-white w-10 text-center">
                          {rightReps}
                        </Text>
                        <Button
                          variant="secondary"
                          icon="plus"
                          size="sm"
                          onPress={() => updateRep(rightIndex, 1)}
                          className="w-8 h-8 rounded-full bg-zinc-700"
                        />
                      </View>
                    </View>
                  </View>
                );
              })
            : // NORMAL RENDER
              reps.map((repCount, i) => (
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
      <BottomActionPanel
        primaryLabel="CONFIRM"
        primaryIcon="check"
        onPrimaryPress={() => onConfirm(sets, reps)}
        onBack={onBack}
      />
    </View>
  );
}
