import React from "react";
import { Modal, Pressable, Text, View } from "react-native";

interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Styles the confirm button red for irreversible/destructive actions (e.g. delete). */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationDialog({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 bg-black/70 justify-center items-center px-6">
        <View className="w-full max-w-sm bg-card-dark rounded-3xl p-6">
          <Text className="text-white text-lg font-bold mb-2 text-center">
            {title}
          </Text>
          {message ? (
            <Text className="text-zinc-400 text-sm text-center mb-6 leading-relaxed">
              {message}
            </Text>
          ) : (
            <View className="mb-4" />
          )}

          <View className="flex-row gap-3">
            <Pressable
              className="flex-1 py-4 rounded-2xl items-center bg-zinc-800"
              onPress={onCancel}
            >
              <Text className="text-zinc-300 font-bold text-base">
                {cancelLabel}
              </Text>
            </Pressable>
            <Pressable
              className={`flex-1 py-4 rounded-2xl items-center ${
                destructive ? "bg-red-500" : "bg-green-500"
              }`}
              onPress={onConfirm}
            >
              <Text className="text-black font-extrabold text-base">
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
