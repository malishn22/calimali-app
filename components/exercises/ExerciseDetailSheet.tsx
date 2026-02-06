import { Badge } from "@/components/ui/Badge";
import { UnilateralIndicator } from "@/components/ui/UnilateralIndicator";
import { DifficultyColors, getCategoryColor } from "@/constants/Colors";
import { BOTTOM_SHEET_OFFSET } from "@/constants/Layout";
import { Exercise } from "@/constants/Types";
import { FontAwesome } from "@expo/vector-icons";
import React, { useMemo } from "react";
import MuscleMapView from "./MuscleMapView";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";

interface ExerciseDetailSheetProps {
  visible: boolean;
  exercise: Exercise | null;
  onClose: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.85;

const NECK_MUSCLE_GROUPS = [
  "front_neck_flexors",
  "front_neck_rotators",
  "front_neck_lateral_flexors",
  "back_neck_extensors",
  "back_neck_lateral_extensors",
  "back_neck_rotators",
];

export default function ExerciseDetailSheet({
  visible,
  exercise,
  onClose,
}: ExerciseDetailSheetProps) {
  const insets = useSafeAreaInsets();

  const isNeckExercise = useMemo(() => {
    if (!exercise?.muscleGroups) return false;
    return exercise.muscleGroups.some((group) =>
      NECK_MUSCLE_GROUPS.includes(group.muscleDescription)
    );
  }, [exercise?.muscleGroups]);

  const categorySlug = exercise?.category.slug.toUpperCase() || "OTHER";

  if (!visible || !exercise) return null;

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        className="flex-1 bg-black/60 justify-end"
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
      >
        <Pressable className="flex-1" onPress={onClose} />
        <Animated.View
          entering={SlideInDown.duration(500)}
          exiting={SlideOutDown.duration(200)}
          style={{
            height: SHEET_HEIGHT - 24 - BOTTOM_SHEET_OFFSET,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            backgroundColor: "#1c1c1e",
            overflow: "hidden",
            marginBottom: BOTTOM_SHEET_OFFSET,
          }}
        >
          {/* Header */}
          <View className="h-28 w-full items-center justify-center relative overflow-hidden bg-zinc-900">
            <View className="absolute inset-0 bg-blue-500/10" />
            <View className="w-64 h-64 bg-blue-500/20 rounded-full blur-3xl absolute -top-10 -right-10" />
            <View className="w-64 h-64 bg-purple-500/20 rounded-full blur-3xl absolute top-20 -left-10" />

            <View className="w-16 h-16 bg-card-dark rounded-full items-center justify-center border-2 border-zinc-800 shadow-xl">
              <Text className="text-2xl">
                {categorySlug === "PUSH"
                  ? "👊"
                  : categorySlug === "PULL"
                    ? "🦾"
                    : categorySlug === "LEGS"
                      ? "🦵"
                      : categorySlug === "CORE"
                        ? "🔥"
                        : categorySlug === "NECK"
                          ? "🧠"
                          : categorySlug === "MOBILITY"
                            ? "🤸"
                            : categorySlug === "STRETCH"
                              ? "🧘"
                              : categorySlug === "CARDIO"
                                ? "⚡"
                                : "✨"}
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              className="absolute top-4 right-4 w-10 h-10 bg-black/30 rounded-full items-center justify-center backdrop-blur-md"
            >
              <FontAwesome name="close" size={16} color="white" />
            </Pressable>
          </View>

          {/* Scrollable Content */}
          <ScrollView className="flex-1 px-8 pt-6">
            <View className="items-center mb-8">
              <Text className="text-3xl font-black text-white text-center mb-2 leading-tight">
                {exercise.name}
              </Text>

              <View className="flex-row gap-2 flex-wrap justify-center">
                <Badge
                  label={exercise.category.name}
                  color={getCategoryColor(categorySlug)}
                />
                <Badge
                  label={exercise.difficulty}
                  color={
                    DifficultyColors[exercise.difficulty as keyof typeof DifficultyColors] ||
                    "#52525B"
                  }
                />
                {exercise.is_unilateral && (
                  <UnilateralIndicator variant="badge" />
                )}
              </View>
            </View>

            {/* Stats Row */}
            <View className="flex-row justify-between mb-8 bg-black/20 p-4 rounded-2xl border border-zinc-800/50">
              <View className="items-center flex-1 border-r border-zinc-800/50">
                <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">
                  Target
                </Text>
                <Text className="text-white font-bold text-lg">
                  {exercise.default_reps > 0 ? exercise.default_reps : "-"}
                </Text>
                <Text className="text-zinc-600 text-[10px] lowercase">
                  {exercise.unit}
                </Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">
                  Equipment
                </Text>
                <Text
                  className="text-white font-bold text-lg text-center"
                  numberOfLines={1}
                >
                  {exercise.equipment}
                </Text>
              </View>
            </View>

            {/* Muscle Map - Body or Neck according to exercise targets */}
            {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
              <MuscleMapView
                muscleGroups={exercise.muscleGroups}
                displayMode={isNeckExercise ? "neck" : "body"}
              />
            )}

            {/* Instructions */}
            <View className="mb-12">
              <Text className="text-zinc-300 font-bold text-sm uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2">
                Instructions
              </Text>
              <Text className="text-zinc-400 leading-6 text-base">
                {exercise.description ||
                  "No description provided for this exercise."}
              </Text>
            </View>

            {/* Variations / Base Exercise */}
            {(exercise.baseExercise || (exercise.variants && exercise.variants.length > 0)) && (
              <View className="mb-12">
                <Text className="text-zinc-300 font-bold text-sm uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2">
                  Variations
                </Text>

                {exercise.baseExercise && (
                  <View className="mb-4">
                    <Text className="text-zinc-500 text-xs font-bold uppercase mb-1">Base Movement</Text>
                    <View className="bg-card-dark p-3 rounded-xl border border-zinc-800">
                      <Text className="text-white font-bold">{exercise.baseExercise.name}</Text>
                    </View>
                  </View>
                )}

                {exercise.variants && exercise.variants.length > 0 && (
                  <View>
                    <Text className="text-zinc-500 text-xs font-bold uppercase mb-1">
                      {exercise.baseExercise ? "Other Variations" : "Variations of this movement"}
                    </Text>
                    <View className="gap-2">
                      {exercise.variants.map(variant => (
                        <View key={variant.id} className="bg-card-dark p-3 rounded-xl border border-zinc-800">
                          <Text className="text-white font-bold">{variant.name}</Text>
                          <Text className="text-zinc-500 text-xs">{variant.difficulty}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}

            <View style={{ height: 100 + insets.bottom }} />
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
