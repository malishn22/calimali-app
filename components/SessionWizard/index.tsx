import {
  Exercise,
  saveSession,
  ScheduledSession,
  SessionExercise,
  updateSession,
} from "@/services/Database";
import React, { useEffect, useState } from "react";
import { Alert, Modal, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WizardFooter } from "./WizardFooter";
import { WizardStep1_List } from "./WizardStep1_List";
import { WizardStep2_Search } from "./WizardStep2_Search";
import { WizardStep3_Config } from "./WizardStep3_Config";
import { WizardStep4_Final } from "./WizardStep4_Final";

interface SessionWizardProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  selectedDate: Date;
  initialSession?: ScheduledSession | null;
}

export type WizardStep = "LIST" | "SEARCH" | "CONFIG" | "FINAL";

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
    []
  );
  const [title, setTitle] = useState("New Session");
  const [color, setColor] = useState("#3B82F6"); // Default blue
  const [frequency, setFrequency] = useState<
    "ONCE" | "DAILY" | "WEEKLY" | "EVERY_2_DAYS"
  >("ONCE");

  // Selection State
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );

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
    setTitle("New Session");
    setFrequency("ONCE");
    setColor("#3B82F6");
    setSessionExercises([]);
    setStep("LIST");
  };

  const handleAddExercise = () => {
    setStep("SEARCH");
  };

  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setStep("CONFIG");
  };

  const handleConfirmExercise = (sets: number, reps: number) => {
    if (selectedExercise) {
      const newEx: SessionExercise = {
        exerciseId: selectedExercise.id,
        name: selectedExercise.name,
        sets,
        reps,
      };
      setSessionExercises([...sessionExercises, newEx]);
      setSelectedExercise(null);
      setStep("LIST");
    }
  };

  const handleRemoveExercise = (index: number) => {
    const updated = [...sessionExercises];
    updated.splice(index, 1);
    setSessionExercises(updated);
  };

  const handleSaveSession = async () => {
    if (sessionExercises.length === 0) {
      Alert.alert("Empty Session", "Please add at least one exercise.");
      return;
    }
    if (!title.trim()) {
      Alert.alert("Missing Title", "Please enter a session name.");
      return;
    }

    try {
      const exerciseJson = JSON.stringify(sessionExercises);
      if (initialSession) {
        await updateSession(
          initialSession.id,
          title,
          exerciseJson,
          frequency,
          color
        );
      } else {
        await saveSession(
          title,
          selectedDate.toISOString(),
          exerciseJson,
          frequency,
          color
        );
      }
      onSave();
      onClose();
    } catch (e) {
      Alert.alert("Error", "Failed to save session.");
    }
  };

  const handleBack = () => {
    if (step === "SEARCH") setStep("LIST");
    else if (step === "CONFIG") setStep("SEARCH");
    else if (step === "FINAL") setStep("LIST");
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
        <View className="flex-1 p-6">
          {step === "LIST" && (
            <WizardStep1_List
              exercises={sessionExercises}
              onAdd={handleAddExercise}
              onRemove={handleRemoveExercise}
            />
          )}

          {step === "SEARCH" && (
            <WizardStep2_Search onSelect={handleSelectExercise} />
          )}

          {step === "CONFIG" && selectedExercise && (
            <WizardStep3_Config
              exercise={selectedExercise}
              onConfirm={handleConfirmExercise}
            />
          )}

          {step === "FINAL" && (
            <WizardStep4_Final
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
