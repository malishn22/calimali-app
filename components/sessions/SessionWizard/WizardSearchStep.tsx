import { SearchBar } from "@/components/ui/SearchBar";
import { UnilateralIndicator } from "@/components/ui/UnilateralIndicator";
import { DifficultyColors, getCategoryColor, palette } from "@/constants/Colors";
import { WizardHeader } from "@/components/ui/WizardHeader";
import { Exercise } from "@/constants/Types";
import { Api } from "@/services/api";
import { FontAwesome } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { FlatList, Platform, Pressable, Text, View } from "react-native";
import { WizardScreenWrapper } from "./WizardScreenWrapper";

const ROW_BASE = "#27272a";

const rowShadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  android: { elevation: 4 },
});

interface Props {
  onSelect: (ex: Exercise) => void;
}

export function WizardSearchStep({ onSelect }: Props) {
  const [search, setSearch] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await Api.getExercises();
    data.sort((a, b) => a.name.localeCompare(b.name));
    setExercises(data);
  };

  const filtered = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <WizardScreenWrapper>
      <WizardHeader title="Search Movement" className="mb-4" />

      <View className="mb-5">
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Find movement..."
          inputContainerClassName="bg-zinc-800/80 border border-zinc-600/50 rounded-2xl"
          className="text-base"
        />
      </View>

      <FlatList
        data={filtered}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => {
          const categoryColor = getCategoryColor(item.category?.slug ?? "");
          const difficultyColor =
            DifficultyColors[item.difficulty as keyof typeof DifficultyColors] ??
            palette.stone;
          return (
            <Pressable
              onPress={() => onSelect(item)}
              style={({ pressed }) => [
                { transform: [{ scale: pressed ? 0.98 : 1 }] },
                rowShadow,
              ]}
              className="rounded-2xl mb-4 overflow-hidden border border-zinc-700/40"
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 22,
                  paddingHorizontal: 22,
                  borderRadius: 16,
                  backgroundColor: ROW_BASE,
                }}
              >
                <View className="flex-1 mr-4">
                  <Text className="text-white font-bold text-[17px] leading-tight mb-1.5">
                    {item.name}
                  </Text>
                  <View className="flex-row items-center gap-1.5">
                    <Text
                      className="text-xs font-bold uppercase tracking-widest opacity-90"
                      style={{ color: categoryColor }}
                    >
                      {item.category?.name ?? "Unknown"}
                    </Text>
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: difficultyColor,
                      }}
                    />
                    {item.is_unilateral && (
                      <UnilateralIndicator variant="inline" size={14} className="ml-2" />
                    )}
                  </View>
                </View>
                <View className="items-center justify-center">
                  <FontAwesome
                    name="chevron-right"
                    size={14}
                    color={palette.cloud}
                  />
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </WizardScreenWrapper>
  );
}
