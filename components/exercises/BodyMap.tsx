import React, { useMemo } from "react";
import { View, Text } from "react-native";
import BodyMapFront from "./BodyMapFront";
import BodyMapBack from "./BodyMapBack";
import { MUSCLE_MAPPING } from "@/constants/MuscleMappings";
import { MuscleWork } from "@/constants/Types";
import { EffectColors, getCategoryColorVariants } from "@/constants/Colors";
import { ExerciseImpact } from "@/constants/Enums";

interface BodyMapProps {
  muscleGroups: MuscleWork[];
  height?: number;
  /** When set, muscles are colored by exercise category (e.g. PUSH, PULL, NECK) instead of effect. */
  categorySlug?: string;
}

export default function BodyMap({ muscleGroups, height = 400, categorySlug }: BodyMapProps) {
  const width = height * (170 / 400);

  const muscleStyleMap = useMemo(() => {
    const map: Record<string, { fill: string; stroke: string; strokeWidth: number; intensity: number }> = {};

    muscleGroups.forEach((work) => {
      const mappedIds = MUSCLE_MAPPING[work.muscleDescription];
      if (mappedIds) {
        let color: string;
        if (categorySlug) {
          const variants = getCategoryColorVariants(categorySlug);
          if (work.impact === ExerciseImpact.PRIMARY) {
            color = variants.PRIMARY;
          } else if (work.impact === ExerciseImpact.SECONDARY) {
            color = variants.SECONDARY;
          } else {
            color = variants.STABILIZER;
          }
        } else {
          const effectGroup = EffectColors[work.effect] || EffectColors.TRAIN;
          if (work.impact === ExerciseImpact.PRIMARY) {
            color = effectGroup.PRIMARY;
          } else if (work.impact === ExerciseImpact.SECONDARY) {
            color = effectGroup.SECONDARY;
          } else {
            color = effectGroup.STABILIZER;
          }
        }

        const intensity = 4 - work.impact;

        mappedIds.forEach((id) => {
          if (!map[id] || intensity > map[id].intensity) {
            map[id] = { fill: color, stroke: color, strokeWidth: 0.05, intensity };
          }
        });
      }
    });

    const finalMap: Record<string, { fill: string; stroke: string; strokeWidth: number }> = {};
    Object.entries(map).forEach(([id, data]) => {
      finalMap[id] = { fill: data.fill, stroke: data.stroke, strokeWidth: data.strokeWidth };
    });
    return finalMap;
  }, [muscleGroups, categorySlug]);

  return (
    <View className="flex-row justify-center items-start space-x-2 my-4">
      <View className="items-center">
        <BodyMapFront muscleStyleMap={muscleStyleMap} width={width} height={height} />
        <Text className="text-white text-sm font-bold tracking-widest uppercase -mt-2">Front</Text>
      </View>

      <View className="items-center">
        <BodyMapBack muscleStyleMap={muscleStyleMap} width={width} height={height} />
        <Text className="text-white text-sm font-bold tracking-widest uppercase -mt-2">Back</Text>
      </View>
    </View>
  );
}
