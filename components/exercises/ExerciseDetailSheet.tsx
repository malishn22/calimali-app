import { CategoryColors } from "@/constants/Colors";
import { Exercise } from "@/constants/Types";
import { FontAwesome } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

interface ExerciseDetailSheetProps {
  visible: boolean;
  exercise: Exercise | null;
  onClose: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.85;

export default function ExerciseDetailSheet({
  visible,
  exercise,
  onClose,
}: ExerciseDetailSheetProps) {
  const [showModal, setShowModal] = useState(false);
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 90,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SHEET_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setShowModal(false));
    }
  }, [visible]);

  if (!showModal || !exercise) return null;

  const getCategoryColor = (category: string) => {
    return (
      CategoryColors[category as keyof typeof CategoryColors] ||
      CategoryColors.OTHER
    );
  };

  return (
    <Modal
      visible={showModal}
      transparent
      statusBarTranslucent
      animationType="fade"
    >
      <View className="flex-1 bg-black/60 justify-end">
        <Pressable className="flex-1" onPress={onClose} />
        <Animated.View
          style={{
            height: SHEET_HEIGHT,
            transform: [{ translateY: slideAnim }],
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            backgroundColor: "#1c1c1e", // Background Dark, slightly lighter
            overflow: "hidden",
          }}
        >
          {/* Header Image / Icon Area */}
          <View className="h-48 w-full items-center justify-center relative overflow-hidden bg-zinc-900">
            {/* Gradient or Pattern Background */}
            <View className="absolute inset-0 bg-blue-500/10" />
            <View className="w-64 h-64 bg-blue-500/20 rounded-full blur-3xl absolute -top-10 -right-10" />
            <View className="w-64 h-64 bg-purple-500/20 rounded-full blur-3xl absolute top-20 -left-10" />

            {/* Main Icon */}
            <View className="w-24 h-24 bg-card-dark rounded-full items-center justify-center border-4 border-zinc-800 shadow-2xl">
              <Text className="text-4xl">
                {exercise.category === "PUSH"
                  ? "👊"
                  : exercise.category === "PULL"
                    ? "🦾"
                    : exercise.category === "LEGS"
                      ? "🦵"
                      : exercise.category === "CORE"
                        ? "🔥"
                        : exercise.category === "SKILLS"
                          ? "🤸"
                          : "⚡"}
              </Text>
            </View>

            {/* Close Button Absolute */}
            <Pressable
              onPress={onClose}
              className="absolute top-4 right-4 w-10 h-10 bg-black/30 rounded-full items-center justify-center backdrop-blur-md"
            >
              <FontAwesome name="close" size={16} color="white" />
            </Pressable>
          </View>

          {/* Content */}
          <ScrollView className="flex-1 px-8 pt-6">
            {/* Title & Category */}
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

            {/* Description */}
            <View className="mb-12">
              <Text className="text-zinc-300 font-bold text-sm uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2">
                Instructions
              </Text>
              <Text className="text-zinc-400 leading-6 text-base">
                {exercise.description ||
                  "No description provided for this exercise."}
              </Text>
            </View>

            <View className="h-20" />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
