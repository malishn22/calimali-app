import Colors, { SessionColors } from "@/constants/Colors";
import { ScheduledSession, addSessionHistory } from "@/services/Database";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EditSetModal from "./LiveSession/EditSetModal";

interface LiveSessionProps {
  visible: boolean;
  session: ScheduledSession | null;
  onClose: () => void;
  onComplete: (data: any) => void;
}

export default function LiveSession({
  visible,
  session,
  onClose,
  onComplete,
}: LiveSessionProps) {
  const [isStarted, setIsStarted] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [exercises, setExercises] = useState<any[]>([]);

  // Track completed sets by specific ID (exerciseId_setIndex)
  const [completedSetIds, setCompletedSetIds] = useState<Set<string>>(
    new Set()
  );

  // Edit Modal State
  const [editingSet, setEditingSet] = useState<{
    exIndex: number;
    setIndex: number;
  } | null>(null);

  // Completion Flow State
  // 0: Active, 1: XP Reward, 2: Level Progress
  const [completionStep, setCompletionStep] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    if (visible && session) {
      // Reset state on open
      setIsStarted(false);
      setTimer(0);
      setCurrentExIndex(0);
      setCompletionStep(0);
      setCompletedSetIds(new Set());
      try {
        const parsed =
          typeof session.exercises === "string"
            ? JSON.parse(session.exercises)
            : session.exercises;
        setExercises(parsed || []);
      } catch (e) {
        setExercises([]);
      }
    }
    return () => stopTimer();
  }, [visible, session]);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimer((p) => p + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleStartSession = () => {
    setIsStarted(true);
    startTimer();
  };

  const handleToggleSet = (exIndex: number, setIndex: number) => {
    if (!isStarted) return;
    const key = `${exIndex}_${setIndex}`;
    setCompletedSetIds((prev) => {
      const copy = new Set(prev);
      if (copy.has(key)) copy.delete(key);
      else copy.add(key);
      return copy;
    });
  };

  const handleEditSet = (exIndex: number, setIndex: number) => {
    if (!isStarted) return;
    setEditingSet({ exIndex, setIndex });
  };

  const saveEditedSet = (newReps: number) => {
    if (!editingSet) return;
    const { exIndex, setIndex } = editingSet;
    const newExercises = [...exercises];
    newExercises[exIndex].sets[setIndex].reps = newReps;
    setExercises(newExercises);
    setEditingSet(null);
  };

  const deleteSet = () => {
    if (!editingSet) return;
    const { exIndex, setIndex } = editingSet;
    const newExercises = [...exercises];
    newExercises[exIndex].sets.splice(setIndex, 1);
    setExercises(newExercises);
    setEditingSet(null);

    // Also remove from completed if it was (simplistic approach)
    const key = `${exIndex}_${setIndex}`;
    setCompletedSetIds((prev) => {
      const copy = new Set(prev);
      if (copy.has(key)) copy.delete(key);
      return copy;
    });
  };

  const handleAddSet = (exIndex: number) => {
    const newExercises = [...exercises];
    const currentEx = newExercises[exIndex];
    // Copy last set logic or default
    const lastSet = currentEx.sets[currentEx.sets.length - 1] || { reps: 10 };
    if (currentEx.is_unilateral) {
      currentEx.sets.push({ ...lastSet }, { ...lastSet });
    } else {
      currentEx.sets.push({ ...lastSet });
    }
    setExercises(newExercises);
  };

  const handleNextExercise = () => {
    if (currentExIndex < exercises.length - 1) {
      setCurrentExIndex((p) => p + 1);
    }
  };

  const handlePrevExercise = () => {
    if (currentExIndex > 0) {
      setCurrentExIndex((p) => p - 1);
    }
  };

  const handleClose = () => {
    if (isStarted) {
      Alert.alert("Exit Session?", "Your progress will be lost.", [
        { text: "Cancel", style: "cancel" },
        { text: "Exit", style: "destructive", onPress: onClose },
      ]);
    } else {
      onClose();
    }
  };

  const handleFinishWorkout = async () => {
    // 1. Transition to XP Screen
    setCompletionStep(1);

    // 2. Wait 2.5 seconds then transition to Level Screen
    setTimeout(() => {
      setCompletionStep(2);
    }, 2500);
  };

  const handleFinalContinue = async () => {
    // Save to DB
    const historyId = Date.now().toString(); // Simple ID
    const perfData = JSON.stringify({
      elapsedTime: timer,
      exercises: exercises,
    });

    if (session) {
      await addSessionHistory({
        id: historyId,
        session_id: session.id,
        date: new Date().toISOString(),
        performance_data: perfData,
      });
    }

    onComplete(null);
  };

  // --- Renderers ---
  const renderSuccessXP = () => (
    <View className="flex-1 bg-background-dark items-center justify-center p-6">
      <FontAwesome
        name="trophy"
        size={80}
        color={SessionColors.YELLOW}
        style={{ marginBottom: 24 }}
      />
      <Text className="text-white text-3xl font-extrabold mb-2 text-center">
        Session Complete!
      </Text>
      <Text className="text-zinc-500 text-xs font-bold tracking-widest uppercase mb-10">
        REWARDS EARNED
      </Text>

      <View className="bg-card-dark rounded-3xl py-10 px-16 items-center mb-10 w-full">
        <Text className="text-6xl font-extrabold text-blue-500 mb-2">+60</Text>
        <Text className="text-zinc-500 text-xs font-bold tracking-widest">
          EXPERIENCE POINTS
        </Text>
      </View>

      <View
        className="absolute top-[100px] left-[50px] w-2.5 h-2.5 rounded-full bg-blue-500"
        style={{ backgroundColor: SessionColors.BLUE }}
      />
      <View
        className="absolute top-[150px] right-[60px] w-3 h-3 rounded-full bg-yellow-400"
        style={{ backgroundColor: SessionColors.YELLOW }}
      />
    </View>
  );

  const renderSuccessLevel = () => (
    <View className="flex-1 bg-background-dark items-center justify-center p-6">
      <View
        className="w-20 h-20 rounded-full items-center justify-center mb-8"
        style={{ backgroundColor: SessionColors.GREEN }}
      >
        <FontAwesome name="star" size={40} color="black" />
      </View>

      <Text className="text-white text-3xl font-extrabold mb-2 text-center">
        Session Cleared
      </Text>
      <Text className="text-zinc-500 text-xs font-bold tracking-widest uppercase mb-10">
        Great work, Mali.
      </Text>

      <View className="w-full bg-card-dark rounded-3xl p-5 mb-10">
        <View className="flex-row justify-between mb-2">
          <Text className="text-white font-bold text-xs tracking-wider">
            LEVEL 1
          </Text>
          <Text className="text-white font-bold text-xs tracking-wider">
            13%
          </Text>
        </View>
        <View className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <View
            className="h-full bg-blue-500"
            style={{ width: "13%", backgroundColor: SessionColors.BLUE }}
          />
        </View>
      </View>

      <Pressable
        className="w-full h-[60px] rounded-2xl flex-row items-center justify-center gap-2"
        style={{ backgroundColor: SessionColors.GREEN }}
        onPress={handleFinalContinue}
      >
        <Text className="text-black font-extrabold text-base tracking-widest">
          CONTINUE
        </Text>
        <Feather name="arrow-right" size={20} color="black" />
      </Pressable>

      <View
        className="absolute top-[100px] left-[60px] w-2 h-2 rounded-full"
        style={{ backgroundColor: SessionColors.BLUE }}
      />
      <View
        className="absolute top-[140px] right-[50px] w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: SessionColors.YELLOW }}
      />
    </View>
  );

  // Derived State
  const currentExercise = exercises[currentExIndex];
  const totalSets = exercises.reduce(
    (acc, ex) => acc + (ex.sets ? ex.sets.length : 0),
    0
  );
  const completedCount = completedSetIds.size;
  const progressPercent =
    totalSets > 0 ? (completedCount / totalSets) * 100 : 0;
  const isAllComplete = completedCount === totalSets && totalSets > 0;

  if (!session || !currentExercise) return null;

  // Main Render Switch
  if (completionStep === 1)
    return (
      <Modal
        visible={visible}
        animationType="fade"
        presentationStyle="fullScreen"
      >
        {renderSuccessXP()}
      </Modal>
    );
  if (completionStep === 2)
    return (
      <Modal
        visible={visible}
        animationType="fade"
        presentationStyle="fullScreen"
      >
        {renderSuccessLevel()}
      </Modal>
    );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <SafeAreaView className="flex-1 bg-background-dark">
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center justify-between">
          <View className="flex-1 mx-6">
            <View className="flex-row justify-between mb-1.5">
              <Text className="text-zinc-500 text-[10px] font-extrabold tracking-widest">
                SESSION PROGRESS
              </Text>
              <Text className="text-blue-500 text-[10px] font-extrabold">
                {Math.round(progressPercent)}%
              </Text>
            </View>
            <View className="h-2 rounded-full bg-card-dark overflow-hidden">
              <View
                className="h-full rounded-full bg-blue-500"
                style={{ width: `${progressPercent}%` }}
              />
            </View>
          </View>

          <Text className="text-white text-xl font-bold text-right min-w-[60px] tabular-nums">
            {formatTime(timer)}
          </Text>
        </View>

        {/* Exercise Content */}
        <ScrollView
          contentContainerStyle={{
            paddingTop: 24,
            paddingHorizontal: 24,
            paddingBottom: 120,
          }}
        >
          <View className="items-center mb-4">
            <View className="bg-[#1E1E30] px-3 py-1.5 rounded-xl">
              <Text className="text-blue-500 font-extrabold text-[10px] uppercase tracking-widest">
                {currentExercise.category}
              </Text>
            </View>
          </View>

          <Text className="text-white text-3xl font-extrabold text-center mb-2">
            {currentExercise.name}
          </Text>
          <Text className="text-zinc-500 text-sm text-center mb-10">
            {currentExIndex + 1} of {exercises.length} — "
            {currentExercise.description || "No description"}"
          </Text>

          <View>
            {currentExercise.sets.map((set: any, idx: number) => {
              const isCompleted = completedSetIds.has(
                `${currentExIndex}_${idx}`
              );
              const isUnilateral = currentExercise.is_unilateral;

              return (
                <Pressable
                  key={idx}
                  className={`bg-card-dark rounded-3xl p-5 mb-4 border border-zinc-800 flex-row items-center justify-between ${
                    isCompleted ? "border-green-500" : ""
                  } ${!isStarted ? "opacity-70" : ""}`}
                  onPress={() => handleToggleSet(currentExIndex, idx)}
                  disabled={!isStarted}
                >
                  <View>
                    <Text className="text-zinc-500 text-[10px] font-extrabold tracking-widest mb-1">
                      SET #{isUnilateral ? Math.floor(idx / 2) + 1 : idx + 1}
                      {isUnilateral && (idx % 2 === 0 ? " [L]" : " [R]")}
                    </Text>
                    <Text className="text-white text-2xl font-extrabold">
                      {set.reps}
                    </Text>
                  </View>

                  <View className="flex-row gap-3">
                    <Pressable
                      className="w-[50px] h-[50px] rounded-2xl items-center justify-center bg-zinc-800"
                      onPress={(e) => {
                        e.stopPropagation();
                        handleEditSet(currentExIndex, idx);
                      }}
                      disabled={!isStarted}
                    >
                      <Feather
                        name="edit-2"
                        size={18}
                        color={isStarted ? Colors.palette.zinc400 : "#555"}
                      />
                    </Pressable>

                    <View
                      className={`w-[50px] h-[50px] rounded-2xl items-center justify-center ${
                        isCompleted ? "bg-green-500" : "bg-zinc-800"
                      }`}
                    >
                      <Feather
                        name="check"
                        size={20}
                        color={
                          isCompleted
                            ? Colors.palette.black
                            : isStarted
                            ? "#333"
                            : "#222"
                        }
                      />
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            className="py-4 rounded-2xl border border-zinc-800 border-dashed items-center mt-2"
            onPress={() => handleAddSet(currentExIndex)}
          >
            <Text className="text-zinc-500 font-bold text-xs tracking-widest">
              + ADD ANOTHER SET
            </Text>
          </Pressable>
        </ScrollView>

        {/* Footer */}
        <View className="absolute bottom-0 left-0 right-0 p-6 pb-10 flex-row justify-between gap-4">
          <Pressable
            className="flex-1 h-[60px] rounded-3xl bg-card-dark items-center justify-center"
            onPress={currentExIndex > 0 ? handlePrevExercise : handleClose}
          >
            <Feather
              name="chevron-left"
              size={24}
              color={Colors.palette.zinc400}
            />
          </Pressable>

          {!isStarted ? (
            <Pressable
              className="flex-[3] h-[60px] bg-white rounded-3xl flex-row items-center justify-center shadow-sm shadow-white/10"
              onPress={handleStartSession}
            >
              <Text className="text-black font-extrabold text-base tracking-wider">
                START SESSION
              </Text>
              <Feather
                name="zap"
                size={18}
                color="black"
                style={{ marginLeft: 8 }}
              />
            </Pressable>
          ) : currentExIndex < exercises.length - 1 ? (
            <Pressable
              className="flex-[3] h-[60px] bg-blue-500 rounded-3xl flex-row items-center justify-center"
              onPress={handleNextExercise}
            >
              <Text className="text-white font-extrabold text-base">
                NEXT EXERCISE
              </Text>
              <Feather
                name="chevron-right"
                size={18}
                color="white"
                style={{ marginLeft: 8 }}
              />
            </Pressable>
          ) : (
            <Pressable
              className={`flex-[3] h-[60px] bg-card-dark rounded-3xl flex-row items-center justify-center ${
                isAllComplete ? "bg-green-500" : ""
              }`}
              disabled={!isAllComplete}
              onPress={handleFinishWorkout}
            >
              <Text
                className={`font-extrabold text-base ${
                  isAllComplete ? "text-black" : "text-zinc-500"
                }`}
              >
                COMPLETE WORKOUT
              </Text>
              {isAllComplete ? (
                <Feather
                  name="zap"
                  size={18}
                  color="black"
                  style={{ marginLeft: 8 }}
                />
              ) : (
                <Feather
                  name="lock"
                  size={16}
                  color={Colors.palette.zinc600}
                  style={{ marginLeft: 8 }}
                />
              )}
            </Pressable>
          )}
        </View>

        {/* Edit Modal */}
        {editingSet && (
          <EditSetModal
            visible={!!editingSet}
            initialReps={
              exercises[editingSet.exIndex].sets[editingSet.setIndex].reps
            }
            onClose={() => setEditingSet(null)}
            onSave={saveEditedSet}
            onDelete={deleteSet}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}
