import React, { useMemo } from "react";
import { View, Text } from "react-native";
import NeckMapFront from "./NeckMapFront";
import NeckMapBack from "./NeckMapBack";
import { MUSCLE_MAPPING } from "@/constants/MuscleMappings";
import { MuscleWork } from "@/constants/Types";
import { EffectColors } from "@/constants/Colors";
import { ExerciseImpact } from "@/constants/Enums";

interface NeckMapProps {
    muscleGroups: MuscleWork[];
    height?: number;
}

export default function NeckMap({ muscleGroups, height = 200 }: NeckMapProps) {
    const width = height * (150 / 200);

    const muscleStyleMap = useMemo(() => {
        // ... (unchanged logic)
        const map: Record<string, { fill: string; stroke: string; strokeWidth: number; intensity: number }> = {};

        muscleGroups.forEach((work) => {
            const mappedIds = MUSCLE_MAPPING[work.muscleDescription];
            if (mappedIds) {
                const effectGroup = EffectColors[work.effect] || EffectColors.TRAIN;

                let color: string;
                if (work.impact === ExerciseImpact.PRIMARY) {
                    color = effectGroup.PRIMARY;
                } else if (work.impact === ExerciseImpact.SECONDARY) {
                    color = effectGroup.SECONDARY;
                } else {
                    color = effectGroup.STABILIZER;
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
    }, [muscleGroups]);

    return (
        <View className="flex-row justify-center items-start space-x-4 my-4">
            <View className="items-center">
                <NeckMapFront muscleStyleMap={muscleStyleMap} width={width} height={height} />
                <Text className="text-zinc-600 text-[10px] font-bold tracking-[0.2em] uppercase mt-2">Front</Text>
            </View>

            <View className="items-center">
                <NeckMapBack muscleStyleMap={muscleStyleMap} width={width} height={height} />
                <Text className="text-zinc-600 text-[10px] font-bold tracking-[0.2em] uppercase mt-2">Back</Text>
            </View>
        </View>
    );
}
