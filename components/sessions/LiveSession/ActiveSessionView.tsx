import MuscleMapView from "@/components/exercises/MuscleMapView";
import { Badge } from "@/components/ui/Badge";
import { CircularTimer } from "@/components/ui/CircularTimer";
import { PageDots } from "@/components/ui/PageDots";
import { getCategoryColor } from "@/constants/Colors";
import { ExerciseUnit } from "@/constants/Enums";
import { NECK_MUSCLE_GROUPS } from "@/constants/MuscleMappings";
import { Exercise, SessionExercise } from "@/constants/Types";
import { FontAwesome } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
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
  side?: "LEFT" | "RIGHT";
  currentReps: number;
  /** Step index from parent - when this changes and set is completed, animation replays */
  stepIndex: number;
  /** Present while this step's hold countdown is actively running; null/undefined otherwise. */
  holdTimer?: { remaining: number; total: number } | null;
}

const PAGE_COUNT = 2;

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function ActiveSessionView({
  exercise,
  sessionExercise,
  exerciseIndex,
  totalExercises,
  currentSetIndex,
  totalSets,
  isSetCompleted,
  side,
  currentReps,
  stepIndex,
  holdTimer,
}: Props) {
  const description = exercise?.description ?? sessionExercise.description;
  const muscleGroups = exercise?.muscleGroups ?? sessionExercise.muscleGroups;
  const categorySlug =
    exercise?.category?.slug ?? (sessionExercise as { categorySlug?: string }).categorySlug;
  const isHoldExercise = exercise?.unit === ExerciseUnit.SECS;

  const { width } = useWindowDimensions();
  const [activePage, setActivePage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  // Moving to a new step (via the bottom bar's StepNavPill) should always
  // land back on page 1 — otherwise the pager stays scrolled to page 2 for
  // an exercise the user never swiped there on.
  useEffect(() => {
    scrollRef.current?.scrollTo({ x: 0, animated: false });
    setActivePage(0);
  }, [stepIndex]);

  const handleMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / width);
    setActivePage(page);
  };

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
    <View className="flex-1 pt-6">
      <View className="mb-4">
        <PageDots count={PAGE_COUNT} activeIndex={activePage} />
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Page 1: category pill pinned near the top; name and reps follow
            with the same fixed gap each, rather than stretched flex spacing. */}
        <View style={{ width }} className="items-center px-6 pt-8">
          <View className="items-center relative w-full mb-20">
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
              />
            )}
          </View>

          <Text className="text-4xl text-center font-black text-white leading-tight mb-20">
            {exercise?.name ?? sessionExercise.name}
          </Text>

          {/* Set Card */}
          <View className="w-full px-6 items-center relative">
            {isHoldExercise ? (
              <CircularTimer
                progress={holdTimer ? holdTimer.remaining / holdTimer.total : 1}
                label={formatTime(holdTimer ? holdTimer.remaining : currentReps ?? 0)}
                size={180}
                color={categorySlug ? getCategoryColor(categorySlug) : undefined}
              />
            ) : (
              <View className="items-center">
                <Text className="text-5xl font-black text-white leading-none">
                  {currentReps ?? "-"}
                </Text>
                <Text className="text-zinc-500 font-bold text-[11px] uppercase tracking-widest mt-1.5">
                  Reps
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Page 2: muscle map (front/back) + description */}
        <View style={{ width }} className="flex-1 items-center justify-center px-6">
          {/* MuscleMapView/BodyMap carry their own ~48px of built-in bottom
              margin (mb-8 + my-4) — cancel it here so the description sits
              close, and give it back as a small intentional gap below. */}
          <View className="-mb-12">
            <MuscleMapView
              muscleGroups={muscleGroups ?? []}
              displayMode={isNeckExercise ? "neck" : "body"}
              height={300}
              categorySlug={categorySlug}
            />
          </View>

          {description ? (
            <Text className="text-zinc-400 text-center text-sm px-4 leading-relaxed mt-3">
              {description}
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
