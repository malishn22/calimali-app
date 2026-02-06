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
  frequency: "ONCE" | "DAILY" | "WEEKLY" | "EVERY 2 DAYS";
  setFrequency: (f: any) => void;
}

const COLORS = [
  "#3B82F6",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
];
const FREQUENCIES = [
  { label: "Once", value: "ONCE" },
  { label: "Daily", value: "DAILY" },
  { label: "Weekly", value: "WEEKLY" },
  { label: "Every 2 Days", value: "EVERY 2 DAYS" },
];

export function WizardFinalStep({
  title,
  setTitle,
  color,
  setColor,
  frequency,
  setFrequency,
}: Props) {
  return (
    <WizardScreenWrapper>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <WizardHeader title="Final Details" className="mb-8" />

        <View className="mb-8">
          <Text className="text-zinc-400 text-[10px] font-bold tracking-widest mb-3 uppercase pl-1">
            WORKOUT TITLE
          </Text>
          <Input
            value={title}
            onChangeText={setTitle}
            placeholder="E.g., Morning Push"
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

        {/* Frequency */}
        <View className="mb-8">
          <Text className="text-zinc-400 text-[10px] font-bold tracking-widest mb-3 uppercase pl-1">
            FREQUENCY
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {FREQUENCIES.map((freq) => {
              const isSelected = frequency === freq.value;
              return (
                <Pressable
                  key={freq.value}
                  onPress={() => setFrequency(freq.value)}
                  className={`w-[48%] py-5 rounded-xl border items-center justify-center ${isSelected
                      ? "bg-white border-white"
                      : "bg-zinc-900 border-zinc-700"
                    }`}
                >
                  <Text
                    className={`text-sm font-bold ${isSelected ? "text-black" : "text-zinc-400"
                      }`}
                  >
                    {freq.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </WizardScreenWrapper>
  );
}
