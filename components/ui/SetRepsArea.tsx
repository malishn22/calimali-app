import { getUnitColor } from "@/constants/Colors";
import { Button } from "@/components/ui/Button";
import { SetRepsRow } from "@/components/ui/SetRepsRow";
import { Stepper } from "@/components/ui/Stepper";
import React from "react";
import { ScrollView, Text, View } from "react-native";

export type SetRepsMode = "default" | "unilateral";

export interface SetRepsAreaProps {
  mode: SetRepsMode;
  reps: number[];
  unit: string;
  onAddSet: () => void;
  onRemoveSet: () => void;
  onUpdateRep: (index: number, delta: number) => void;
  /** Unilateral only: whether left/right reps are linked */
  isLinked?: boolean;
  /** Unilateral only: toggle linked state */
  onToggleLinked?: () => void;
  stepperSize?: "sm" | "md" | "lg";
}

/**
 * Reusable set/reps configuration area with two states:
 * - default: One stepper per set (Set 1, Set 2, ...)
 * - unilateral: Two steppers per set pair (LEFT and RIGHT for each set)
 */
export function SetRepsArea({
  mode,
  reps,
  unit,
  onAddSet,
  onRemoveSet,
  onUpdateRep,
  isLinked = true,
  onToggleLinked,
  stepperSize = "md",
}: SetRepsAreaProps) {
  const sets = mode === "unilateral" ? reps.length / 2 : reps.length;
  const setCountStepperSize = "sm";

  return (
    <View className="flex-1">
      {/* Set count controls */}
      <View className="flex-row justify-center mb-4">
        <Stepper
          value={sets}
          onIncrement={onAddSet}
          onDecrement={onRemoveSet}
          min={1}
          showValue={false}
          size={setCountStepperSize}
        />
      </View>

      {/* Unilateral link toggle */}
      {mode === "unilateral" && onToggleLinked && (
        <View className="items-center mb-4">
        <Button
          variant="ghost"
          size="sm"
          icon={isLinked ? "link" : "chain-broken"}
          title={isLinked ? "LINKED" : "UNLINKED"}
          onPress={onToggleLinked}
          className={`mb-4 border px-3 py-1 rounded-full ${
            isLinked
              ? "border-blue-500/30 bg-blue-500/10"
              : "border-zinc-600 bg-zinc-800"
          }`}
          textClassName={isLinked ? "text-blue-400" : "text-zinc-500"}
          iconColor={isLinked ? "#60A5FA" : "#71717a"}
        />
        </View>
      )}

      {/* Set rows */}
      <ScrollView className="flex-1 mb-4" showsVerticalScrollIndicator={false}>
        {mode === "unilateral" ? (
          // Unilateral: one card per set pair with LEFT and RIGHT rows
          Array.from({ length: sets }).map((_, i) => {
            const leftIndex = i * 2;
            const rightIndex = i * 2 + 1;
            return (
              <View
                key={i}
                className="bg-zinc-800 rounded-2xl p-4 mb-2 border border-zinc-700 mx-1"
              >
                <View className="mb-3 flex-row justify-between items-center">
                  <Text className="text-zinc-400 font-bold text-base">
                    Set {i + 1}
                  </Text>
                  <Text
                    className="font-bold text-base uppercase tracking-wider"
                    style={{ color: getUnitColor(unit) }}
                  >
                    {unit}
                  </Text>
                </View>

                <View className="gap-3">
                  <SetRepsRow
                    label="LEFT"
                    value={reps[leftIndex]}
                    onIncrement={() => onUpdateRep(leftIndex, 1)}
                    onDecrement={() => onUpdateRep(leftIndex, -1)}
                    min={1}
                    size={stepperSize}
                    compact
                  />
                  <SetRepsRow
                    label="RIGHT"
                    value={reps[rightIndex]}
                    onIncrement={() => onUpdateRep(rightIndex, 1)}
                    onDecrement={() => onUpdateRep(rightIndex, -1)}
                    min={1}
                    size={stepperSize}
                    compact
                  />
                </View>
              </View>
            );
          })
        ) : (
          // Default: one row per set
          reps.map((repCount, i) => (
            <View
              key={i}
              className="bg-zinc-800 rounded-2xl p-4 mb-2 border border-zinc-700 mx-1"
            >
              <SetRepsRow
                label={`Set ${i + 1}`}
                unit={unit}
                value={repCount}
                onIncrement={() => onUpdateRep(i, 1)}
                onDecrement={() => onUpdateRep(i, -1)}
                min={1}
                size={stepperSize}
              />
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
