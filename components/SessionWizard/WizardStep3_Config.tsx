import { Exercise } from "@/services/Database";
import React, { useState } from "react";
import { Text, View } from "react-native";
import { Button } from "../ui/Button";

interface Props {
  exercise: Exercise;
  onConfirm: (sets: number, reps: number) => void;
}

export function WizardStep3_Config({ exercise, onConfirm }: Props) {
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);

  return (
    <View className="flex-1">
      <View className="mb-8">
        <Text className="text-3xl font-extrabold text-white mb-2 leading-8">
          {exercise.name}
        </Text>
        <Text className="text-zinc-500 font-bold uppercase tracking-widest text-xs">
          Configure Volume
        </Text>
      </View>

      <View className="gap-8">
        {/* Sets */}
        <View className="bg-card-dark p-6 rounded-3xl items-center border border-zinc-800">
          <Text className="text-zinc-400 font-bold text-xs uppercase tracking-widest mb-4">
            Sets
          </Text>
          <View className="flex-row items-center gap-8">
            <Button
              variant="secondary"
              icon="minus"
              size="sm"
              onPress={() => setSets(Math.max(1, sets - 1))}
              className="w-12 h-12 rounded-full !p-0"
            />
            <Text className="text-5xl font-extrabold text-white w-20 text-center">
              {sets}
            </Text>
            <Button
              variant="primary"
              icon="plus"
              size="sm"
              onPress={() => setSets(sets + 1)}
              className="w-12 h-12 rounded-full !p-0"
            />
          </View>
        </View>

        {/* Reps */}
        <View className="bg-card-dark p-6 rounded-3xl items-center border border-zinc-800">
          <Text className="text-zinc-400 font-bold text-xs uppercase tracking-widest mb-4">
            Reps
          </Text>
          <View className="flex-row items-center gap-8">
            <Button
              variant="secondary"
              icon="minus"
              size="sm"
              onPress={() => setReps(Math.max(1, reps - 1))}
              className="w-12 h-12 rounded-full !p-0"
            />
            <Text className="text-5xl font-extrabold text-white w-20 text-center">
              {reps}
            </Text>
            <Button
              variant="primary"
              icon="plus"
              size="sm"
              onPress={() => setReps(reps + 1)}
              className="w-12 h-12 rounded-full !p-0"
            />
          </View>
        </View>
      </View>

      <View className="flex-1 justify-end">
        <Button
          title="Confirm"
          onPress={() => onConfirm(sets, reps)}
          size="lg"
        />
      </View>
    </View>
  );
}
