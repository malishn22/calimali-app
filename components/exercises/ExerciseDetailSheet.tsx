import { CategoryColors } from "@/constants/Colors";
import { Exercise } from "@/constants/Types";
import { FontAwesome } from "@expo/vector-icons";
import React, { useMemo } from "react";
import BodyMap from "./BodyMap";
import NeckMap from "./NeckMap";
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

  const getCategoryColor = (category: string) => {
    return (
      CategoryColors[category as keyof typeof CategoryColors] ||
      CategoryColors.OTHER
    );
  };

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
            height: SHEET_HEIGHT - (insets.bottom + 80),
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            backgroundColor: "#1c1c1e",
            overflow: "hidden",
            marginBottom: insets.bottom + 40,
          }}
        >
          {/* Header */}
          <View className="h-28 w-full items-center justify-center relative overflow-hidden bg-zinc-900">
            <View className="absolute inset-0 bg-blue-500/10" />
            <View className="w-64 h-64 bg-blue-500/20 rounded-full blur-3xl absolute -top-10 -right-10" />
            <View className="w-64 h-64 bg-purple-500/20 rounded-full blur-3xl absolute top-20 -left-10" />

            <View className="w-16 h-16 bg-card-dark rounded-full items-center justify-center border-2 border-zinc-800 shadow-xl">
              <Text className="text-2xl">
                {exercise.category === "PUSH"
                  ? "👊"
                  : exercise.category === "PULL"
                    ? "🦾"
                    : exercise.category === "LEGS"
                      ? "🦵"
                      : exercise.category === "CORE"
                        ? "🔥"
                        : exercise.category === "NECK"
                          ? "🧠"
                          : exercise.category === "MOBILITY"
                            ? "🤸"
                            : exercise.category === "STRETCH"
                              ? "🧘"
                              : exercise.category === "CARDIO"
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
                <View
                  className="px-3 py-1 rounded-full border"
                  style={{
                    borderColor: getCategoryColor(exercise.category),
                    backgroundColor: `${getCategoryColor(exercise.category)}20`,
                  }}
                >
                  <Text
                    className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: getCategoryColor(exercise.category) }}
                  >
                    {exercise.category}
                  </Text>
                </View>

                <View className="px-3 py-1 rounded-full border border-zinc-700 bg-zinc-800">
                  <Text className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">
                    {exercise.difficulty}
                  </Text>
                </View>

                {exercise.is_unilateral && (
                  <View className="px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10">
                    <Text className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                      Unilateral
                    </Text>
                  </View>
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

            {/* Body/Neck Map - Visual representation only */}
            {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
              <View className="mb-8">
                {isNeckExercise ? (
                  <NeckMap muscleGroups={exercise.muscleGroups} />
                ) : (
                  <BodyMap muscleGroups={exercise.muscleGroups} />
                )}
              </View>
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

            <View style={{ height: 100 }} />
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
