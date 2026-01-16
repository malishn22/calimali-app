import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Input } from "../ui/Input";

interface Props {
  title: string;
  setTitle: (t: string) => void;
  color: string;
  setColor: (c: string) => void;
  frequency: "ONCE" | "DAILY" | "WEEKLY" | "EVERY_2_DAYS";
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
  { label: "Just Once", value: "ONCE" },
  { label: "Daily", value: "DAILY" },
  { label: "Weekly", value: "WEEKLY" },
  { label: "Every 2 Days", value: "EVERY_2_DAYS" },
];

export function WizardStep4_Final({
  title,
  setTitle,
  color,
  setColor,
  frequency,
  setFrequency,
}: Props) {
  return (
    <ScrollView className="flex-1">
      <Text className="text-3xl font-extrabold text-white mb-8">
        Session Details
      </Text>

      <Input
        label="SESSION NAME"
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Leg Day Destruction"
      />

      <View className="mb-8">
        <Text className="text-zinc-500 text-xs font-bold tracking-widest mb-3 uppercase">
          Color Tag
        </Text>
        <View className="flex-row flex-wrap gap-4">
          {COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              className={`w-12 h-12 rounded-full border-4 ${
                color === c ? "border-white" : "border-transparent"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </View>
      </View>

      <View className="mb-8">
        <Text className="text-zinc-500 text-xs font-bold tracking-widest mb-3 uppercase">
          Frequency
        </Text>
        <View className="gap-3">
          {FREQUENCIES.map((freq) => (
            <Pressable
              key={freq.value}
              onPress={() => setFrequency(freq.value)}
              className={`p-4 rounded-xl border ${
                frequency === freq.value
                  ? "bg-blue-500 border-blue-500"
                  : "bg-card-dark border-zinc-800"
              }`}
            >
              <Text
                className={`text-base font-bold ${
                  frequency === freq.value ? "text-black" : "text-zinc-400"
                }`}
              >
                {freq.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
