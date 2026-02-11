import MuscleMapView from "@/components/exercises/MuscleMapView";
import { Badge } from "@/components/ui/Badge";
import { getCategoryColor } from "@/constants/Colors";
import { NECK_MUSCLE_GROUPS } from "@/constants/MuscleMappings";
import { Exercise, SessionExercise } from "@/constants/Types";
import { FontAwesome } from "@expo/vector-icons";
import React, { useEffect, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";

interface Props {
  /** Fetched exercise used for display (description, category, muscle map). Fallback to sessionExercise when null. */
  exercise?: Exercise | null;
  /** Session row (sets, reps, name) for live state. */
  sessionExercise: SessionExercise;
  exerciseIndex: number;
  totalExercises: number;
  currentSetIndex: number;
  totalSets: number;
  isSetCompleted: boolean;
  onEditSet: () => void;
  side?: "LEFT" | "RIGHT";
  currentReps: number;
  /** Step index from parent - when this changes and set is completed, animation replays */
  stepIndex: number;
}

export function ActiveSessionView({
  exercise,
  sessionExercise,
  exerciseIndex,
  totalExercises,
  currentSetIndex,
  totalSets,
  isSetCompleted,
  onEditSet,
  side,
  currentReps,
  stepIndex,
}: Props) {
  const description = exercise?.description ?? sessionExercise.description;
  const muscleGroups = exercise?.muscleGroups ?? sessionExercise.muscleGroups;
  const categorySlug =
    exercise?.category?.slug ?? (sessionExercise as { categorySlug?: string }).categorySlug;

  const checkScale = useSharedValue(1);

  useEffect(() => {
    if (isSetCompleted) {
      cancelAnimation(checkScale);
      checkScale.value = 1;
      checkScale.value = withSequence(
        withSpring(1.2, { damping: 12 }),
        withSpring(1)
      );
    } else {
      checkScale.value = 1;
    }
  }, [isSetCompleted, stepIndex]);

  const animatedCheckStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const isNeckExercise = useMemo(() => {
    if (!muscleGroups?.length) return false;
    return muscleGroups.some((group) =>
      NECK_MUSCLE_GROUPS.includes(group.muscleDescription)
    );
  }, [muscleGroups]);

  return (
    <View className="flex-1 items-center justify-start pt-10 px-6">
      {/* Exercise Info */}
      <View className="items-center mb-4 relative w-full">
        {isSetCompleted && (
          <Animated.View
            style={animatedCheckStyle}
            className="absolute right-0 top-0"
          >
            <FontAwesome name="check-circle" size={32} color="#22C55E" />
          </Animated.View>
        )}
        {categorySlug && (
          <Badge
            label={categorySlug.toUpperCase()}
            color={getCategoryColor(categorySlug)}
            size="md"
            className="mb-4"
          />
        )}

        <Text className="text-4xl text-center font-black text-white mb-2 leading-tight">
          {exercise?.name ?? sessionExercise.name}
        </Text>

        {description ? (
          <Text className="text-zinc-400 text-center text-sm px-4 leading-relaxed mb-4">
            {description}
          </Text>
        ) : null}
      </View>

      {/* Set Card */}
      <View className="w-full px-6 items-center relative">
        <View className="flex-row items-center justify-center w-full relative">
          <View className="flex-row items-start">
            <Text className="text-6xl font-black text-white leading-none">
              {currentReps ?? "-"}
            </Text>
            <Text className="text-zinc-500 font-bold ml-2 text-lg">REPS</Text>
          </View>
          <Pressable
            onPress={onEditSet}
            className="absolute right-8 w-12 h-12 bg-zinc-800 rounded-full items-center justify-center"
          >
            <FontAwesome name="pencil" size={16} color="#71717a" />
          </Pressable>
        </View>
      </View>

      {/* Muscle Map - Body or Neck according to exercise targets */}
      <View className="flex-1 justify-center items-center mb-8">
        <MuscleMapView
          muscleGroups={muscleGroups ?? []}
          displayMode={isNeckExercise ? "neck" : "body"}
          height={300}
          categorySlug={categorySlug}
        />
      </View>
    </View>
  );
}
