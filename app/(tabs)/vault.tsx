import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Colors, { CategoryColors } from "@/constants/Colors";
import { ExerciseCategory } from "@/constants/Enums";
import { Exercise, getExercises } from "@/services/Database";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
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

const FILTERS = ["All", ...Object.values(ExerciseCategory)];

export default function VaultScreen() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const loadData = async () => {
    const data = await getExercises();
    data.sort((a, b) => a.name.localeCompare(b.name));
    setExercises(data);
  };

  const filteredExercises = exercises.filter((ex) => {
    const matchesFilter =
      selectedFilter === "All" ||
      ex.category.toUpperCase() === selectedFilter.toUpperCase();
    const matchesSearch = ex.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    return (
      CategoryColors[category as keyof typeof CategoryColors] ||
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
          <Button
            variant="primary"
            size="sm"
            icon="plus"
            iconColor="white"
            onPress={() => router.push("/add-exercise")}
          />
        </View>

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
            {FILTERS.map((filter) => {
              const isSelected = selectedFilter === filter;
              return (
                <Pressable
                  key={filter}
                  onPress={() => setSelectedFilter(filter)}
                  className={`px-5 py-2 rounded-2xl justify-center ${
                    isSelected ? "bg-white" : "bg-card-dark"
                  }`}
                >
                  <Text
                    className={`font-bold text-xs ${
                      isSelected ? "text-black" : "text-zinc-500"
                    }`}
                  >
                    {filter}
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
              className="bg-card-dark rounded-2xl p-5 mb-3 flex-row justify-between items-center"
            >
              <View className="flex-1 bg-transparent flex-row items-center">
                <Text className="text-sm font-bold text-white">
                  {item.name}
                </Text>
                {item.is_unilateral && (
                  <MaterialCommunityIcons
                    name="alpha-u-box"
                    size={16}
                    color={Colors.palette.blue500}
                    style={{ marginLeft: 6 }}
                  />
                )}
              </View>

              <View className="flex-row items-center bg-transparent">
                <Text className="text-[10px] font-bold text-green-500 mr-2">
                  {item.difficulty}
                </Text>
                <Text
                  className="text-[10px] font-bold uppercase"
                  style={{ color: getCategoryColor(item.category) }}
                >
                  {" "}
                  {item.category}
                </Text>
              </View>
            </Animated.View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
