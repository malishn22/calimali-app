import ExerciseDetailSheet from "@/components/exercises/ExerciseDetailSheet";
import { Input } from "@/components/ui/Input";
import Colors, { CategoryColors, DifficultyColors } from "@/constants/Colors";
import { Exercise, ExerciseCategoryModel } from "@/constants/Types";
import { Api } from "@/services/api";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  LinearTransition,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VaultScreen() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<ExerciseCategoryModel[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredExercises = exercises.filter((ex) => {
    const matchesFilter =
      selectedFilter === "all" ||
      ex.category.slug.toLowerCase() === selectedFilter.toLowerCase();
    const matchesSearch = ex.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getCategoryColor = (categorySlug: string) => {
    return (
      CategoryColors[categorySlug.toUpperCase() as keyof typeof CategoryColors] ||
      CategoryColors.OTHER
    );
  };

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
        </View>

        {errorStatus && (
          <View className="bg-red-900/50 p-3 rounded-lg mb-4 border border-red-500">
            <Text className="text-red-200 font-bold">Error: {errorStatus}</Text>
            <Text className="text-red-200 text-xs">Target: {process.env.EXPO_PUBLIC_API_URL}</Text>
          </View>
        )}

        {/* Search Bar */}
        <Input
          placeholder="Search movements..."
          icon="search"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Filter Tags */}
        <View className="flex-row mb-6 h-10">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            <Pressable
              onPress={() => setSelectedFilter("all")}
              className={`px-5 py-2 rounded-2xl justify-center ${selectedFilter === "all" ? "bg-white" : "bg-card-dark"
                }`}
            >
              <Text
                className={`font-bold text-xs ${selectedFilter === "all" ? "text-black" : "text-zinc-500"
                  }`}
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
                  className={`px-5 py-2 rounded-2xl justify-center ${isSelected ? "bg-white" : "bg-card-dark"
                    }`}
                >
                  <Text
                    className={`font-bold text-xs ${isSelected ? "text-black" : "text-zinc-500"
                      }`}
                  >
                    {cat.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Exercise List */}
        <Animated.FlatList
          data={filteredExercises}
          keyExtractor={(item) => item.id}
          itemLayoutAnimation={LinearTransition}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item, index }) => (
            <Animated.View
              entering={FadeInDown.delay(index * 50).springify()}
              layout={LinearTransition}
              className="mb-3"
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
                    <MaterialCommunityIcons
                      name="alpha-u-box"
                      size={16}
                      color={Colors.palette.electricBlue}
                      style={{ marginLeft: 6, opacity: 0.8 }}
                    />
                  )}
                </View>

                {/* Right: Badges */}
                <View className="flex-row items-center gap-3">
                  {/* Difficulty Dot */}
                  <View className="flex-row items-center gap-1.5">
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor:
                          DifficultyColors[item.difficulty as keyof typeof DifficultyColors] ||
                          Colors.palette.stone,
                      }}
                    />
                  </View>

                  {/* Category Pill */}
                  <View
                    className="px-2 py-1 rounded-md"
                    style={{
                      backgroundColor: getCategoryColor(item.category.slug),
                    }}
                  >
                    <Text
                      className="text-[10px] font-bold text-white uppercase tracking-wider"
                      numberOfLines={1}
                    >
                      {item.category.name}
                    </Text>
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          )}
        />
      </View>

      <ExerciseDetailSheet
        visible={!!selectedExercise}
        exercise={selectedExercise}
        onClose={() => setSelectedExercise(null)}
      />
    </SafeAreaView>
  );
}
