import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Badge } from "@/components/ui/Badge";
import { TintedSurface } from "@/components/ui/TintedSurface";
import { UnilateralIndicator } from "@/components/ui/UnilateralIndicator";
import { DifficultyColors, getCategoryColor, getUnitColor } from "@/constants/Colors";
import { NECK_MUSCLE_GROUPS } from "@/constants/MuscleMappings";
import { Exercise } from "@/constants/Types";
import { useBottomSheetModal } from "@/hooks/useBottomSheetModal";
import { capitalizeWords } from "@/utilities/stringUtils";
import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MuscleMapView from "./MuscleMapView";

interface ExerciseDetailSheetProps {
  visible: boolean;
  exercise: Exercise | null;
  onClose: () => void;
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="text-zinc-300 font-bold text-sm uppercase tracking-widest mb-4 border-b border-zinc-600 pb-2">
      {title}
    </Text>
  );
}

export default function ExerciseDetailSheet({
  visible,
  exercise,
  onClose,
}: ExerciseDetailSheetProps) {
  const insets = useSafeAreaInsets();
  const {
    ref: bottomSheetRef,
    snapPoints,
    handleSheetChanges,
    renderBackdrop,
    commonProps,
  } = useBottomSheetModal(visible, !!exercise, onClose, { backdropOpacity: 0.6 });

  const isNeckExercise = useMemo(() => {
    if (!exercise?.muscleGroups) return false;
    return exercise.muscleGroups.some((group) =>
      NECK_MUSCLE_GROUPS.includes(group.muscleDescription)
    );
  }, [exercise?.muscleGroups]);

  const categorySlug = exercise?.category?.slug?.toUpperCase() ?? "OTHER";

  if (!exercise) return null;

  const categoryTint = getCategoryColor(categorySlug);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      enableDynamicSizing={false}
      enableContentPanningGesture
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      {...commonProps}
      handleIndicatorStyle={{ backgroundColor: "#71717a" }}
    >
      <TintedSurface tintColor={categoryTint} variant="gradient" tintAt="bottom" intensity={0.1} style={{ flex: 1 }}>
        <BottomSheetScrollView
          style={{ backgroundColor: "transparent" }}
          contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
          showsVerticalScrollIndicator
        >
        {/* Content */}
        <View style={{ paddingHorizontal: 32, paddingTop: 20 }}>
            <View className="items-center mb-6">
              <Text className="text-3xl font-black text-white text-center leading-tight mb-3">
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
            <View className="flex-row rounded-2xl overflow-hidden border border-zinc-800/50 bg-zinc-900/60">
              <View className="flex-1 items-center justify-center py-4 px-3 border-r border-zinc-700/40">
                <Text className="text-zinc-500 text-[10px] font-semibold uppercase tracking-widest mb-2">
                  Target
                </Text>
                <View className="flex-row items-baseline gap-1.5">
                  <Text className="text-white font-bold text-xl">
                    {exercise.default_reps > 0 ? exercise.default_reps : "-"}
                  </Text>
                  <Text
                    className="text-sm font-medium"
                    style={{ color: getUnitColor(exercise.unit) }}
                  >
                    {exercise.unit}
                  </Text>
                </View>
              </View>
              <View className="flex-1 items-center justify-center py-4 px-3">
                <Text className="text-zinc-500 text-[10px] font-semibold uppercase tracking-widest mb-2">
                  Equipment
                </Text>
                <Text
                  className="text-white font-bold text-center text-xl"
                  numberOfLines={2}
                >
                  {capitalizeWords(exercise.equipment ?? "")}
                </Text>
              </View>
            </View>

            {/* Muscle Map - Body or Neck according to exercise targets */}
            {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
              <View className={isNeckExercise ? "mt-0" : "-mt-6"}>
                <MuscleMapView
                  muscleGroups={exercise.muscleGroups}
                  displayMode={isNeckExercise ? "neck" : "body"}
                  categorySlug={exercise.category?.slug}
                />
              </View>
            )}

            {/* Instructions */}
            <View className="mb-12">
              <SectionHeader title="Instructions" />
              <Text className="text-zinc-400 leading-6 text-base">
                {exercise.description ||
                  "No description provided for this exercise."}
              </Text>
            </View>

            {/* Variations / Base Exercise */}
            {(exercise.baseExercise || (exercise.variants && exercise.variants.length > 0)) && (
              <View className="mb-12">
                <SectionHeader title="Variations" />
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
        </View>
        </BottomSheetScrollView>
      </TintedSurface>
    </BottomSheetModal>
  );
}
