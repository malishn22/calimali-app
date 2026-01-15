import Colors, { SessionColors } from "@/constants/Colors";
import { ScheduledSession, addSessionHistory } from "@/services/Database";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
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
    <View style={styles.successContainer}>
      <FontAwesome
        name="trophy"
        size={80}
        color={SessionColors.YELLOW}
        style={{ marginBottom: 24 }}
      />
      <Text style={styles.successTitle}>Session Complete!</Text>
      <Text style={styles.successSub}>REWARDS EARNED</Text>

      <View style={styles.rewardCard}>
        <Text style={styles.rewardValue}>+60</Text>
        <Text style={styles.rewardLabel}>EXPERIENCE POINTS</Text>
      </View>

      <View
        style={{
          position: "absolute",
          top: 100,
          left: 50,
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: SessionColors.BLUE,
        }}
      />
      <View
        style={{
          position: "absolute",
          top: 150,
          right: 60,
          width: 12,
          height: 12,
          borderRadius: 6,
          backgroundColor: SessionColors.YELLOW,
        }}
      />
    </View>
  );

  const renderSuccessLevel = () => (
    <View style={styles.successContainer}>
      <View style={styles.starCircle}>
        <FontAwesome name="star" size={40} color="black" />
      </View>

      <Text style={styles.successTitle}>Session Cleared</Text>
      <Text style={styles.successSub}>Great work, Mali.</Text>

      <View style={styles.levelCard}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <Text style={styles.levelLabel}>LEVEL 1</Text>
          <Text style={styles.levelLabel}>13%</Text>
        </View>
        <View style={styles.levelBarBg}>
          <View style={[styles.levelBarFill, { width: "13%" }]} />
        </View>
      </View>

      <Pressable style={styles.continueBtn} onPress={handleFinalContinue}>
        <Text style={styles.continueBtnText}>CONTINUE</Text>
        <Feather name="arrow-right" size={20} color="black" />
      </Pressable>

      <View
        style={{
          position: "absolute",
          top: 100,
          left: 60,
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: SessionColors.BLUE,
        }}
      />
      <View
        style={{
          position: "absolute",
          top: 140,
          right: 50,
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: SessionColors.YELLOW,
        }}
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
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.progressContainer}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <Text style={styles.progressLabel}>SESSION PROGRESS</Text>
              <Text style={styles.progressLabelBlue}>
                {Math.round(progressPercent)}%
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progressPercent}%` },
                ]}
              />
            </View>
          </View>

          <Text style={styles.timerText}>{formatTime(timer)}</Text>
        </View>

        {/* Exercise Content */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.tagContainer}>
            <View style={styles.categoryChip}>
              <Text style={styles.categoryText}>
                {currentExercise.category}
              </Text>
            </View>
          </View>

          <Text style={styles.exerciseTitle}>{currentExercise.name}</Text>
          <Text style={styles.exCounter}>
            {currentExIndex + 1} of {exercises.length} — "
            {currentExercise.description || "No description"}"
          </Text>

          <View style={styles.setsList}>
            {currentExercise.sets.map((set: any, idx: number) => {
              const isCompleted = completedSetIds.has(
                `${currentExIndex}_${idx}`
              );
              const isUnilateral = currentExercise.is_unilateral;

              return (
                <Pressable
                  key={idx}
                  style={[
                    styles.setCard,
                    isCompleted && styles.setCardCompleted,
                    !isStarted && { opacity: 0.7 },
                  ]}
                  onPress={() => handleToggleSet(currentExIndex, idx)}
                  disabled={!isStarted}
                >
                  <View>
                    <Text style={styles.setLabel}>
                      SET #{isUnilateral ? Math.floor(idx / 2) + 1 : idx + 1}
                      {isUnilateral && (idx % 2 === 0 ? " [L]" : " [R]")}
                    </Text>
                    <Text style={styles.setVal}>{set.reps}</Text>
                  </View>

                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <Pressable
                      style={[styles.actionBtn, styles.editBtn]}
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
                      style={[
                        styles.actionBtn,
                        isCompleted
                          ? styles.checkBtnActive
                          : styles.checkBtnInactive,
                      ]}
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
            style={styles.addSetBtn}
            onPress={() => handleAddSet(currentExIndex)}
          >
            <Text style={styles.addSetText}>+ ADD ANOTHER SET</Text>
          </Pressable>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Pressable
            style={styles.navBtn}
            onPress={currentExIndex > 0 ? handlePrevExercise : handleClose}
          >
            <Feather
              name="chevron-left"
              size={24}
              color={Colors.palette.zinc400}
            />
          </Pressable>

          {!isStarted ? (
            <Pressable style={styles.startBtn} onPress={handleStartSession}>
              <Text style={styles.startBtnText}>START SESSION</Text>
              <Feather
                name="zap"
                size={18}
                color="black"
                style={{ marginLeft: 8 }}
              />
            </Pressable>
          ) : currentExIndex < exercises.length - 1 ? (
            <Pressable style={styles.nextBtn} onPress={handleNextExercise}>
              <Text style={styles.nextBtnText}>NEXT EXERCISE</Text>
              <Feather
                name="chevron-right"
                size={18}
                color="white"
                style={{ marginLeft: 8 }}
              />
            </Pressable>
          ) : (
            <Pressable
              style={[
                styles.completeBtn,
                isAllComplete && styles.completeBtnActive,
              ]}
              disabled={!isAllComplete}
              onPress={handleFinishWorkout}
            >
              <Text
                style={[
                  styles.completeBtnText,
                  isAllComplete
                    ? { color: "black" }
                    : { color: Colors.palette.zinc500 },
                ]}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#1E1E22",
    alignItems: "center",
    justifyContent: "center",
  },
  timerText: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    textAlign: "right",
    minWidth: 60,
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: 24,
  },
  progressLabel: {
    color: Colors.palette.zinc500,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  progressLabelBlue: {
    color: SessionColors.BLUE,
    fontSize: 10,
    fontWeight: "800",
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1E1E22",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: SessionColors.BLUE,
    borderRadius: 4,
  },

  scrollContent: {
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  tagContainer: { alignItems: "center", marginBottom: 16 },
  categoryChip: {
    backgroundColor: "#1E1E30",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    color: SessionColors.BLUE,
    fontWeight: "800",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  exerciseTitle: {
    color: "white",
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  exCounter: {
    color: Colors.palette.zinc500,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 40,
  },

  setsList: {},
  setCard: {
    backgroundColor: "#1E1E22",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderColor: Colors.palette.zinc800,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  setCardCompleted: {
    borderColor: Colors.palette.green500,
  },
  setLabel: {
    color: Colors.palette.zinc500,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 4,
  },
  setVal: {
    color: "white",
    fontSize: 24,
    fontWeight: "800",
  },

  actionBtn: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  editBtn: {
    backgroundColor: "#27272A",
  },
  checkBtnInactive: {
    backgroundColor: "#27272A",
  },
  checkBtnActive: {
    backgroundColor: Colors.palette.green500,
  },

  addSetBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.palette.zinc800,
    borderStyle: "dashed",
    alignItems: "center",
    marginTop: 8,
  },
  addSetText: {
    color: Colors.palette.zinc500,
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 1,
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  navBtn: {
    flex: 1, // 25%
    height: 60,
    borderRadius: 20,
    backgroundColor: "#1E1E22",
    alignItems: "center",
    justifyContent: "center",
  },
  startBtn: {
    flex: 3, // 75%
    height: 60,
    backgroundColor: "white",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "white",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  startBtnText: {
    color: "black",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.5,
  },

  nextBtn: {
    flex: 3, // 75%
    height: 60,
    backgroundColor: SessionColors.BLUE,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  nextBtnText: {
    color: "white",
    fontWeight: "800",
    fontSize: 16,
  },

  completeBtn: {
    flex: 3, // 75%
    height: 60,
    backgroundColor: "#1E1E22",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  completeBtnActive: {
    backgroundColor: Colors.palette.green500,
  },
  completeBtnText: {
    fontWeight: "800",
    fontSize: 16,
  },

  // SUCCESS SCREENS
  successContainer: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  successTitle: {
    color: "white",
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  successSub: {
    color: Colors.palette.zinc500,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 40,
  },
  rewardCard: {
    backgroundColor: "#1E1E22",
    borderRadius: 24,
    paddingVertical: 40,
    paddingHorizontal: 60,
    alignItems: "center",
    marginBottom: 40,
    width: "100%",
  },
  rewardValue: {
    fontSize: 64,
    fontWeight: "800",
    color: SessionColors.BLUE,
    marginBottom: 8,
  },
  rewardLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.palette.zinc500,
    letterSpacing: 1,
  },
  starCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: SessionColors.GREEN,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  levelCard: {
    width: "100%",
    backgroundColor: "#1E1E22",
    borderRadius: 20,
    padding: 20,
    marginBottom: 40,
  },
  levelLabel: {
    color: "white",
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  levelBarBg: {
    height: 8,
    backgroundColor: "#27272A",
    borderRadius: 4,
    overflow: "hidden",
  },
  levelBarFill: {
    height: "100%",
    backgroundColor: SessionColors.BLUE,
  },
  continueBtn: {
    backgroundColor: SessionColors.GREEN,
    width: "100%",
    height: 60,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  continueBtnText: {
    color: "black",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 1,
  },
});
