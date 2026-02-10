import { getCategoryColor } from "@/constants/Colors";
import { Exercise, ScheduledSession, SessionHistory } from "@/constants/Types";
import { TintedSurface } from "@/components/ui/TintedSurface";
import { Api } from "@/services/api";
import {
  calculateSessionXP,
  XP_PER_SET,
} from "@/utilities/Gamification";
import { FontAwesome } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActiveSessionView } from "./ActiveSessionView";
import EditSetModal from "./EditSetModal";
import {
  SessionCompletion,
  SessionCompletionHandle,
} from "./SessionCompletion";
import { SessionControls } from "./SessionControls";
import { SessionHeader } from "./SessionHeader";

interface LiveSessionProps {
  session: ScheduledSession;
  onClose: () => void;
  onComplete: (data: SessionHistory) => void;
}

export default function LiveSession({
  session,
  onClose,
  onComplete,
}: LiveSessionProps) {
  // State
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isSessionStarted, setIsSessionStarted] = useState(false);

  const [completedSets, setCompletedSets] = useState<Record<string, boolean>>(
    {},
  );
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<number | null>(null);
  const completedDataRef = useRef<SessionHistory | null>(null);
  const completionModalRef = useRef<SessionCompletionHandle>(null);

  // Edit Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);

  const [exercises, setExercises] = useState<any[]>([]);
  const [currentExerciseDetails, setCurrentExerciseDetails] =
    useState<Exercise | null>(null);
  const exerciseCacheRef = useRef<Record<string, Exercise>>({});

  useEffect(() => {
    if (session) {
      setExercises(JSON.parse(session.exercises));
    }
  }, [session]);

  const steps = useMemo(() => {
    if (!exercises) return [];

    // Flatten: Each set is a step
    interface SessionStep {
      exerciseIndex: number;
      setIndex: number;
      exercise: any;
      totalSets: number;
      side?: "LEFT" | "RIGHT";
      repIndex?: number;
    }

    const _steps: SessionStep[] = [];

    exercises.forEach((ex: any, exIndex: number) => {
      for (let i = 0; i < ex.sets; i++) {
        if (ex.is_unilateral) {
          // UNILATERAL: Two steps per set (Left, Right)
          // Rep Index mapping: Left = setIndex * 2, Right = setIndex * 2 + 1
          _steps.push({
            exerciseIndex: exIndex,
            setIndex: i, // Logical set index
            exercise: ex,
            totalSets: ex.sets,
            side: "LEFT",
            repIndex: i * 2,
          });
          _steps.push({
            exerciseIndex: exIndex,
            setIndex: i,
            exercise: ex,
            totalSets: ex.sets,
            side: "RIGHT",
            repIndex: i * 2 + 1,
          });
        } else {
          // BILATERAL: One step per set
          _steps.push({
            exerciseIndex: exIndex,
            setIndex: i,
            exercise: ex,
            totalSets: ex.sets,
            // No side
            repIndex: i,
          });
        }
      }
    });
    return _steps;
  }, [exercises]);

  const currentStep = steps[activeStepIndex];
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? (activeStepIndex / totalSteps) * 100 : 0;

  useEffect(() => {
    const exerciseId = currentStep?.exercise?.exerciseId;
    if (!exerciseId) return;

    const cache = exerciseCacheRef.current;
    if (cache[exerciseId]) {
      setCurrentExerciseDetails(cache[exerciseId]);
    }

    let cancelled = false;
    Api.getExercise(exerciseId).then((ex) => {
      if (!cancelled && ex) {
        cache[exerciseId] = ex;
        setCurrentExerciseDetails(ex);
      }
    });

    const nextStep = steps[activeStepIndex + 1];
    if (nextStep?.exercise?.exerciseId) {
      const nextId = nextStep.exercise.exerciseId;
      if (!cache[nextId]) {
        Api.getExercise(nextId).then((ex) => {
          if (ex) cache[nextId] = ex;
        });
      }
    }

    return () => {
      cancelled = true;
    };
  }, [currentStep?.exercise?.exerciseId, activeStepIndex, steps]);

  useEffect(() => {
    if (isSessionStarted) {
      startTimer();
    } else {
      stopTimer();
    }

    // Cleanup on unmount
    return () => {
      stopTimer();
      completedDataRef.current = null;
    };
  }, [isSessionStarted]);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const markSetComplete = (stepIndex: number) => {
    const step = steps[stepIndex] as any; // Cast to access new props safely if TS complains
    if (!step) return;

    // Unique Key: exerciseIndex-setIndex-side
    const setKey = `${step.exerciseIndex}-${step.setIndex}-${step.side || "BILATERAL"}`;

    setCompletedSets((prev) => ({
      ...prev,
      [setKey]: true,
    }));
  };

  const getSetKey = (stepIndex: number) => {
    const step = steps[stepIndex] as any;
    if (!step) return "";
    return `${step.exerciseIndex}-${step.setIndex}-${step.side || "BILATERAL"}`;
  };

  const handleMainAction = () => {
    if (!isSessionStarted) {
      setIsSessionStarted(true);
      return;
    }

    const setKey = getSetKey(activeStepIndex);
    const alreadyCompleted = !!completedSets[setKey];

    if (!alreadyCompleted) {
      markSetComplete(activeStepIndex);
    }

    // If Last Step
    if (activeStepIndex >= totalSteps - 1) {
      handleFinish();
    } else {
      setActiveStepIndex((prev) => prev + 1);
    }
  };

  const handleFinish = async () => {
    stopTimer();
    // Save immediately upon finishing the session
    await handleSaveData();

    // Update Stats
    try {
      let totalRepsInSession = 0;
      exercises.forEach((ex) => {
        if (Array.isArray(ex.reps)) {
          ex.reps.forEach((r: number) => (totalRepsInSession += r));
        } else {
          totalRepsInSession += ex.reps * (ex.sets || 1);
        }
      });

      const totalSets = steps.length;
      let varietyBonus = 0;

      try {
        const [profile, history] = await Promise.all([
          Api.getUserProfile(),
          Api.getSessionHistory(),
        ]);
        if (profile.streak_current >= 1 && history.length > 0) {
          const lastSession = history[0];
          const parsed = (() => {
            try {
              return typeof lastSession.performance_data === "string"
                ? JSON.parse(lastSession.performance_data)
                : lastSession.performance_data;
            } catch {
              return { exercises: [] };
            }
          })();
          const lastExerciseIds = new Set(
            (parsed.exercises || [])
              .map((e: any) => e.exerciseId || e.exercise_id)
              .filter(Boolean),
          );
          const currentExerciseIds = new Set(
            exercises.map((e: any) => e.exerciseId || e.id).filter(Boolean),
          );
          const newInCurrent = [...currentExerciseIds].filter(
            (id) => !lastExerciseIds.has(id),
          );
          if (newInCurrent.length >= 2) varietyBonus = 5;
        }
      } catch (_) {
        // Ignore – bonus is optional
      }

      const xpEarned = calculateSessionXP(totalSets, varietyBonus);

      const applyResult = await Api.applyStats(xpEarned, totalRepsInSession);

      const presentCompletion = (stats: { id: string; xp: number; level: number; streak_current: number; streak_best: number; streak_start_date: string | null; total_reps: number }) => {
        completionModalRef.current?.present(xpEarned, stats, {
          baseXP: totalSets * XP_PER_SET,
          bonusXP: varietyBonus,
        });
      };

      if (applyResult.streakBreakSuggested && applyResult.daysSinceLastActivity != null) {
        const days = applyResult.daysSinceLastActivity;
        Alert.alert(
          "Long break",
          `You've been away for ${days} days. Keep your streak or start fresh?`,
          [
            { text: "Keep streak", style: "cancel", onPress: () => presentCompletion(applyResult.profile) },
            {
              text: "Reset",
              style: "destructive",
              onPress: async () => {
                const updatedProfile = await Api.resetStreak();
                presentCompletion(updatedProfile);
              },
            },
          ],
          { cancelable: false }
        );
      } else {
        presentCompletion(applyResult.profile);
      }
    } catch (e) {
      console.error("Failed to update stats", e);
      completionModalRef.current?.present(
        calculateSessionXP(steps.length),
        {
          id: "user",
          xp: 0,
          level: 1,
          streak_current: 0,
          streak_best: 0,
          streak_start_date: new Date().toISOString(),
          total_reps: 0,
        },
        { baseXP: steps.length * XP_PER_SET },
      );
    }
  };

  const handleSaveData = async () => {
    if (!session) return;
    const historyData: SessionHistory = {
      id: Date.now().toString(),
      session_id: session.id,
      date: new Date().toISOString(),
      performance_data: JSON.stringify({
        elapsedTime,
        exercises, // Saving original exercise structure
        completedSets, // Maps correctly to indices
      }),
    };

    await Api.postSession(historyData);
    completedDataRef.current = historyData;
  };

  /* New Handlers for Bottom Sheet Sequencing */

  // Triggered by "Continue" button -> Just navigate, don't wait for close
  const handleCompletionContinue = () => {
    if (completedDataRef.current) {
      onComplete(completedDataRef.current);
    } else {
      onComplete({} as SessionHistory);
    }
  };

  const handleBack = () => {
    if (activeStepIndex > 0 && isSessionStarted) {
      setActiveStepIndex((prev) => prev - 1);
    } else {
      // Exit confirmation
      Alert.alert("End Session?", "Progress won't be saved.", [
        { text: "Cancel", style: "cancel" },
        { text: "End", style: "destructive", onPress: onClose },
      ]);
    }
  };

  const handleEditSet = () => {
    setEditingStepIndex(activeStepIndex);
    setEditModalVisible(true);
  };

  // ... (handleSaveSet, getRepCountForStep, etc. unchanged)

  const handleSaveSet = (newReps: number) => {
    if (editingStepIndex === null) return;
    const step = steps[editingStepIndex] as any;
    if (!step) return;

    const newExercises = [...exercises];
    const exercise = newExercises[step.exerciseIndex];
    const currentReps = exercise.reps;

    // Ensure array structure
    let updatedRepsArray = Array.isArray(currentReps)
      ? [...currentReps]
      : [currentReps];

    // Update specific rep index
    const targetRepIndex =
      step.repIndex !== undefined ? step.repIndex : step.setIndex;
    updatedRepsArray[targetRepIndex] = newReps;

    // LINKED EDITING Logic for Unilateral
    if (exercise.is_unilateral) {
      // If "side" is present, we know which one we edited.
      // Left is even (0, 2..), Right is odd (1, 3..)
      // We want to update the PAIR.
      // If index is EVEN (Left) -> Update index + 1 (Right)
      if (targetRepIndex % 2 === 0) {
        if (targetRepIndex + 1 < updatedRepsArray.length) {
          updatedRepsArray[targetRepIndex + 1] = newReps;
        }
      }
      // If index is ODD (Right) -> Update index - 1 (Left)
      else {
        if (targetRepIndex - 1 >= 0) {
          updatedRepsArray[targetRepIndex - 1] = newReps;
        }
      }
    }

    newExercises[step.exerciseIndex].reps = updatedRepsArray;
    setExercises(newExercises);
    setEditModalVisible(false);
  };

  const getRepCountForStep = (stepIndex: number) => {
    const step = steps[stepIndex] as any;
    if (!step) return 0;
    const ex = exercises[step.exerciseIndex]; // Get latest state
    if (!ex) return 0;

    const targetIndex =
      step.repIndex !== undefined ? step.repIndex : step.setIndex;

    if (Array.isArray(ex.reps)) {
      return ex.reps[targetIndex] ?? ex.reps[0] ?? 0;
    }
    return ex.reps ?? 0;
  };

  const handleDeleteSet = () => {
    if (editingStepIndex === null) return;
    const step = steps[editingStepIndex];
    if (!step) return;

    const newExercises = [...exercises];
    const exercise = newExercises[step.exerciseIndex];

    if (exercise.sets > 1) {
      exercise.sets -= 1;
      setExercises(newExercises);
      if (activeStepIndex >= steps.length - 1) {
        if (activeStepIndex > 0) setActiveStepIndex(activeStepIndex - 1);
      }
    } else {
      Alert.alert("Cannot delete", "You must have at least one set.");
    }
    setEditModalVisible(false);
  };

  if (!session || !currentStep) return null;

  const isCurrentSetCompleted = !!completedSets[
    `${currentStep.exerciseIndex}-${currentStep.setIndex}-${(currentStep as any).side || "BILATERAL"}`
  ];

  let mainActionLabel = "Next";
  let mainActionVariant: "primary" | "completed" | "start" = "primary";
  let mainActionIcon: keyof typeof FontAwesome.glyphMap | undefined = undefined;

  if (!isSessionStarted) {
    mainActionLabel = "Start Session";
    mainActionVariant = "start";
    mainActionIcon = "bolt";
  } else if (activeStepIndex >= totalSteps - 1) {
    mainActionLabel = "Complete Session";
    mainActionVariant = "completed";
    mainActionIcon = "bolt";
  } else if (isCurrentSetCompleted) {
    mainActionLabel = "Next";
    mainActionVariant = "primary";
    mainActionIcon = "chevron-right";
  } else {
    mainActionLabel = "Complete Set";
    mainActionVariant = "completed";
    mainActionIcon = "check";
  }

  const currentId = currentStep?.exercise?.exerciseId;
  const displayExercise =
    currentId &&
    (currentExerciseDetails?.id === currentId
      ? currentExerciseDetails
      : exerciseCacheRef.current[currentId] ?? null);

  const categorySlug =
    displayExercise?.category?.slug?.toUpperCase() ??
    (currentStep?.exercise as { categorySlug?: string })?.categorySlug?.toUpperCase();

  const mainContent = (
    <ActiveSessionView
      exercise={displayExercise ?? undefined}
      sessionExercise={currentStep.exercise}
      stepIndex={activeStepIndex}
      exerciseIndex={currentStep.exerciseIndex}
      totalExercises={exercises.length}
      currentSetIndex={
        currentStep.exercise.is_unilateral
          ? currentStep.setIndex * 2 + (currentStep.side === "RIGHT" ? 1 : 0)
          : currentStep.setIndex
      }
      totalSets={
        currentStep.exercise.is_unilateral
          ? (currentStep.exercise.sets || 1) * 2
          : currentStep.exercise.sets || 1
      }
      isSetCompleted={!!isCurrentSetCompleted}
      onEditSet={handleEditSet}
      side={(currentStep as any).side}
      currentReps={getRepCountForStep(activeStepIndex)}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-background-dark">
      <SessionHeader
        title={session.title}
        elapsedTime={elapsedTime}
        progress={progress}
        onClose={() => {
          Alert.alert("End Session?", "Progress won't be saved.", [
            { text: "Cancel", style: "cancel" },
            { text: "End", style: "destructive", onPress: onClose },
          ]);
        }}
      />

      <View style={{ flex: 1 }}>
        {categorySlug ? (
          <TintedSurface
            tintColor={getCategoryColor(categorySlug)}
            variant="gradient"
            tintAt="bottom"
            intensity={0.1}
            style={{ flex: 1 }}
          >
            {mainContent}
          </TintedSurface>
        ) : (
          <View style={{ flex: 1 }}>{mainContent}</View>
        )}
        <View className="bg-background-dark">
          <SessionControls
            onBack={handleBack}
            onMainAction={handleMainAction}
            mainActionLabel={mainActionLabel}
            mainActionIcon={mainActionIcon}
            mainActionVariant={mainActionVariant}
            backLabel={""}
          />
        </View>
      </View>

      {/* Edit Set Modal */}
      {editingStepIndex !== null && steps[editingStepIndex] && (
        <EditSetModal
          visible={editModalVisible}
          initialReps={getRepCountForStep(editingStepIndex)}
          onClose={() => setEditModalVisible(false)}
          onSave={handleSaveSet}
          onDelete={handleDeleteSet}
        />
      )}

      <SessionCompletion
        ref={completionModalRef}
        elapsedTime={elapsedTime}
        onContinue={handleCompletionContinue}
      />
    </SafeAreaView>
  );
}
