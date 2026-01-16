import Colors from "@/constants/Colors";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Modal, Text, View } from "react-native";
import { Button } from "../ui/Button";

interface Props {
  visible: boolean;
  elapsedTime: number;
  onClose: () => void;
}

export function SessionCompletion({ visible, elapsedTime, onClose }: Props) {
  // We can add simple animations or delays here
  // For now, static layout as per refactor req

  // Format Time for display
  const mins = Math.floor(elapsedTime / 60);
  const secs = elapsedTime % 60;
  const timeString = `${mins}m ${secs}s`;

  return (
    <Modal visible={visible} animationType="fade">
      <View className="flex-1 bg-background-dark items-center justify-center p-6">
        <View className="items-center mb-10">
          <View className="w-32 h-32 bg-yellow-400/10 rounded-full items-center justify-center mb-6 border-4 border-yellow-400/20">
            <FontAwesome
              name="trophy"
              size={48}
              color={Colors.palette.yellow400}
            />
          </View>
          <Text className="text-4xl font-black text-white text-center mb-2">
            SESSION COMPLETE
          </Text>
          <Text className="text-zinc-400 font-semibold tracking-wide text-center">
            Great work, Mali!
          </Text>
        </View>

        <View className="flex-row gap-4 mb-12">
          <View className="bg-card-dark p-6 rounded-2xl items-center min-w-[140px] border border-zinc-800">
            <Text className="text-zinc-500 font-bold text-xs uppercase mb-2">
              Duration
            </Text>
            <Text className="text-2xl font-black text-white">{timeString}</Text>
          </View>
          <View className="bg-card-dark p-6 rounded-2xl items-center min-w-[140px] border border-zinc-800">
            <Text className="text-zinc-500 font-bold text-xs uppercase mb-2">
              XP Earned
            </Text>
            <Text className="text-2xl font-black text-yellow-400">+150 XP</Text>
          </View>
        </View>

        <Button
          title="Return Home"
          onPress={onClose}
          size="lg"
          className="w-full"
        />
      </View>
    </Modal>
  );
}
