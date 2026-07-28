import { WizardFooter } from "@/components/routines/RoutineEditor/WizardFooter";
import { Exercise, Routine, SessionExercise } from "@/constants/Types";
import { Api } from "@/services/api";
import { useFocusEffect } from "expo-router";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, BackHandler, View } from "react-native";
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

interface RoutineEditorProps {
  onClose: () => void;
  onSave: () => void;
  /** Existing routine to edit; omit to create a new one. */
  initialRoutine?: Routine | null;
}

/**
 * Builds a reusable routine. Deliberately knows nothing about dates or recurrence —
 * scheduling happens on the Planner, against a routine that already exists.
 */
export default function RoutineEditor({
  onClose,
  onSave,
  initialRoutine,
}: RoutineEditorProps) {
  const [step, setStep] = useState<WizardStep>("LIST");

  // Form State
  const [sessionExercises, setSessionExercises] = useState<SessionExercise[]>(
    [],
  );
  const [title, setTitle] = useState("");
  const [color, setColor] = useState("#3B82F6"); // Default blue

  // Selection State
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Load the routine being edited on mount
  useEffect(() => {
    if (initialRoutine) {
      setTitle(initialRoutine.name);
      setColor(initialRoutine.color);
      setSessionExercises(initialRoutine.exercises);
    }
    setStep("LIST");
  }, []);

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

  const handleSaveRoutine = async () => {
    if (sessionExercises.length === 0) {
      Alert.alert("Empty Routine", "Please add at least one exercise.");
      return;
    }

    const finalName = title.trim() || "New Routine";

    try {
      if (initialRoutine?.id) {
        // Updating in place keeps the id, so every day this routine is scheduled on
        // picks up the change and past workouts stay linked to it.
        await Api.updateRoutine({
          id: initialRoutine.id,
          name: finalName,
          color,
          exercises: sessionExercises,
        });
      } else {
        await Api.createRoutine({
          name: finalName,
          color,
          exercises: sessionExercises,
        });
      }
      onSave();
      onClose();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to save routine.");
    }
  };

  const handleBack = useCallback(() => {
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
  }, [step, editingIndex, onClose]);

  // Mirror the top-left back button on Android's hardware back button: step
  // back through the wizard, and only at the first step (LIST) let the
  // default OS/nav behavior proceed (pop the screen / background the app)
  // instead of swallowing the press.
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        if (step === "LIST") return false;
        handleBack();
        return true;
      });
      return () => sub.remove();
    }, [step, handleBack]),
  );

  const handleNext = () => {
    if (step === "LIST") {
      if (sessionExercises.length === 0) {
        Alert.alert("Empty Routine", "Please add at least one exercise.");
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
            onBack={handleBack}
          />
        )}

        {step === "SEARCH" && (
          <WizardSearchStep onSelect={handleSelectExercise} onBack={handleBack} />
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
            onBack={handleBack}
          />
        )}
      </View>

      {/* Unified Footer */}
      <WizardFooter
        step={step}
        onNext={handleNext}
        onSave={handleSaveRoutine}
        canGoNext={sessionExercises.length > 0}
      />
    </SafeAreaView>
  );
}
