import Colors, { CategoryColors, SessionColors } from "@/constants/Colors";
import {
  addSession,
  getExercises,
  ScheduledSession,
  updateSession,
} from "@/services/Database";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
// import * as Crypto from "expo-crypto";
import { Exercise } from "@/services/Database";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SessionWizardProps {
  visible: boolean;
  selectedDate: Date;
  onClose: () => void;
  onSave: () => void;
  initialSession?: ScheduledSession | null;
}

interface SessionExercise extends Exercise {
  sets: { reps: number; weight?: number }[];
}

export default function SessionWizard({
  visible,
  selectedDate,
  onClose,
  onSave,
  initialSession,
}: SessionWizardProps) {
  const [step, setStep] = useState(1);
  const [sessionExercises, setSessionExercises] = useState<SessionExercise[]>(
    []
  );
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExerciseForConfig, setSelectedExerciseForConfig] =
    useState<Exercise | null>(null);

  // New Exercise Config State
  const [newSets, setNewSets] = useState<{ reps: number }[]>([{ reps: 10 }]);

  // Final Details State
  const [title, setTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState(SessionColors.BLUE);
  const [frequency, setFrequency] = useState<
    "ONCE" | "DAILY" | "WEEKLY" | "EVERY_2_DAYS"
  >("ONCE");

  useEffect(() => {
    if (visible) {
      loadExercises();
      if (initialSession) {
        // Pre-fill for editing
        setTitle(initialSession.title);
        setSelectedColor(initialSession.color as any);
        setFrequency(initialSession.frequency as any);
        try {
          setSessionExercises(JSON.parse(initialSession.exercises));
        } catch (e) {
          setSessionExercises([]);
        }
        setStep(1);
      } else {
        resetWizard(); // Reset if new
      }
    }
  }, [visible, initialSession]);

  const loadExercises = async () => {
    const data = await getExercises();
    setAllExercises(data);
  };

  const resetWizard = () => {
    setStep(1);
    setSessionExercises([]);
    setTitle("");
    setSelectedColor(SessionColors.BLUE);
    setFrequency("ONCE");
    setNewSets([{ reps: 10 }]);
  };

  const handleClose = () => {
    resetWizard();
    onClose();
  };

  const goNext = () => setStep((p) => p + 1);
  const goBack = () => {
    if (step === 1) handleClose();
    else if (step === 3) setStep(2); // Go back to search
    else setStep((p) => p - 1);
  };

  // --- Logic Step 2 (Select) ---
  const handleSelectExercise = (ex: Exercise) => {
    setSelectedExerciseForConfig(ex);
    // Init sets based on unilateral
    if (ex.is_unilateral) {
      setNewSets([{ reps: 10 }, { reps: 10 }]); // Left/Right pair
    } else {
      setNewSets([{ reps: 10 }]);
    }
    setStep(3);
  };

  // --- Logic Step 3 (Config) ---
  const updateRep = (index: number, change: number) => {
    setNewSets((prev) => {
      const copy = [...prev];
      copy[index].reps = Math.max(1, copy[index].reps + change);
      return copy;
    });
  };

  const addSet = () => {
    if (selectedExerciseForConfig?.is_unilateral) {
      setNewSets((p) => [...p, { reps: 10 }, { reps: 10 }]);
    } else {
      setNewSets((p) => [...p, { reps: 10 }]);
    }
  };

  const removeSetAtIndex = (index: number) => {
    if (selectedExerciseForConfig?.is_unilateral) {
      // If unilateral, we need to remove the PAIR.
      // Sets are stored as [L, R, L, R...]
      // If user clicks L (even index), remove at index and index+1
      // If user clicks R (odd index), remove at index-1 and index
      const pairStartIndex = index % 2 === 0 ? index : index - 1;
      setNewSets((prev) => {
        const copy = [...prev];
        copy.splice(pairStartIndex, 2);
        return copy;
      });
    } else {
      setNewSets((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const confirmExercise = () => {
    if (selectedExerciseForConfig) {
      setSessionExercises((prev) => [
        ...prev,
        { ...selectedExerciseForConfig, sets: newSets },
      ]);
      setStep(1); // Back to routine list
    }
  };

  // Helper for UUID
  const generateUUID = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  };

  // --- Logic Step 4 (Save) ---
  const handleSaveSession = async () => {
    if (!title) return;

    // Check if updating or creating
    if (initialSession) {
      const updatedSession: ScheduledSession = {
        ...initialSession,
        title,
        date: selectedDate.toISOString(), // Or keep original date? Usually updating implies same slot unless moved. User said "edit it... update database".
        frequency,
        color: selectedColor,
        exercises: JSON.stringify(sessionExercises),
      };
      await updateSession(updatedSession);
    } else {
      const newSession: ScheduledSession = {
        id: generateUUID(),
        title,
        date: selectedDate.toISOString(),
        frequency,
        color: selectedColor,
        exercises: JSON.stringify(sessionExercises),
      };
      await addSession(newSession);
    }
    onSave(); // Refresh parent
    handleClose();
  };

  // --- Renders ---

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Plan Routine</Text>

      <Pressable style={styles.addExerciseBtn} onPress={() => setStep(2)}>
        <FontAwesome name="plus" size={16} color={Colors.palette.white} />
        <Text style={styles.addExerciseText}>Add movement</Text>
      </Pressable>

      <FlatList
        data={sessionExercises}
        keyExtractor={(item, index) => item.id + index}
        ListEmptyComponent={
          <Text style={styles.emptyText}>NO EXERCISES ADDED YET</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.sessionItem}>
            <View>
              <Text style={styles.itemTitle}>{item.name}</Text>
              <Text style={styles.itemSubtitle}>
                {item.sets.length} SETS • {item.category}
              </Text>
            </View>
            <View style={styles.itemActions}>
              {/* Delete/Edit placeholders */}
              <FontAwesome
                name="trash"
                size={16}
                color={Colors.palette.red500}
                onPress={() => {
                  setSessionExercises((p) => p.filter((e) => e !== item));
                }}
              />
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <View style={styles.footer}>
        <Pressable style={styles.footerBtnSecondary} onPress={handleClose}>
          <Text style={styles.footerBtnTextSec}>Cancel</Text>
        </Pressable>
        {sessionExercises.length > 0 && (
          <Pressable
            style={[
              styles.footerBtnPrimary,
              { backgroundColor: SessionColors.BLUE },
            ]}
            onPress={() => setStep(4)}
          >
            <Text style={styles.footerBtnTextPrimary}>NEXT</Text>
          </Pressable>
        )}
      </View>
    </View>
  );

  const renderStep2 = () => {
    // Basic Search (reusing similar logic to vault but simplified)
    const filtered = allExercises.filter((e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.title}>Search Movement</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Find movement..."
          placeholderTextColor={Colors.palette.zinc600}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={styles.searchItem}
              onPress={() => handleSelectExercise(item)}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Text style={styles.searchItemName}>{item.name}</Text>
                {item.is_unilateral && (
                  <MaterialCommunityIcons
                    name="alpha-u-box"
                    size={16}
                    color={Colors.palette.zinc400}
                  />
                )}
              </View>
              <Text style={styles.searchItemSub}>
                <Text style={{ color: CategoryColors[item.category] }}>
                  {item.category}
                </Text>{" "}
                • {item.difficulty}
              </Text>
              <FontAwesome
                name="chevron-right"
                size={12}
                color={Colors.palette.zinc600}
                style={{ position: "absolute", right: 16 }}
              />
            </Pressable>
          )}
        />
        <Pressable style={styles.backBtnAbsolute} onPress={() => setStep(1)}>
          <Text style={styles.footerBtnTextSec}>Back</Text>
        </Pressable>
      </View>
    );
  };

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Configure Sets</Text>
      <Text style={styles.exerciseTitleBig}>
        {selectedExerciseForConfig?.name}
      </Text>
      <Text style={styles.categoryTag}>
        {selectedExerciseForConfig?.category}
      </Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {newSets.map((set, idx) => (
          <View key={idx} style={styles.setConfigRow}>
            <View style={styles.setLabel}>
              <Text style={styles.setLabelText}>
                Set{" "}
                {selectedExerciseForConfig?.is_unilateral
                  ? Math.floor(idx / 2) + 1
                  : idx + 1}
                {selectedExerciseForConfig?.is_unilateral
                  ? idx % 2 === 0
                    ? " [L]"
                    : " [R]"
                  : ""}
              </Text>
              <Text style={styles.setUnitText}>
                {selectedExerciseForConfig?.unit}
              </Text>
            </View>
            <View style={styles.counter}>
              <Pressable
                style={styles.counterBtn}
                onPress={() => updateRep(idx, -1)}
              >
                <FontAwesome
                  name="minus"
                  size={16}
                  color={Colors.palette.zinc400}
                />
              </Pressable>
              <Text style={styles.counterValue}>{set.reps}</Text>
              <Pressable
                style={styles.counterBtn}
                onPress={() => updateRep(idx, 1)}
              >
                <FontAwesome
                  name="plus"
                  size={16}
                  color={Colors.palette.white}
                />
              </Pressable>

              <Pressable
                style={styles.removeSetBtn}
                onPress={() => removeSetAtIndex(idx)}
              >
                <FontAwesome
                  name="trash"
                  size={16}
                  color={Colors.palette.red500}
                />
              </Pressable>
            </View>
          </View>
        ))}

        <Pressable style={styles.addMoreSetsBtn} onPress={addSet}>
          <Text style={styles.addMoreText}>+ ADD MORE SETS</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.footerBtnSecondary} onPress={() => setStep(2)}>
          <Text style={styles.footerBtnTextSec}>Back</Text>
        </Pressable>
        <Pressable
          style={[
            styles.footerBtnPrimary,
            { backgroundColor: SessionColors.BLUE },
          ]}
          onPress={confirmExercise}
        >
          <FontAwesome
            name="check"
            size={14}
            color="#000"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.footerBtnTextPrimary}>CONFIRM</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Final Details</Text>

      <Text style={styles.label}>WORKOUT TITLE</Text>
      <TextInput
        style={styles.input}
        placeholder="E.g., Morning Push"
        placeholderTextColor={Colors.palette.zinc600}
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>CARD COLOR</Text>
      <View style={styles.colorRow}>
        {Object.values(SessionColors).map((c) => (
          <Pressable
            key={c}
            style={[
              styles.colorCircle,
              { backgroundColor: c },
              selectedColor === c && styles.colorSelected,
            ]}
            onPress={() => setSelectedColor(c)}
          />
        ))}
      </View>

      <Text style={styles.label}>FREQUENCY</Text>
      <View style={styles.freqGrid}>
        {(["ONCE", "DAILY", "WEEKLY", "EVERY_2_DAYS"] as const).map((f) => (
          <Pressable
            key={f}
            style={[
              styles.freqChip,
              frequency === f && styles.freqChipSelected,
            ]}
            onPress={() => setFrequency(f)}
          >
            <Text
              style={[
                styles.freqText,
                frequency === f && styles.freqTextSelected,
              ]}
            >
              {f.replace(/_/g, " ")}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.footerBtnSecondary} onPress={() => setStep(1)}>
          <Text style={styles.footerBtnTextSec}>Back</Text>
        </Pressable>
        <Pressable
          style={[styles.footerBtnPrimary, !title && { opacity: 0.5 }]}
          onPress={handleSaveSession}
          disabled={!title}
        >
          <FontAwesome
            name="check"
            size={14}
            color="#000"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.footerBtnTextPrimary}>SAVE</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  stepContainer: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.palette.zinc500, // Updated color
    textAlign: "center",
    marginBottom: 32,
  },
  emptyText: {
    color: Colors.palette.zinc600,
    textAlign: "center",
    marginTop: 100,
    fontWeight: "700",
    letterSpacing: 1,
  },
  addExerciseBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.dark.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.palette.zinc800,
  },
  addExerciseText: {
    color: Colors.palette.white,
    fontWeight: "700",
    marginLeft: 8,
  },
  sessionItem: {
    backgroundColor: Colors.dark.card,
    borderWidth: 0,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemTitle: {
    color: Colors.palette.white,
    fontWeight: "700",
    fontSize: 16,
    backgroundColor: "transparent",
  },
  itemSubtitle: {
    color: SessionColors.BLUE,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
    textTransform: "uppercase",
    backgroundColor: "transparent",
  },
  itemActions: {
    flexDirection: "row",
    gap: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "auto",
    paddingTop: 20,
  },
  footerBtnSecondary: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark.card,
    minWidth: 100,
    alignItems: "center",
  },
  footerBtnPrimary: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    backgroundColor: Colors.palette.green500, // Green
    flex: 1,
    marginLeft: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  footerBtnTextSec: {
    color: Colors.palette.zinc400,
    fontWeight: "700",
  },
  footerBtnTextPrimary: {
    color: Colors.palette.black,
    fontWeight: "700",
  },
  // Step 2
  searchInput: {
    backgroundColor: Colors.dark.card,
    padding: 16,
    borderRadius: 12,
    color: Colors.palette.white,
    borderWidth: 1,
    borderColor: SessionColors.BLUE, // Highlighted
    marginBottom: 24,
  },
  searchItem: {
    backgroundColor: Colors.dark.card,
    borderWidth: 0,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    justifyContent: "center",
  },
  searchItemName: {
    color: Colors.palette.white,
    fontWeight: "700",
    fontSize: 16,
    backgroundColor: "transparent",
  },
  searchItemSub: {
    color: Colors.palette.zinc500,
    fontSize: 12,
    textTransform: "uppercase",
    marginTop: 4,
    fontWeight: "600",
  },
  backBtnAbsolute: {
    backgroundColor: Colors.dark.card,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    position: "absolute",
    bottom: 24,
    left: 24,
  },
  // Step 3
  exerciseTitleBig: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.palette.white,
    textAlign: "center",
  },
  categoryTag: {
    color: SessionColors.BLUE,
    textAlign: "center",
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 32,
  },
  setConfigRow: {
    backgroundColor: Colors.dark.card,
    borderWidth: 0,
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    justifyContent: "space-between",
  },
  setLabel: {},
  setLabelText: {
    color: Colors.palette.zinc400,
    fontWeight: "700",
    fontSize: 14,
    backgroundColor: "transparent",
  },
  setUnitText: {
    color: SessionColors.BLUE,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    backgroundColor: "transparent",
  },
  counter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  counterBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: Colors.palette.zinc700,
    alignItems: "center",
    justifyContent: "center",
  },
  counterValue: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.palette.white,
    width: 40,
    textAlign: "center",
    backgroundColor: "transparent",
  },
  addMoreSetsBtn: {
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.palette.zinc800,
    borderRadius: 12,
    borderStyle: "dashed",
    marginTop: 12,
  },
  addMoreText: {
    color: Colors.palette.zinc500,
    fontWeight: "700",
    fontSize: 12,
  },
  // Step 4
  label: {
    color: Colors.palette.zinc500,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 24,
  },
  input: {
    backgroundColor: Colors.dark.card,
    padding: 16,
    borderRadius: 12,
    color: Colors.palette.white,
    fontSize: 16,
    fontWeight: "600",
  },
  colorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  colorSelected: {
    borderWidth: 4,
    borderColor: Colors.palette.white,
  },
  freqGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  freqChip: {
    width: "48%",
    backgroundColor: Colors.dark.card,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  freqChipSelected: {
    backgroundColor: Colors.palette.white,
  },
  freqText: {
    color: Colors.palette.zinc500,
    fontWeight: "700",
  },
  freqTextSelected: {
    color: Colors.palette.black,
  },
  removeSetBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    backgroundColor: Colors.palette.zinc900,
    borderRadius: 12,
  },
});
