import { SearchBar } from "@/components/ui/SearchBar";
import { UnilateralIndicator } from "@/components/ui/UnilateralIndicator";
import { DifficultyColors, getCategoryColor, palette } from "@/constants/Colors";
import { WizardHeader } from "@/components/ui/WizardHeader";
import { Exercise, ExerciseCategoryModel } from "@/constants/Types";
import { Api } from "@/services/api";
import { FontAwesome } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { FlatList, Platform, Pressable, ScrollView, Text, View } from "react-native";
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
  const [categories, setCategories] = useState<ExerciseCategoryModel[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("all");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const [exData, catData] = await Promise.all([
      Api.getExercises(),
      Api.getExerciseCategories(),
    ]);
    exData.sort((a, b) => a.name.localeCompare(b.name));
    setExercises(exData);
    setCategories(catData);
  };

  const filtered = exercises.filter((ex) => {
    const matchesCategory =
      selectedFilter === "all" ||
      ex.category?.slug?.toLowerCase() === selectedFilter.toLowerCase();
    const matchesSearch = ex.name
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <WizardScreenWrapper>
      <WizardHeader title="Search Movement" className="mb-4" />

      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Find movement..."
        inputContainerClassName="bg-zinc-800/80 border border-zinc-600/50 rounded-2xl"
        className="text-base"
      />

      {/* Category filter chips */}
      <View className="flex-row mb-4 h-10">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          <Pressable
            onPress={() => setSelectedFilter("all")}
            className={`px-5 py-2 rounded-2xl justify-center ${selectedFilter === "all" ? "bg-white" : "bg-card-dark"}`}
          >
            <Text
              className={`font-bold text-xs ${selectedFilter === "all" ? "text-black" : "text-zinc-500"}`}
            >
              All
            </Text>
          </Pressable>
          {categories.map((cat) => {
            const isSelected = selectedFilter === cat.slug;
            return (
              <Pressable
                key={cat.id}
                onPress={() => setSelectedFilter(cat.slug)}
                className={`px-5 py-2 rounded-2xl justify-center ${isSelected ? "bg-white" : "bg-card-dark"}`}
              >
                <Text
                  className={`font-bold text-xs ${isSelected ? "text-black" : "text-zinc-500"}`}
                >
                  {cat.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
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
                    {item.isUnilateral && (
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
