import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { WizardHeader } from "@/components/ui/WizardHeader";
import { ExerciseUnit } from "@/constants/Enums";
import { FontAwesome } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { SessionStep } from "./index";

interface Props {
  visible: boolean;
  exercises: any[];
  exerciseUnits: Record<string, ExerciseUnit>;
  steps: SessionStep[];
  completedSets: Record<string, boolean>;
  activeStepIndex: number;
  onSelectStep: (index: number) => void;
  onEditSet: (stepIndex: number) => void;
  onDeleteSet: (stepIndex: number) => void;
  onAddSet: (exerciseIndex: number) => void;
  onEndSession: () => void;
  onClose: () => void;
}

export function ExerciseListOverview({
  visible,
  exercises,
  exerciseUnits,
  steps,
  completedSets,
  activeStepIndex,
  onSelectStep,
  onEditSet,
  onDeleteSet,
  onAddSet,
  onEndSession,
  onClose,
}: Props) {
  const [deletingStepIndex, setDeletingStepIndex] = useState<number | null>(null);

  if (!visible) return null;

  const findStepIndex = (
    exerciseIndex: number,
    setIndex: number,
    side?: "LEFT" | "RIGHT",
  ) =>
    steps.findIndex(
      (s) =>
        s.exerciseIndex === exerciseIndex &&
        s.setIndex === setIndex &&
        (s.side ?? undefined) === side,
    );

  return (
    <View style={StyleSheet.absoluteFill} className="bg-background-dark z-50">
      <SafeAreaView edges={["top", "left", "right", "bottom"]} className="flex-1">
        <View className="px-6">
          <WizardHeader
            title="Exercise List"
            leftAccessory={<BackButton onPress={onClose} />}
          />
        </View>

        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {exercises.map((ex: any, exIndex: number) => (
            <View key={exIndex} className="mb-6">
              <Text className="text-white font-extrabold text-lg mb-2">
                {ex.name}
              </Text>
              <View className="gap-2">
                {Array.from({ length: ex.sets }).flatMap((_, setIndex) => {
                  const sides: (("LEFT" | "RIGHT") | undefined)[] = ex.isUnilateral
                    ? ["LEFT", "RIGHT"]
                    : [undefined];
                  return sides.map((side) => {
                    const setKey = `${exIndex}-${setIndex}-${side || "BILATERAL"}`;
                    const stepIdx = findStepIndex(exIndex, setIndex, side);
                    const isCompleted = !!completedSets[setKey];
                    const isCurrent = stepIdx === activeStepIndex;
                    const targetIndex = ex.isUnilateral
                      ? setIndex * 2 + (side === "RIGHT" ? 1 : 0)
                      : setIndex;
                    const count = Array.isArray(ex.reps)
                      ? ex.reps[targetIndex] ?? ex.reps[0] ?? 0
                      : ex.reps ?? 0;
                    const unitLabel =
                      exerciseUnits[ex.exerciseId] === ExerciseUnit.SECS
                        ? "Seconds"
                        : "Reps";

                    return (
                      <View
                        key={setKey}
                        className={`flex-row items-center justify-between rounded-2xl p-4 border ${
                          isCurrent
                            ? "bg-blue-600/10 border-blue-500"
                            : "bg-zinc-800 border-zinc-700"
                        }`}
                      >
                        <Pressable
                          onPress={() => onSelectStep(stepIdx)}
                          className="flex-1 flex-row items-center"
                        >
                          <Text className="text-white font-bold text-base">
                            {side ? `${side === "LEFT" ? "L" : "R"} ` : ""}
                            Set {setIndex + 1}
                          </Text>
                          <View className="flex-1 items-center flex-row justify-center gap-1.5">
                            <Text className="text-blue-400 font-extrabold text-xl">
                              {count}
                            </Text>
                            <Text className="text-zinc-500 font-bold text-xs uppercase tracking-widest">
                              {unitLabel}
                            </Text>
                          </View>
                          {isCompleted && (
                            <FontAwesome
                              name="check-circle"
                              size={14}
                              color="#22C55E"
                            />
                          )}
                        </Pressable>
                        <View className="flex-row gap-2">
                          <Button
                            onPress={() => onEditSet(stepIdx)}
                            variant="secondary"
                            size="sm"
                            icon="pencil"
                            className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700"
                          />
                          <Button
                            onPress={() => setDeletingStepIndex(stepIdx)}
                            variant="destructive"
                            size="sm"
                            icon="trash"
                            className="w-10 h-10 rounded-full"
                          />
                        </View>
                      </View>
                    );
                  });
                })}
              </View>
              <Button
                onPress={() => onAddSet(exIndex)}
                variant="outline"
                icon="plus"
                title="Add Set"
                className="mt-2 rounded-2xl"
              />
            </View>
          ))}
        </ScrollView>

        <View className="px-6 pb-4">
          <Button title="End Session" variant="destructive" onPress={onEndSession} />
        </View>
      </SafeAreaView>

      <ConfirmationDialog
        visible={deletingStepIndex !== null}
        title="Delete Set?"
        message="This will permanently remove this set from the exercise."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (deletingStepIndex !== null) onDeleteSet(deletingStepIndex);
          setDeletingStepIndex(null);
        }}
        onCancel={() => setDeletingStepIndex(null)}
      />
    </View>
  );
}
