import { BackButton } from "@/components/ui/BackButton";
import { Input } from "@/components/ui/Input";
import { WizardHeader } from "@/components/ui/WizardHeader";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { WizardScreenWrapper } from "./WizardScreenWrapper";

interface Props {
  title: string;
  setTitle: (t: string) => void;
  color: string;
  setColor: (c: string) => void;
  onBack: () => void;
}

const COLORS = [
  "#3B82F6",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
];

export function WizardFinalStep({
  title,
  setTitle,
  color,
  setColor,
  onBack,
}: Props) {
  return (
    <WizardScreenWrapper>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <WizardHeader
          title="Final Details"
          className="mb-8"
          leftAccessory={<BackButton onPress={onBack} />}
        />

        <View className="mb-8">
          <Text className="text-zinc-400 text-[10px] font-bold tracking-widest mb-3 uppercase pl-1">
            ROUTINE NAME
          </Text>
          <Input
            value={title}
            onChangeText={setTitle}
            placeholder="E.g., Push Day"
            inputContainerClassName="bg-zinc-900 border border-zinc-700 py-5"
            className="text-lg"
          />
        </View>

        {/* Colors */}
        <View className="mb-8">
          <Text className="text-zinc-400 text-[10px] font-bold tracking-widest mb-3 uppercase pl-1">
            CARD COLOR
          </Text>
          <View className="flex-row flex-wrap gap-4">
            {COLORS.map((c) => (
              <Pressable
                key={c}
                onPress={() => setColor(c)}
                className={`w-12 h-12 rounded-full ${color === c ? "border-[5px] border-white" : ""
                  }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </View>
        </View>

        <Text className="text-zinc-500 text-xs leading-5 px-1">
          Save this routine, then add it to your calendar from the Planner — you can
          schedule the same routine on as many days as you like.
        </Text>
      </ScrollView>
    </WizardScreenWrapper>
  );
}
