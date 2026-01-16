import {
  ScheduledSession,
  SessionHistory,
  saveSessionHistory,
} from "@/services/Database";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ExerciseActiveView } from "./ExerciseActiveView";
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
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState<Record<string, boolean>>(
    {}
  );
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Completion State
  const [showCompletion, setShowCompletion] = useState(false);

  // Data
  const exercises = session ? JSON.parse(session.exercises) : [];
  const currentExercise = exercises[activeExerciseIndex];
  const progress = (activeExerciseIndex / exercises.length) * 100;

  useEffect(() => {
    if (visible) {
      startTimer();
    } else {
      stopTimer();
      setElapsedTime(0);
      setActiveExerciseIndex(0);
      setCompletedSets({});
      setShowCompletion(false);
    }
  }, [visible]);

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

  const toggleSetCompletion = (setKey: string) => {
    setCompletedSets((prev) => ({
      ...prev,
      [setKey]: !prev[setKey],
    }));
  };

  const handleFinish = async () => {
    // Logic for finishing
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
        exercises,
        completedSets,
      }),
    };

    await saveSessionHistory(
      historyData.session_id,
      historyData.date,
      historyData.performance_data
    );

    onComplete(historyData);
  };

  const handlePrev = () => {
    if (activeExerciseIndex > 0)
      setActiveExerciseIndex(activeExerciseIndex - 1);
  };

  const handleNext = () => {
    if (activeExerciseIndex < exercises.length - 1) {
      setActiveExerciseIndex(activeExerciseIndex + 1);
    } else {
      Alert.alert("Finish Workout?", "Top job! Ready to wrap up?", [
        { text: "Keep Going", style: "cancel" },
        { text: "Finish", onPress: handleFinish },
      ]);
    }
  };

  if (!session) return null;

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

          <ExerciseActiveView
            exercise={currentExercise}
            exerciseIndex={activeExerciseIndex}
            totalExercises={exercises.length}
            completedSets={completedSets}
            onToggleSet={toggleSetCompletion}
          />

          <SessionControls
            onPrev={handlePrev}
            onNext={handleNext}
            isFirst={activeExerciseIndex === 0}
            isLast={activeExerciseIndex === exercises.length - 1}
          />
        </SafeAreaView>
      )}
    </Modal>
  );
}
