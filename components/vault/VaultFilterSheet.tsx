import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type VaultSortOrder =
  | "name_asc"
  | "name_desc"
  | "difficulty"
  | "category";

interface VaultFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  sortOrder: VaultSortOrder;
  onSortOrderChange: (order: VaultSortOrder) => void;
}

const SORT_OPTIONS: { value: VaultSortOrder; label: string }[] = [
  { value: "name_asc", label: "Name A–Z" },
  { value: "name_desc", label: "Name Z–A" },
  { value: "difficulty", label: "Difficulty" },
  { value: "category", label: "Category" },
];

const DURATION_IN = 120;
const DURATION_OUT = 100;

const easeOutCubic = Easing.bezier(0.33, 1, 0.68, 1);

const scaleIn = () => {
  "worklet";
  const config = {
    duration: DURATION_IN,
    easing: easeOutCubic,
  };
  return {
    initialValues: { opacity: 0, transform: [{ scale: 0 }] },
    animations: {
      opacity: withTiming(1, config),
      transform: [{ scale: withTiming(1, config) }],
    },
  };
};

const scaleOut = () => {
  "worklet";
  const config = {
    duration: DURATION_OUT,
    easing: easeOutCubic,
  };
  return {
    initialValues: { opacity: 1, transform: [{ scale: 1 }] },
    animations: {
      opacity: withTiming(0, config),
      transform: [{ scale: withTiming(0, config) }],
    },
  };
};

export function VaultFilterSheet({
  visible,
  onClose,
  sortOrder,
  onSortOrderChange,
}: VaultFilterSheetProps) {
  const insets = useSafeAreaInsets();
  const topOffset = insets.top + 56;

  const handleSelect = (value: VaultSortOrder) => {
    onSortOrderChange(value);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {visible && (
      <Pressable
        style={{
          flex: 1,
          paddingTop: topOffset,
          paddingRight: 24,
          alignItems: "flex-end",
          backgroundColor: "rgba(0,0,0,0.4)",
        }}
        onPress={onClose}
      >
        <Animated.View
          entering={scaleIn}
          exiting={scaleOut}
          style={{ minWidth: 200, transformOrigin: "top right" }}
          onStartShouldSetResponder={() => true}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="bg-card-dark rounded-2xl border border-zinc-800 shadow-xl overflow-hidden"
            style={{ paddingVertical: 8 }}
          >
            <View className="px-3 py-2 border-b border-zinc-800/80">
              <Text className="text-zinc-400 font-bold text-[10px] uppercase tracking-wider">
                Sort by
              </Text>
            </View>
            <View className="pt-2">
              {SORT_OPTIONS.map((opt) => {
                const isSelected = sortOrder === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => handleSelect(opt.value)}
                    className={`flex-row items-center justify-between px-4 py-3 mx-2 rounded-xl ${isSelected ? "bg-white" : "bg-transparent active:bg-zinc-800/50"}`}
                  >
                    <Text
                      className={`font-semibold text-sm ${isSelected ? "text-black" : "text-zinc-300"}`}
                    >
                      {opt.label}
                    </Text>
                    {isSelected && (
                      <FontAwesome name="check" size={14} color="#000" />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
      )}
    </Modal>
  );
}
