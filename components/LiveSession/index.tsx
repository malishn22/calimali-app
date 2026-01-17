import { ScheduledSession, SessionHistory } from "@/constants/Types";
import { addSessionHistory } from "@/services/Database";
import { FontAwesome } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActiveSessionView } from "./ActiveSessionView";
import EditSetModal from "./EditSetModal";
import { SessionCompletion } from "./SessionCompletion";
import { SessionControls } from "./SessionControls";
import { SessionHeader } from "./SessionHeader";

interface LiveSessionProps {
  visible: boolean;
  session: ScheduledSession | null;
  onClose: () => void;
  onComplete: (data: SessionHistory) => void;
}

export default function LiveSession({
  visible,
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Completion State
  const [showCompletion, setShowCompletion] = useState(false);

  // Edit Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);

  // Exercises State (Local to allow editing)
  const [exercises, setExercises] = useState<any[]>([]);

  useEffect(() => {
    if (session) {
      setExercises(JSON.parse(session.exercises));
    }
  }, [session]);

  const steps = useMemo(() => {
    if (!exercises) return [];

    // Flatten: Each set is a step
    const _steps: {
      exerciseIndex: number;
      setIndex: number;
      exercise: any; // Type this properly if needed
      totalSets: number;
    }[] = [];

    exercises.forEach((ex: any, exIndex: number) => {
      for (let i = 0; i < ex.sets; i++) {
        _steps.push({
          exerciseIndex: exIndex,
          setIndex: i,
          exercise: ex,
          totalSets: ex.sets,
        });
      }
    });
    return _steps;
  }, [exercises]);

  const currentStep = steps[activeStepIndex];
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? (activeStepIndex / totalSteps) * 100 : 0;

  useEffect(() => {
    if (visible && isSessionStarted) {
      startTimer();
    } else {
      stopTimer();
      if (!visible) {
        setElapsedTime(0);
        setActiveStepIndex(0);
        setIsSessionStarted(false);
        setCompletedSets({});
        setShowCompletion(false);
      }
    }
  }, [visible, isSessionStarted]);

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
    // Key logic: stepIndex is unique enough for this linear flow
    const step = steps[stepIndex];
    if (!step) return;

    // We can stick to the old key format for database compatibility or simplify
    const setKey = `${step.exerciseIndex}-${step.setIndex}`;

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
    setShowCompletion(true);
  };

  const handleFinalClose = async () => {
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

    await addSessionHistory(historyData);

    onComplete(historyData);
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

  const handleSaveSet = (newReps: number) => {
    if (editingStepIndex === null) return;
    const step = steps[editingStepIndex];
    if (!step) return;

    const newExercises = [...exercises];
    // Check if reps is array or number
    const currentReps = newExercises[step.exerciseIndex].reps;

    if (Array.isArray(currentReps)) {
      // Create a copy of the array found at this exercise index
      const updatedRepsArray = [...currentReps];
      updatedRepsArray[step.setIndex] = newReps;
      newExercises[step.exerciseIndex].reps = updatedRepsArray;
    } else {
      newExercises[step.exerciseIndex].reps = newReps;
    }

    setExercises(newExercises);
    setEditModalVisible(false);
  };

  const getRepCountForStep = (stepIndex: number) => {
    const step = steps[stepIndex];
    if (!step) return 0;
    const ex = exercises[step.exerciseIndex]; // Get latest state
    if (!ex) return 0;

    if (Array.isArray(ex.reps)) {
      return ex.reps[step.setIndex];
    }
    return ex.reps;
  };

  // ... (handleDeleteSet remains same)

  // ...

  const handleDeleteSet = () => {
    if (editingStepIndex === null) return;
    const step = steps[editingStepIndex];
    if (!step) return;

    // To delete a set, we need to decrease the set count of the exercise
    const newExercises = [...exercises];
    const exercise = newExercises[step.exerciseIndex];

    if (exercise.sets > 1) {
      exercise.sets -= 1;
      setExercises(newExercises);
      // Adjust active step if needed? The steps array will re-calculate.
      // If we are on the last step, we might need to go back.
      if (activeStepIndex >= steps.length - 1) {
        if (activeStepIndex > 0) setActiveStepIndex(activeStepIndex - 1);
      }
    } else {
      // Remove exercise entirely? or prevent deletion of last set?
      Alert.alert("Cannot delete", "You must have at least one set.");
    }
    setEditModalVisible(false);
  };

  if (!session || !currentStep) return null;

  // Determine Button Labels and Variants
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
    mainActionIcon = "bolt"; // "flag-checkered" might be better but user asked for Zap
  } else {
    // Check if next step is new exercise? Optional UX enhancement
    mainActionLabel = "Complete Set";
    mainActionVariant = "completed"; // Green for completion
    mainActionIcon = "check";
  }

  const isCurrentSetCompleted =
    completedSets[`${currentStep.exerciseIndex}-${currentStep.setIndex}`];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      {showCompletion ? (
        <SessionCompletion
          visible={showCompletion}
          elapsedTime={elapsedTime}
          onClose={handleFinalClose}
        />
      ) : (
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
            currentSetIndex={currentStep.setIndex}
            isSetCompleted={!!isCurrentSetCompleted}
            onEditSet={handleEditSet}
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
        </SafeAreaView>
      )}
    </Modal>
  );
}
