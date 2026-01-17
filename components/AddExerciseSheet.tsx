import { BottomActionPanel } from "@/components/SessionWizard/BottomActionPanel";
import { Input } from "@/components/ui/Input";
import Colors, { CategoryColors } from "@/constants/Colors";
import {
  ExerciseCategory,
  ExerciseDifficulty,
  ExerciseEquipment,
  ExerciseUnit,
} from "@/constants/Enums";
import { addExercise, Exercise } from "@/services/Database";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Crypto from "expo-crypto";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

interface AddExerciseSheetProps {
  visible: boolean;
  onClose: () => void;
  onExerciseAdded: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.9;

const getUuid = () => {
  try {
    if (Crypto.randomUUID) return Crypto.randomUUID();
  } catch (e) {}
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const CategoryIcons: Record<ExerciseCategory, any> = {
  [ExerciseCategory.PUSH]: "arrow-up",
  [ExerciseCategory.PULL]: "arrow-down",
  [ExerciseCategory.LEGS]: "run",
  [ExerciseCategory.CORE]: "circle-outline",
  [ExerciseCategory.SKILLS]: "star-outline",
};

const EquipmentIcons: Record<ExerciseEquipment, any> = {
  [ExerciseEquipment.NONE]: "cancel",
  [ExerciseEquipment.PULL_UP_BAR]: "format-vertical-align-top",
  [ExerciseEquipment.RINGS]: "circle-double",
  [ExerciseEquipment.PARALLETTES]: "menu",
  [ExerciseEquipment.RESISTANCE_BAND]: "gesture-swipe",
  [ExerciseEquipment.FLOOR]: "floor-plan",
  [ExerciseEquipment.STALL_BAR]: "ladder",
  [ExerciseEquipment.BOX]: "package-variant",
  [ExerciseEquipment.BENCH]: "seat-flat",
};

const SelectionChip = ({
  label,
  icon,
  selected,
  onPress,
  color = Colors.palette.blue500,
}: {
  label: string;
  icon?: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
}) => (
  <Pressable
    onPress={onPress}
    className={`flex-row items-center justify-center px-4 py-2.5 rounded-xl border mr-2 mb-2 transition-all ${
      selected
        ? "bg-zinc-800 border-transparent"
        : "bg-transparent border-zinc-800"
    }`}
    style={
      selected ? { backgroundColor: color + "20", borderColor: color } : {}
    }
  >
    {icon && (
      <MaterialCommunityIcons
        name={icon as any}
        size={14}
        color={selected ? color : Colors.palette.zinc500}
        style={{ marginRight: 6 }}
      />
    )}
    <Text
      className={`text-xs font-bold leading-none ${
        selected ? "text-white" : "text-zinc-500"
      }`}
      style={selected ? { color: color } : {}}
    >
      {label.replace(/_/g, " ")}
    </Text>
  </Pressable>
);

export default function AddExerciseSheet({
  visible,
  onClose,
  onExerciseAdded,
}: AddExerciseSheetProps) {
  const [showModal, setShowModal] = useState(false);
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ExerciseCategory>(
    ExerciseCategory.PUSH,
  );
  const [difficulty, setDifficulty] = useState<ExerciseDifficulty>(
    ExerciseDifficulty.BEGINNER,
  );
  const [equipment, setEquipment] = useState<ExerciseEquipment>(
    ExerciseEquipment.NONE,
  );
  const [unit, setUnit] = useState<ExerciseUnit>(ExerciseUnit.REPS);
  const [defaultReps, setDefaultReps] = useState("");
  const [isUnilateral, setIsUnilateral] = useState(false);

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      resetForm();
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 90,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SHEET_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setShowModal(false));
    }
  }, [visible]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategory(ExerciseCategory.PUSH);
    setDifficulty(ExerciseDifficulty.BEGINNER);
    setEquipment(ExerciseEquipment.NONE);
    setUnit(ExerciseUnit.REPS);
    setDefaultReps("");
    setIsUnilateral(false);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Please enter an exercise name");
      return;
    }

    const newExercise: Exercise = {
      id: getUuid(),
      name,
      description,
      category,
      difficulty,
      equipment,
      unit,
      default_reps: parseInt(defaultReps) || 0,
      is_unilateral: isUnilateral,
    };

    await addExercise(newExercise);
    onExerciseAdded();
    onClose();
  };

  if (!showModal) return null;

  return (
    <Modal
      visible={showModal}
      transparent
      statusBarTranslucent
      animationType="fade"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-black/60 justify-end"
      >
        <Pressable className="flex-1" onPress={onClose} />
        <Animated.View
          style={{
            height: SHEET_HEIGHT,
            transform: [{ translateY: slideAnim }],
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            backgroundColor: "#1c1c1e",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <View className="px-6 py-4 flex-row justify-between items-center bg-background-dark border-b border-zinc-900 absolute top-0 w-full z-10 rounded-t-3xl">
            <Text className="text-xl font-bold text-white tracking-tight">
              New Exercise
            </Text>
            <Pressable
              onPress={onClose}
              className="p-2 bg-zinc-800 rounded-full"
            >
              <FontAwesome name="close" size={12} color="white" />
            </Pressable>
          </View>

          <ScrollView
            className="flex-1 px-6 mt-16"
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Name */}
            <View className="mb-4 mt-6">
              <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2 ml-1">
                Name
              </Text>
              <Input
                placeholder="e.g. Archer Pushup"
                value={name}
                onChangeText={setName}
                inputContainerClassName="bg-zinc-900/50 border-zinc-800 rounded-xl py-2"
                className="text-sm"
              />
            </View>

            {/* Category */}
            <View className="mb-6">
              <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-3 ml-1">
                Category
              </Text>
              <View className="flex-row flex-wrap">
                {Object.values(ExerciseCategory).map((cat) => (
                  <SelectionChip
                    key={cat}
                    label={cat}
                    icon={CategoryIcons[cat]}
                    selected={category === cat}
                    onPress={() => setCategory(cat)}
                    color={CategoryColors[cat] || Colors.palette.blue500}
                  />
                ))}
              </View>
            </View>

            {/* Difficulty */}
            <View className="mb-6">
              <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-3 ml-1">
                Difficulty
              </Text>
              <View className="flex-row flex-wrap">
                {Object.values(ExerciseDifficulty).map((diff) => (
                  <SelectionChip
                    key={diff}
                    label={diff}
                    selected={difficulty === diff}
                    onPress={() => setDifficulty(diff)}
                    color={Colors.palette.white}
                  />
                ))}
              </View>
            </View>

            {/* Equipment */}
            <View className="mb-6">
              <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-3 ml-1">
                Equipment
              </Text>
              <View className="flex-row flex-wrap">
                {Object.values(ExerciseEquipment).map((eq) => (
                  <SelectionChip
                    key={eq}
                    label={eq}
                    icon={EquipmentIcons[eq]}
                    selected={equipment === eq}
                    onPress={() => setEquipment(eq)}
                    color={Colors.palette.blue500}
                  />
                ))}
              </View>
            </View>

            {/* Target & Unit */}
            <View className="flex-row gap-5 mb-6">
              <View className="flex-1">
                <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2 ml-1">
                  Target
                </Text>
                <Input
                  placeholder="0"
                  value={defaultReps}
                  onChangeText={setDefaultReps}
                  keyboardType="numeric"
                  inputContainerClassName="bg-zinc-900/50 border-zinc-800 rounded-xl py-2"
                  className="text-sm"
                />
              </View>
              <View className="flex-1">
                <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2 ml-1">
                  Unit
                </Text>
                <View className="flex-row gap-2 h-10">
                  {Object.values(ExerciseUnit).map((u) => (
                    <Pressable
                      key={u}
                      onPress={() => setUnit(u)}
                      className={`flex-1 items-center justify-center rounded-xl border ${
                        unit === u
                          ? "border-blue-500/50 bg-blue-500/10"
                          : "border-zinc-800 bg-zinc-900/30"
                      }`}
                    >
                      <Text
                        className={`font-bold text-xs ${
                          unit === u ? "text-blue-500" : "text-zinc-500"
                        }`}
                      >
                        {u}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            {/* Unilateral */}
            <View className="mb-6">
              <Pressable
                onPress={() => setIsUnilateral(!isUnilateral)}
                className={`flex-row items-center justify-between p-3.5 rounded-xl border transition-all ${
                  isUnilateral
                    ? "bg-blue-500/10 border-blue-500/50"
                    : "bg-zinc-900/30 border-zinc-800"
                }`}
              >
                <View className="flex-row items-center gap-3">
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center ${
                      isUnilateral ? "bg-blue-500" : "bg-zinc-800"
                    }`}
                  >
                    <MaterialCommunityIcons
                      name="arm-flex"
                      size={14}
                      color={isUnilateral ? "white" : "#71717a"}
                    />
                  </View>
                  <View>
                    <Text
                      className={`font-bold text-sm ${
                        isUnilateral ? "text-white" : "text-zinc-400"
                      }`}
                    >
                      Unilateral Movement
                    </Text>
                    <Text className="text-zinc-600 text-[10px] leading-tight mt-0.5">
                      Performed one side at a time
                    </Text>
                  </View>
                </View>
                <View
                  className={`w-4 h-4 rounded-full border ${
                    isUnilateral
                      ? "bg-blue-500 border-blue-500"
                      : "bg-transparent border-zinc-700"
                  }`}
                />
              </Pressable>
            </View>

            {/* Notes */}
            <View>
              <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2 ml-1">
                Notes
              </Text>
              <Input
                placeholder="Optional form cues..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                style={{ minHeight: 80, textAlignVertical: "top" }}
                inputContainerClassName="bg-zinc-900/50 border-zinc-800 rounded-xl"
                className="text-sm"
              />
            </View>
          </ScrollView>

          <View className="absolute bottom-0 w-full bg-background-dark/90 backdrop-blur-md">
            <BottomActionPanel
              primaryLabel="Create Exercise"
              onPrimaryPress={handleSave}
            />
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
