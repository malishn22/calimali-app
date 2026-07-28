import { Stepper } from "@/components/ui/Stepper";
import Colors from "@/constants/Colors";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

interface EditSetModalProps {
  visible: boolean;
  initialReps: number;
  onClose: () => void;
  onSave: (newReps: number) => void;
}

export default function EditSetModal({
  visible,
  initialReps,
  onClose,
  onSave,
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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/70 justify-center items-center">
        <View className="w-[80%] bg-card-dark rounded-3xl p-6 items-center">
          {/* Header */}
          <View className="w-full flex-row justify-between items-center mb-6">
            <Text className="text-white text-lg font-bold">Edit Set</Text>
            <Pressable onPress={onClose} className="p-2">
              <FontAwesome
                name="close"
                size={16}
                color={Colors.palette.silver}
              />
            </Pressable>
          </View>

          {/* Counter */}
          <View className="mb-8">
            <Stepper
              value={reps}
              onIncrement={() => updateReps(1)}
              onDecrement={() => updateReps(-1)}
              min={1}
              size="lg"
              containerClassName="justify-center"
            />
          </View>

          {/* Actions */}
          <Pressable
            className="w-full py-4 rounded-2xl items-center bg-green-500"
            onPress={() => onSave(reps)}
          >
            <Text className="text-black font-extrabold text-base">
              Save Changes
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
