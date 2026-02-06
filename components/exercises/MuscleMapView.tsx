import { MuscleWork } from "@/constants/Types";
import React, { useMemo } from "react";
import { Text, View } from "react-native";
import BodyMap from "./BodyMap";
import NeckMap from "./NeckMap";

export type MuscleMapDisplayMode = "body" | "neck";

export interface MuscleMapViewProps {
  muscleGroups: MuscleWork[];
  /** Which map to display: body (full torso) or neck. Caller determines based on exercise. */
  displayMode: MuscleMapDisplayMode;
  /** Height for body map (neck uses proportional size) */
  height?: number;
}

/**
 * Reusable muscle map component. Displays either body or neck map
 * according to displayMode. Caller passes the appropriate mode
 * based on which muscles the exercise targets.
 */
export default function MuscleMapView({
  muscleGroups,
  displayMode,
  height = 400,
}: MuscleMapViewProps) {
  const neckHeight = useMemo(() => Math.round(height * (160 / 300)), [height]);

  if (!muscleGroups || muscleGroups.length === 0) {
    return (
      <View className="h-[160px] justify-center items-center my-4">
        <Text className="text-zinc-700 italic">No muscle data</Text>
      </View>
    );
  }

  return (
    <View className="mb-8">
      {displayMode === "body" ? (
        <BodyMap muscleGroups={muscleGroups} height={height} />
      ) : (
        <NeckMap muscleGroups={muscleGroups} height={neckHeight} />
      )}
    </View>
  );
}
