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
    <View className="flex-1 p-6">
      <Text className="text-xl font-bold text-zinc-500 text-center mb-8">
        Plan Routine
      </Text>

      <Pressable
        className="flex-row items-center justify-center bg-card-dark p-4 rounded-2xl mb-6 border border-zinc-800"
        onPress={() => setStep(2)}
      >
        <FontAwesome name="plus" size={16} color={Colors.palette.white} />
        <Text className="text-white font-bold ml-2">Add movement</Text>
      </Pressable>

      <FlatList
        data={sessionExercises}
        keyExtractor={(item, index) => item.id + index}
        ListEmptyComponent={
          <Text className="text-zinc-600 text-center mt-24 font-bold tracking-widest">
            NO EXERCISES ADDED YET
          </Text>
        }
        renderItem={({ item }) => (
          <View className="bg-card-dark p-4 rounded-xl mb-3 flex-row justify-between items-center">
            <View>
              <Text className="text-white font-bold text-base">
                {item.name}
              </Text>
              <Text className="text-blue-500 text-xs font-bold mt-1 uppercase">
                {item.sets.length} SETS • {item.category}
              </Text>
            </View>
            <View className="flex-row gap-3">
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

      <View className="flex-row justify-between mt-auto pt-5">
        <Pressable
          className="py-4 px-8 rounded-2xl bg-card-dark min-w-[100px] items-center"
          onPress={handleClose}
        >
          <Text className="text-zinc-400 font-bold">Cancel</Text>
        </Pressable>
        {sessionExercises.length > 0 && (
          <Pressable
            className="py-4 px-8 rounded-2xl bg-blue-500 flex-1 ml-4 items-center flex-row justify-center"
            style={{ backgroundColor: SessionColors.BLUE }}
            onPress={() => setStep(4)}
          >
            <Text className="text-black font-bold">NEXT</Text>
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
      <View className="flex-1 p-6">
        <Text className="text-xl font-bold text-zinc-500 text-center mb-8">
          Search Movement
        </Text>
        <TextInput
          className="bg-card-dark p-4 rounded-xl text-white border border-blue-500 mb-6"
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
              className="bg-card-dark p-4 rounded-xl mb-3 justify-center"
              onPress={() => handleSelectExercise(item)}
            >
              <View className="flex-row items-center gap-1.5">
                <Text className="text-white font-bold text-base">
                  {item.name}
                </Text>
                {item.is_unilateral && (
                  <MaterialCommunityIcons
                    name="alpha-u-box"
                    size={16}
                    color={Colors.palette.zinc400}
                  />
                )}
              </View>
              <Text className="text-zinc-500 text-xs uppercase mt-1 font-semibold">
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
        <Pressable
          className="bg-card-dark py-4 px-8 rounded-2xl absolute bottom-6 left-6"
          onPress={() => setStep(1)}
        >
          <Text className="text-zinc-400 font-bold">Back</Text>
        </Pressable>
      </View>
    );
  };

  const renderStep3 = () => (
    <View className="flex-1 p-6">
      <Text className="text-xl font-bold text-zinc-500 text-center mb-8">
        Configure Sets
      </Text>
      <Text className="text-3xl font-extrabold text-white text-center">
        {selectedExerciseForConfig?.name}
      </Text>
      <Text className="text-blue-500 text-center font-bold uppercase mb-8">
        {selectedExerciseForConfig?.category}
      </Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {newSets.map((set, idx) => (
          <View
            key={idx}
            className="bg-card-dark p-4 rounded-2xl flex-row items-center mb-3 justify-between"
          >
            <View>
              <Text className="text-zinc-400 font-bold text-sm">
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
              <Text className="text-blue-500 text-[10px] font-extrabold uppercase">
                {selectedExerciseForConfig?.unit}
              </Text>
            </View>
            <View className="flex-row items-center gap-4">
              <Pressable
                className="w-11 h-11 rounded-2xl bg-zinc-700 items-center justify-center"
                onPress={() => updateRep(idx, -1)}
              >
                <FontAwesome
                  name="minus"
                  size={16}
                  color={Colors.palette.zinc400}
                />
              </Pressable>
              <Text className="text-2xl font-bold text-white w-10 text-center">
                {set.reps}
              </Text>
              <Pressable
                className="w-11 h-11 rounded-2xl bg-zinc-700 items-center justify-center"
                onPress={() => updateRep(idx, 1)}
              >
                <FontAwesome
                  name="plus"
                  size={16}
                  color={Colors.palette.white}
                />
              </Pressable>

              <Pressable
                className="w-11 h-11 items-center justify-center ml-2 bg-zinc-900 rounded-xl"
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

        <Pressable
          className="p-4 items-center border border-zinc-800 rounded-xl border-dashed mt-3"
          onPress={addSet}
        >
          <Text className="text-zinc-500 font-bold text-xs">
            + ADD MORE SETS
          </Text>
        </Pressable>
      </ScrollView>

      <View className="flex-row justify-between mt-auto pt-5">
        <Pressable
          className="py-4 px-8 rounded-2xl bg-card-dark min-w-[100px] items-center"
          onPress={() => setStep(2)}
        >
          <Text className="text-zinc-400 font-bold">Back</Text>
        </Pressable>
        <Pressable
          className="py-4 px-8 rounded-2xl bg-blue-500 flex-1 ml-4 items-center flex-row justify-center"
          style={{ backgroundColor: SessionColors.BLUE }}
          onPress={confirmExercise}
        >
          <FontAwesome
            name="check"
            size={14}
            color="#000"
            style={{ marginRight: 6 }}
          />
          <Text className="text-black font-bold">CONFIRM</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View className="flex-1 p-6">
      <Text className="text-xl font-bold text-zinc-500 text-center mb-8">
        Final Details
      </Text>

      <Text className="text-zinc-500 text-xs font-bold tracking-widest mb-3 mt-6">
        WORKOUT TITLE
      </Text>
      <TextInput
        className="bg-card-dark p-4 rounded-xl text-white text-base font-semibold"
        placeholder="E.g., Morning Push"
        placeholderTextColor={Colors.palette.zinc600}
        value={title}
        onChangeText={setTitle}
      />

      <Text className="text-zinc-500 text-xs font-bold tracking-widest mb-3 mt-6">
        CARD COLOR
      </Text>
      <View className="flex-row justify-between">
        {Object.values(SessionColors).map((c) => (
          <Pressable
            key={c}
            className={`w-10 h-10 rounded-full ${
              selectedColor === c ? "border-4 border-white" : ""
            }`}
            style={{ backgroundColor: c }}
            onPress={() => setSelectedColor(c)}
          />
        ))}
      </View>

      <Text className="text-zinc-500 text-xs font-bold tracking-widest mb-3 mt-6">
        FREQUENCY
      </Text>
      <View className="flex-row flex-wrap gap-3">
        {(["ONCE", "DAILY", "WEEKLY", "EVERY_2_DAYS"] as const).map((f) => (
          <Pressable
            key={f}
            className={`w-[48%] bg-card-dark p-4 rounded-xl items-center ${
              frequency === f ? "bg-white" : ""
            }`}
            onPress={() => setFrequency(f)}
          >
            <Text
              className={`text-zinc-500 font-bold ${
                frequency === f ? "text-black" : ""
              }`}
            >
              {f.replace(/_/g, " ")}
            </Text>
          </Pressable>
        ))}
      </View>

      <View className="flex-row justify-between mt-auto pt-5">
        <Pressable
          className="py-4 px-8 rounded-2xl bg-card-dark min-w-[100px] items-center"
          onPress={() => setStep(1)}
        >
          <Text className="text-zinc-400 font-bold">Back</Text>
        </Pressable>
        <Pressable
          className={`py-4 px-8 rounded-2xl bg-green-500 flex-1 ml-4 items-center flex-row justify-center ${
            !title ? "opacity-50" : ""
          }`}
          onPress={handleSaveSession}
          disabled={!title}
        >
          <FontAwesome
            name="check"
            size={14}
            color="#000"
            style={{ marginRight: 6 }}
          />
          <Text className="text-black font-bold">SAVE</Text>
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
      <SafeAreaView className="flex-1 bg-background-dark">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </SafeAreaView>
    </Modal>
  );
}
