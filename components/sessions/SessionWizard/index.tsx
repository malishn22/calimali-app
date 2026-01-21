import { WizardFooter } from "@/components/sessions/SessionWizard/WizardFooter";
import { Exercise, ScheduledSession, SessionExercise } from "@/constants/Types";
import { Api } from "@/services/api";
import React, { useEffect, useState } from "react";
import { Alert, Modal, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WizardConfigStep } from "./WizardConfigStep";
import { WizardFinalStep } from "./WizardFinalStep";
import { WizardListStep } from "./WizardListStep";
import { WizardSearchStep } from "./WizardSearchStep";
import { WizardStep } from "./types";

interface SessionWizardProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  selectedDate: Date;
  initialSession?: ScheduledSession | null;
}

export default function SessionWizard({
  visible,
  onClose,
  onSave,
  selectedDate,
  initialSession,
}: SessionWizardProps) {
  const [step, setStep] = useState<WizardStep>("LIST");

  // Form State
  const [sessionExercises, setSessionExercises] = useState<SessionExercise[]>(
    [],
  );
  const [title, setTitle] = useState("");
  const [color, setColor] = useState("#3B82F6"); // Default blue
  const [frequency, setFrequency] = useState<
    "ONCE" | "DAILY" | "WEEKLY" | "EVERY 2 DAYS"
  >("ONCE");

  // Selection State
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Reset or Load on open
  useEffect(() => {
    if (visible) {
      if (initialSession) {
        setTitle(initialSession.title);
        setFrequency(initialSession.frequency as any);
        setColor(initialSession.color);
        setSessionExercises(JSON.parse(initialSession.exercises));
      } else {
        resetForm();
      }
      setStep("LIST");
    }
  }, [visible, initialSession]);

  const resetForm = () => {
    setTitle("");
    setFrequency("ONCE");
    setColor("#3B82F6");
    setSessionExercises([]);
    setStep("LIST");
    setEditingIndex(null);
  };

  const handleAddExercise = () => {
    setEditingIndex(null);
    setStep("SEARCH");
  };

  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setStep("CONFIG");
  };

  const handleConfirmExercise = (sets: number, reps: number | number[]) => {
    if (selectedExercise) {
      const newEx: SessionExercise = {
        exerciseId: selectedExercise.id,
        name: selectedExercise.name,
        sets,
        reps,
        is_unilateral: selectedExercise.is_unilateral,
      };

      if (editingIndex !== null) {
        // Update existing
        const updated = [...sessionExercises];
        updated[editingIndex] = newEx;
        setSessionExercises(updated);
        setEditingIndex(null);
      } else {
        // Add new
        setSessionExercises([...sessionExercises, newEx]);
      }

      setSelectedExercise(null);
      setStep("LIST");
    }
  };

  const handleRemoveExercise = (index: number) => {
    const updated = [...sessionExercises];
    updated.splice(index, 1);
    setSessionExercises(updated);
  };

  const handleEditExercise = async (index: number) => {
    const sessionEx = sessionExercises[index];
    const fullEx = await Api.getExercise(sessionEx.exerciseId);
    if (fullEx) {
      setSelectedExercise(fullEx);
      setEditingIndex(index);
      setStep("CONFIG");
    } else {
      Alert.alert("Error", "Could not load exercise details");
    }
  };

  const handleSaveSession = async () => {
    if (sessionExercises.length === 0) {
      Alert.alert("Empty Session", "Please add at least one exercise.");
      return;
    }

    // Default to "New Session" if empty
    const finalTitle = title.trim() || "New Session";

    try {
      const exerciseJson = JSON.stringify(sessionExercises);
      if (initialSession) {
        await Api.updatePlannedSession({
          id: initialSession.id,
          title: finalTitle,
          date: initialSession.date,
          exercises: exerciseJson,
          frequency,
          color,
        });
      } else {
        await Api.postPlannedSession({
          id: "", // Server generated
          title: finalTitle,
          date: selectedDate.toISOString(),
          frequency,
          color,
          exercises: exerciseJson,
        });
      }
      onSave();
      onClose();
    } catch (e) {
      Alert.alert("Error", "Failed to save session.");
    }
  };

  const handleBack = () => {
    if (step === "SEARCH") setStep("LIST");
    else if (step === "CONFIG") {
      // If editing, go back to LIST, else SEARCH
      if (editingIndex !== null) {
        setStep("LIST");
        setEditingIndex(null);
      } else {
        setStep("SEARCH");
      }
    } else if (step === "FINAL") setStep("LIST");
    else onClose(); // Close on first step back
  };

  const handleNext = () => {
    if (step === "LIST") {
      if (sessionExercises.length === 0) {
        Alert.alert("Empty Session", "Please add at least one exercise.");
      } else {
        setStep("FINAL");
      }
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-background-dark">
        <View className="flex-1">
          {step === "LIST" && (
            <WizardListStep
              exercises={sessionExercises}
              onAdd={handleAddExercise}
              onRemove={handleRemoveExercise}
              onEdit={handleEditExercise}
            />
          )}

          {step === "SEARCH" && (
            <WizardSearchStep onSelect={handleSelectExercise} />
          )}

          {step === "CONFIG" && selectedExercise && (
            <WizardConfigStep
              exercise={selectedExercise}
              initialSets={
                editingIndex !== null ? sessionExercises[editingIndex].sets : 1
              }
              initialReps={
                editingIndex !== null
                  ? sessionExercises[editingIndex].reps
                  : undefined
              }
              onConfirm={handleConfirmExercise}
              onBack={() => {
                if (editingIndex !== null) {
                  setStep("LIST");
                  setEditingIndex(null);
                } else {
                  setStep("SEARCH");
                }
              }}
            />
          )}

          {step === "FINAL" && (
            <WizardFinalStep
              title={title}
              setTitle={setTitle}
              color={color}
              setColor={setColor}
              frequency={frequency}
              setFrequency={setFrequency}
            />
          )}
        </View>

        {/* Unified Footer */}
        <WizardFooter
          step={step}
          onBack={handleBack}
          onNext={handleNext}
          onSave={handleSaveSession}
          canGoNext={sessionExercises.length > 0}
        />
      </SafeAreaView>
    </Modal>
  );
}
