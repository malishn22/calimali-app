import Colors from "@/constants/Colors";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

interface EditSetModalProps {
  visible: boolean;
  initialReps: number;
  onClose: () => void;
  onSave: (newReps: number) => void;
  onDelete: () => void;
}

export default function EditSetModal({
  visible,
  initialReps,
  onClose,
  onSave,
  onDelete,
}: EditSetModalProps) {
  const [reps, setReps] = useState(initialReps || 0);

  useEffect(() => {
    if (visible) {
      setReps(Number(initialReps) || 0);
    }
  }, [visible, initialReps]);

  const updateReps = (delta: number) => {
    setReps((prev) => Math.max(1, Number(prev) + delta));
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/70 justify-center items-center">
        <View className="w-[80%] bg-card-dark rounded-3xl p-6 items-center">
          {/* Header */}
          <View className="w-full flex-row justify-between items-center mb-6">
            <Text className="text-white text-lg font-bold">Edit Set</Text>
            <Pressable onPress={onClose} className="p-2">
              <FontAwesome
                name="close"
                size={16}
                color={Colors.palette.zinc400}
              />
            </Pressable>
          </View>

          {/* Counter */}
          <View className="flex-row items-center mb-8 gap-6">
            <Pressable
              className="w-16 h-16 rounded-3xl bg-zinc-800 items-center justify-center"
              onPress={() => updateReps(-1)}
            >
              <FontAwesome
                name="minus"
                size={16}
                color={Colors.palette.zinc400}
              />
            </Pressable>
            <Text className="text-5xl font-extrabold text-white min-w-[80px] text-center">
              {reps}
            </Text>
            <Pressable
              className="w-16 h-16 rounded-3xl bg-zinc-800 items-center justify-center"
              onPress={() => updateReps(1)}
            >
              <FontAwesome name="plus" size={16} color={Colors.palette.white} />
            </Pressable>
          </View>

          {/* Actions */}
          <Pressable
            className="w-full py-4 rounded-2xl items-center mb-4 bg-green-500"
            onPress={() => onSave(reps)}
          >
            <Text className="text-black font-extrabold text-base">
              Save Changes
            </Text>
          </Pressable>

          <Pressable
            className="w-full py-4 rounded-2xl flex-row items-center justify-center border border-red-500"
            onPress={onDelete}
          >
            <FontAwesome
              name="trash"
              size={16}
              color={Colors.palette.red500}
              style={{ marginRight: 8 }}
            />
            <Text className="text-red-500 font-bold text-base">Delete Set</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
