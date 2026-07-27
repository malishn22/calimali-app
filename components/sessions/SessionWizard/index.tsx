import { WizardFooter } from "@/components/sessions/SessionWizard/WizardFooter";
import { Exercise, ScheduledSession, SessionExercise } from "@/constants/Types";
import { Api } from "@/services/api";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WizardConfigStep } from "./WizardConfigStep";
import { WizardFinalStep } from "./WizardFinalStep";
import { WizardListStep } from "./WizardListStep";
import { WizardSearchStep } from "./WizardSearchStep";
import { WizardStep } from "./types";

export const ROUTINE_CLIPBOARD_VERSION = 1;

function isSessionExerciseRecord(value: unknown): value is SessionExercise {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  const reps = o.reps;
  const repsOk =
    typeof reps === "number" ||
    (Array.isArray(reps) && reps.every((r) => typeof r === "number"));
  return (
    typeof o.exerciseId === "string" &&
    typeof o.name === "string" &&
    typeof o.sets === "number" &&
    repsOk
  );
}

export function parseRoutineClipboard(text: string): SessionExercise[] | null {
  try {
    const data = JSON.parse(text) as unknown;
    if (typeof data !== "object" || data === null) return null;
    const rec = data as Record<string, unknown>;
    if (rec.calimaliRoutine !== ROUTINE_CLIPBOARD_VERSION) return null;
    if (!Array.isArray(rec.exercises)) return null;
    const out: SessionExercise[] = [];
    for (const item of rec.exercises) {
      if (!isSessionExerciseRecord(item)) return null;
      out.push(item);
    }
    return out;
  } catch {
    return null;
  }
}

interface SessionWizardProps {
  onClose: () => void;
  onSave: () => void;
  selectedDate: Date;
  initialSession?: ScheduledSession | null;
}

export default function SessionWizard({
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

  // Load initial session on mount
  useEffect(() => {
    if (initialSession) {
      setTitle(initialSession.title);
      setFrequency(initialSession.frequency as any);
      setColor(initialSession.color);
      setSessionExercises(JSON.parse(initialSession.exercises));
    }
    setStep("LIST");
  }, []);

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
        isUnilateral: selectedExercise.isUnilateral,
        categorySlug: selectedExercise.category?.slug,
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

  const handleReorderExercises = (reordered: SessionExercise[]) => {
    setSessionExercises(reordered);
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

  const handleCopyRoutine = async () => {
    const payload = JSON.stringify({
      calimaliRoutine: ROUTINE_CLIPBOARD_VERSION,
      exercises: sessionExercises,
    });
    await Clipboard.setStringAsync(payload);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePasteRoutine = async () => {
    const text = await Clipboard.getStringAsync();
    if (!text?.trim()) {
      Alert.alert("Paste failed", "Clipboard is empty or does not contain a copied routine.");
      return;
    }
    const parsed = parseRoutineClipboard(text);
    if (!parsed) {
      Alert.alert(
        "Paste failed",
        "Clipboard does not contain a valid Calimali routine. Copy a routine from Plan Routine first.",
      );
      return;
    }
    setSessionExercises((prev) => [...parsed, ...prev]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
      if (initialSession?.id) {
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
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to save session.");
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
    // No "bottom" edge: BottomActionPanel applies insets.bottom itself.
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-background-dark"
    >
      <View className="flex-1">
        {step === "LIST" && (
          <WizardListStep
            exercises={sessionExercises}
            onAdd={handleAddExercise}
            onRemove={handleRemoveExercise}
            onEdit={handleEditExercise}
            onReorder={handleReorderExercises}
            onCopyRoutine={handleCopyRoutine}
            onPasteRoutine={handlePasteRoutine}
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
  );
}
