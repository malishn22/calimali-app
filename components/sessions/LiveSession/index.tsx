import { ScheduledSession, SessionHistory } from "@/constants/Types";
import { Api } from "@/services/api";
import { FontAwesome } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
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

  const handleMainAction = () => {
    if (!isSessionStarted) {
      setIsSessionStarted(true);
      return;
    }

    // Complete Current Set
    markSetComplete(activeStepIndex);

    // If Last Step
    if (activeStepIndex >= totalSteps - 1) {
      handleFinish();
    } else {
      // Go Next
      setActiveStepIndex((prev) => prev + 1);
    }
  };

  const handleFinish = async () => {
    stopTimer();
    // Save immediately upon finishing the session
    await handleSaveData();

    // Update Stats
    try {
      // Calculate Total Reps
      let totalRepsInSession = 0;
      exercises.forEach((ex) => {
        if (Array.isArray(ex.reps)) {
          ex.reps.forEach((r: number) => (totalRepsInSession += r));
        } else {
          totalRepsInSession += ex.reps * (ex.sets || 1);
        }
      });

      const xpEarned = 60 + Math.floor(totalRepsInSession / 10); // Dynamic XP: 60 base + 1 XP per 10 reps

      const newStats = await Api.applyStats(xpEarned, totalRepsInSession);
      // Then show the completion modal with actual stats
      completionModalRef.current?.present(xpEarned, newStats);
    } catch (e) {
      console.error("Failed to update stats", e);
      // Fallback
      completionModalRef.current?.present(60, {
        id: "user",
        xp: 0,
        level: 1,
        streak_current: 0,
        streak_best: 0,
        streak_start_date: new Date().toISOString(),
        total_reps: 0,
      });
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
  } else {
    mainActionLabel = "Complete Set";
    mainActionVariant = "completed";
    mainActionIcon = "check";
  }

  const isCurrentSetCompleted =
    completedSets[
    `${currentStep.exerciseIndex}-${currentStep.setIndex}-${(currentStep as any).side || "BILATERAL"}`
    ];

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

      <ActiveSessionView
        exercise={currentStep.exercise}
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

      <SessionControls
        onBack={handleBack}
        onMainAction={handleMainAction}
        mainActionLabel={mainActionLabel}
        mainActionIcon={mainActionIcon}
        mainActionVariant={mainActionVariant}
        backLabel={""}
      />

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
