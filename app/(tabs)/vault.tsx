import ExerciseDetailSheet from "@/components/exercises/ExerciseDetailSheet";
import { VaultFilterSheet, VaultSortOrder } from "@/components/vault/VaultFilterSheet";
import { Badge } from "@/components/ui/Badge";
import { UnilateralIndicator } from "@/components/ui/UnilateralIndicator";
import { SearchBar } from "@/components/ui/SearchBar";
import { DifficultyColors, getCategoryColor, palette } from "@/constants/Colors";
import { Exercise, ExerciseCategoryModel } from "@/constants/Types";
import { getDifficultySortOrder } from "@/constants/Enums";
import { Api } from "@/services/api";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Animated, { FadeInRight } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const STAGGER_CAP = 12;
const STAGGER_MS = 28;

export default function VaultScreen() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<ExerciseCategoryModel[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<VaultSortOrder>("name_asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [exData, catData] = await Promise.all([
        Api.getExercises(),
        Api.getExerciseCategories()
      ]);

      if (!exData || exData.length === 0) {
        setErrorStatus("No exercises found. Check connectivity.");
      } else {
        exData.sort((a, b) => a.name.localeCompare(b.name));
        setExercises(exData);
        setErrorStatus(null);
      }

      if (catData) {
        setCategories(catData);
      }

    } catch (e: any) {
      setErrorStatus(e.message || "Unknown error occurred");
    }
  };

  const filteredExercises = useMemo(() => {
    const filtered = exercises.filter((ex) => {
      const matchesFilter =
        selectedFilter === "all" ||
        ex.category.slug.toLowerCase() === selectedFilter.toLowerCase();
      const matchesSearch = ex.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    const sorted = [...filtered];
    switch (sortOrder) {
      case "name_asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name_desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "difficulty":
        sorted.sort(
          (a, b) =>
            getDifficultySortOrder(a.difficulty) -
            getDifficultySortOrder(b.difficulty),
        );
        break;
      case "category":
        sorted.sort((a, b) =>
          a.category.name.localeCompare(b.category.name),
        );
        break;
    }
    return sorted;
  }, [exercises, selectedFilter, searchQuery, sortOrder]);

  return (
    <SafeAreaView
      className="flex-1 bg-background-dark"
      edges={["left", "right", "bottom"]}
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      <View className="flex-1 p-6 pb-0">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-3xl font-extrabold text-white">Vault</Text>
          <Pressable
            onPress={() => setFilterSheetVisible(true)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 items-center justify-center active:opacity-80"
          >
            <FontAwesome name="sliders" size={18} color="#A1A1AA" />
          </Pressable>
        </View>

        {errorStatus && (
          <View className="bg-red-900/50 p-3 rounded-lg mb-4 border border-red-500">
            <Text className="text-red-200 font-bold">Error: {errorStatus}</Text>
            <Text className="text-red-200 text-xs">Target: {process.env.EXPO_PUBLIC_API_URL}</Text>
          </View>
        )}

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Category filter */}
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

        {/* Exercise List - key forces remount on filter/sort/search so entrance animations replay */}
        <Animated.FlatList
          key={`${selectedFilter}-${sortOrder}-${searchQuery}`}
          data={filteredExercises}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <Animated.View
              entering={
                index < STAGGER_CAP
                  ? FadeInRight.delay(index * STAGGER_MS).duration(240)
                  : FadeInRight.duration(240)
              }
              className="mb-4"
            >
              <Pressable
                onPress={() => setSelectedExercise(item)}
                className="bg-card-dark rounded-2xl p-4 flex-row justify-between items-center border border-zinc-800/50 active:scale-95 transition-transform"
              >
                {/* Left: Name + Unilateral Icon */}
                <View className="flex-1 flex-row items-center mr-4">
                  <Text className="text-sm font-bold text-white" numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.is_unilateral && (
                    <UnilateralIndicator variant="inline" size={16} className="ml-1.5" />
                  )}
                </View>

                {/* Right: Badges */}
                <View className="flex-row items-center gap-3 flex-shrink-0">
                  {/* Difficulty Dot */}
                  <View className="flex-row items-center gap-1.5">
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor:
                          DifficultyColors[item.difficulty as keyof typeof DifficultyColors] ||
                          palette.stone,
                      }}
                    />
                  </View>

                  {/* Category Pill – gradient fill, bright category color */}
                  <Badge
                    label={item.category.name}
                    color={getCategoryColor(item.category.slug)}
                    variant="filled"
                    size="sm"
                  />
                </View>
              </Pressable>
            </Animated.View>
          )}
        />
      </View>

      <VaultFilterSheet
        visible={filterSheetVisible}
        onClose={() => setFilterSheetVisible(false)}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
      />

      <ExerciseDetailSheet
        visible={!!selectedExercise}
        exercise={selectedExercise}
        onClose={() => setSelectedExercise(null)}
      />
    </SafeAreaView>
  );
}
