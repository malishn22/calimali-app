import { getCategoryColor } from "@/constants/Colors";
import { ExerciseUnit } from "@/constants/Enums";
import { Exercise, Routine, SessionHistory } from "@/constants/Types";
import { TintedSurface } from "@/components/ui/TintedSurface";
import { Toast } from "@/components/ui/Toast";
import { Api } from "@/services/api";
import {
  calculateSessionXP,
  XP_PER_SET,
} from "@/utilities/Gamification";
import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, BackHandler, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ActiveSessionView } from "./ActiveSessionView";
import EditSetModal from "./EditSetModal";
import { ExerciseListOverview } from "./ExerciseListOverview";
import { RestView } from "./RestView";
import {
  SessionCompletion,
  SessionCompletionHandle,
} from "./SessionCompletion";
import { SessionControls } from "./SessionControls";
import { SessionHeader } from "./SessionHeader";

// Deferred: user-configurable (Off/10s/30s/1m/2m/5m) via a future settings
// feature, appearing in both Live Session and app Settings.
const REST_DURATION_SECONDS = 60;

interface ActiveTimer {
  type: "hold" | "rest";
  stepIndex: number;
  remaining: number;
  total: number;
}

function formatSeconds(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

interface LiveSessionProps {
  routine: Routine;
  onClose: () => void;
  onComplete: (data: SessionHistory) => void;
}

export interface SessionStep {
  exerciseIndex: number;
  setIndex: number;
  exercise: any;
  totalSets: number;
  side?: "LEFT" | "RIGHT";
  repIndex?: number;
}

export default function LiveSession({
  routine,
  onClose,
  onComplete,
}: LiveSessionProps) {
  // State
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [overviewVisible, setOverviewVisible] = useState(false);
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const [completedSets, setCompletedSets] = useState<Record<string, boolean>>(
    {},
  );
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedDataRef = useRef<SessionHistory | null>(null);
  const completionModalRef = useRef<SessionCompletionHandle>(null);

  // Edit Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);

  const [exercises, setExercises] = useState<any[]>([]);
  const [currentExerciseDetails, setCurrentExerciseDetails] =
    useState<Exercise | null>(null);
  const exerciseCacheRef = useRef<Record<string, Exercise>>({});
  const [exerciseUnits, setExerciseUnits] = useState<Record<string, ExerciseUnit>>({});

  useEffect(() => {
    if (routine) {
      setExercises(routine.exercises);
    }
  }, [routine]);

  // Fetch every exercise's unit (REPS vs SECS) up front so the overview can
  // label rows correctly even before the user has browsed to them.
  useEffect(() => {
    if (!exercises.length) return;
    const ids = Array.from(
      new Set(exercises.map((ex: any) => ex.exerciseId).filter(Boolean)),
    );
    let cancelled = false;
    ids.forEach((id) => {
      Api.getExercise(id).then((ex) => {
        if (cancelled || !ex) return;
        exerciseCacheRef.current[id] = ex;
        setExerciseUnits((prev) => ({ ...prev, [id]: ex.unit }));
      });
    });
    return () => {
      cancelled = true;
    };
  }, [exercises]);

  const steps = useMemo(() => {
    if (!exercises) return [];

    // Flatten: Each set is a step
    const _steps: SessionStep[] = [];

    exercises.forEach((ex: any, exIndex: number) => {
      for (let i = 0; i < ex.sets; i++) {
        if (ex.isUnilateral) {
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
    if (isSessionStarted && !isPaused) {
      startTimer();
    } else {
      stopTimer();
    }

    // Cleanup on unmount
    return () => {
      stopTimer();
      completedDataRef.current = null;
    };
  }, [isSessionStarted, isPaused]);

  // Android hardware back: close the exercise list overview if it's open,
  // instead of falling through to the default (pop the whole live-session
  // route back to the dashboard). Modals (EditSetModal, ConfirmationDialog)
  // handle their own back-press via onRequestClose and take priority since
  // BackHandler's listener stack is LIFO.
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        if (overviewVisible) {
          setOverviewVisible(false);
          return true;
        }
        return false;
      });
      return () => sub.remove();
    }, [overviewVisible]),
  );

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

  // What happens once a set (rep-based tap, or a hold countdown finishing)
  // is marked complete: finish the session on the last step (no rest, ever),
  // otherwise start a rest countdown, unless rest is Off.
  const advanceAfterSetComplete = (stepIndex: number) => {
    if (stepIndex >= totalSteps - 1) {
      handleFinish();
      return;
    }
    if (REST_DURATION_SECONDS > 0) {
      setActiveTimer({
        type: "rest",
        stepIndex,
        remaining: REST_DURATION_SECONDS,
        total: REST_DURATION_SECONDS,
      });
    } else {
      setActiveStepIndex(stepIndex + 1);
    }
  };

  // Countdown tick: only recreated when a new timer starts (type/stepIndex)
  // or pause toggles — not every second, since the interval itself drives
  // the per-second decrement via a functional update.
  useEffect(() => {
    if (!activeTimer || isPaused) return;
    const id = setInterval(() => {
      setActiveTimer((prev) => (prev ? { ...prev, remaining: prev.remaining - 1 } : prev));
    }, 1000);
    return () => clearInterval(id);
  }, [activeTimer?.type, activeTimer?.stepIndex, activeTimer?.total, isPaused]);

  // Transition when a countdown reaches zero. Kept separate from the tick
  // effect so side effects (marking a set complete, starting rest, advancing
  // the step, finishing the session) never run inside a setState updater.
  useEffect(() => {
    if (!activeTimer || activeTimer.remaining > 0) return;
    if (activeTimer.type === "hold") {
      const stepIndex = activeTimer.stepIndex;
      markSetComplete(stepIndex);
      setActiveTimer(null);
      advanceAfterSetComplete(stepIndex);
    } else {
      const nextIndex = activeTimer.stepIndex + 1;
      setActiveTimer(null);
      setActiveStepIndex(nextIndex);
    }
  }, [activeTimer]);

  const handleMainAction = () => {
    if (!isSessionStarted) {
      setIsSessionStarted(true);
      return;
    }

    if (isHoldExercise && !isCurrentSetCompleted) {
      const holdSeconds = getRepCountForStep(activeStepIndex);
      setActiveTimer({
        type: "hold",
        stepIndex: activeStepIndex,
        remaining: holdSeconds,
        total: holdSeconds,
      });
      return;
    }

    const setKey = getSetKey(activeStepIndex);
    const alreadyCompleted = !!completedSets[setKey];

    if (!alreadyCompleted) {
      markSetComplete(activeStepIndex);
    }

    advanceAfterSetComplete(activeStepIndex);
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
        if (profile.streakCurrent >= 1 && history.length > 0) {
          const lastSession = history[0];
          const parsed = (() => {
            try {
              return typeof lastSession.performanceData === "string"
                ? JSON.parse(lastSession.performanceData)
                : lastSession.performanceData;
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

      const presentCompletion = (stats: { id: string; xp: number; level: number; streakCurrent: number; streakBest: number; streakStartDate: string | null; totalReps: number }) => {
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
          streakCurrent: 0,
          streakBest: 0,
          streakStartDate: new Date().toISOString(),
          totalReps: 0,
        },
        { baseXP: steps.length * XP_PER_SET },
      );
    }
  };

  const handleSaveData = async () => {
    if (!routine) return;
    const historyData: SessionHistory = {
      id: Date.now().toString(),
      // Keyed on the routine so "completed today" survives routine edits and the
      // schedule being removed or re-added.
      routineId: routine.id,
      title: routine.name,
      date: new Date().toISOString(),
      performanceData: JSON.stringify({
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

  const handlePrevStep = () => {
    if (activeStepIndex > 0) setActiveStepIndex((prev) => prev - 1);
  };

  const handleNextStep = () => {
    if (activeStepIndex < totalSteps - 1) setActiveStepIndex((prev) => prev + 1);
  };

  const handleTogglePause = () => setIsPaused((prev) => !prev);

  const handleEndSession = () => {
    Alert.alert("End Session?", "Progress won't be saved.", [
      { text: "Cancel", style: "cancel" },
      { text: "End", style: "destructive", onPress: onClose },
    ]);
  };

  // Overview already receives `steps`, so it resolves exercise/set/side taps
  // to a step index itself before calling this back.
  const handleSelectStepFromOverview = (index: number) => {
    if (index >= 0) setActiveStepIndex(index);
    setOverviewVisible(false);
  };

  const handleEditSet = (stepIndex: number) => {
    setEditingStepIndex(stepIndex);
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
    if (exercise.isUnilateral) {
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

  const handleDeleteSet = (stepIndex: number) => {
    const step = steps[stepIndex];
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
      setToastMessage("You must have at least one set.");
    }
  };

  const handleAddSet = (exerciseIndex: number) => {
    const newExercises = [...exercises];
    const exercise = newExercises[exerciseIndex];
    const reps = Array.isArray(exercise.reps) ? [...exercise.reps] : [exercise.reps];
    const lastRep = reps.length > 0 ? reps[reps.length - 1] : 10;

    if (exercise.isUnilateral) {
      reps.push(lastRep, lastRep);
    } else {
      reps.push(lastRep);
    }

    exercise.reps = reps;
    exercise.sets += 1;
    setExercises(newExercises);
  };

  if (!routine || !currentStep) return null;

  const currentId = currentStep?.exercise?.exerciseId;
  const displayExercise =
    currentId &&
    (currentExerciseDetails?.id === currentId
      ? currentExerciseDetails
      : exerciseCacheRef.current[currentId] ?? null);

  // SessionExercise (the routine's lightweight copy) doesn't carry `unit` —
  // only the fetched Exercise does. Falls back to REPS until it resolves.
  const isHoldExercise = displayExercise?.unit === ExerciseUnit.SECS;

  const isCurrentSetCompleted = !!completedSets[
    `${currentStep.exerciseIndex}-${currentStep.setIndex}-${(currentStep as any).side || "BILATERAL"}`
  ];

  // A completed, non-final step is only reachable by browsing back with the
  // StepNavPill — there's nothing left to "do" there, so the primary button
  // goes inert instead of offering a second, redundant "Next" control.
  const isRevisitingCompletedStep =
    isSessionStarted && activeStepIndex < totalSteps - 1 && isCurrentSetCompleted;

  const isTimerActive = activeTimer !== null;

  let mainActionLabel = "Complete";
  let mainActionVariant: "primary" | "completed" | "start" = "primary";
  let mainActionIcon: keyof typeof FontAwesome.glyphMap | undefined = undefined;

  if (!isSessionStarted) {
    mainActionLabel = "Start";
    mainActionVariant = "start";
    mainActionIcon = "bolt";
  } else if (isRevisitingCompletedStep) {
    mainActionLabel = "Set Complete";
    mainActionVariant = "completed";
    mainActionIcon = "check";
  } else if (isHoldExercise && !isCurrentSetCompleted) {
    mainActionLabel = "Start";
    mainActionVariant = "start";
    mainActionIcon = "bolt";
  } else if (activeStepIndex >= totalSteps - 1) {
    mainActionLabel = "Complete";
    mainActionVariant = "completed";
    mainActionIcon = "bolt";
  } else {
    mainActionLabel = "Complete";
    mainActionVariant = "completed";
    mainActionIcon = "check";
  }

  const categorySlug =
    displayExercise?.category?.slug?.toUpperCase() ??
    (currentStep?.exercise as { categorySlug?: string })?.categorySlug?.toUpperCase();

  const holdTimer =
    activeTimer?.type === "hold" && activeTimer.stepIndex === activeStepIndex
      ? { remaining: activeTimer.remaining, total: activeTimer.total }
      : null;

  const mainContent = (
    <ActiveSessionView
      exercise={displayExercise ?? undefined}
      sessionExercise={currentStep.exercise}
      stepIndex={activeStepIndex}
      exerciseIndex={currentStep.exerciseIndex}
      totalExercises={exercises.length}
      currentSetIndex={
        currentStep.exercise.isUnilateral
          ? currentStep.setIndex * 2 + (currentStep.side === "RIGHT" ? 1 : 0)
          : currentStep.setIndex
      }
      totalSets={
        currentStep.exercise.isUnilateral
          ? (currentStep.exercise.sets || 1) * 2
          : currentStep.exercise.sets || 1
      }
      isSetCompleted={!!isCurrentSetCompleted}
      side={(currentStep as any).side}
      currentReps={getRepCountForStep(activeStepIndex)}
      holdTimer={holdTimer}
    />
  );

  return (
    // No "bottom" edge: BottomActionPanel (via SessionControls) applies insets.bottom.
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-background-dark"
    >
      <Text
        className="absolute right-6 text-white font-mono font-bold text-sm tracking-widest z-10"
        style={{ top: insets.top + 16 }}
      >
        {formatSeconds(elapsedTime)}
      </Text>

      <View style={{ flex: 1 }}>
        {activeTimer?.type === "rest" ? (
          <RestView
            remainingSeconds={activeTimer.remaining}
            totalSeconds={activeTimer.total}
            onSkip={() => {
              const nextIndex = activeTimer.stepIndex + 1;
              setActiveTimer(null);
              setActiveStepIndex(nextIndex);
            }}
          />
        ) : categorySlug ? (
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
          <SessionHeader onOpenOverview={() => setOverviewVisible(true)} />
          <SessionControls
            onMainAction={handleMainAction}
            mainActionLabel={mainActionLabel}
            mainActionIcon={mainActionIcon}
            mainActionVariant={mainActionVariant}
            disabled={isPaused || isRevisitingCompletedStep || isTimerActive}
            onPrevious={handlePrevStep}
            onNext={handleNextStep}
            canGoPrevious={activeStepIndex > 0 && !isPaused}
            canGoNext={activeStepIndex < totalSteps - 1 && !isPaused}
            isPaused={isPaused}
            onTogglePause={handleTogglePause}
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
        />
      )}

      <SessionCompletion
        ref={completionModalRef}
        elapsedTime={elapsedTime}
        onContinue={handleCompletionContinue}
      />

      <ExerciseListOverview
        visible={overviewVisible}
        exercises={exercises}
        exerciseUnits={exerciseUnits}
        steps={steps}
        completedSets={completedSets}
        activeStepIndex={activeStepIndex}
        onSelectStep={handleSelectStepFromOverview}
        onEditSet={handleEditSet}
        onDeleteSet={handleDeleteSet}
        onAddSet={handleAddSet}
        onEndSession={handleEndSession}
        onClose={() => setOverviewVisible(false)}
      />

      <Toast
        visible={!!toastMessage}
        message={toastMessage ?? ""}
        variant="error"
        onHide={() => setToastMessage(null)}
      />
    </SafeAreaView>
  );
}
