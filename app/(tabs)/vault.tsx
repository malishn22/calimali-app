import Colors, { CategoryColors } from "@/constants/Colors";
import { ExerciseCategory } from "@/constants/Enums";
import { Exercise, getExercises } from "@/services/Database";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FILTERS = ["All", ...Object.values(ExerciseCategory)];

export default function VaultScreen() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getExercises();
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
      edges={["top"]}
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      <View className="flex-1 p-6 pb-0">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-3xl font-extrabold text-white">Vault</Text>
          <Pressable className="w-8 h-8 rounded-full bg-blue-500 items-center justify-center">
            <FontAwesome name="plus" size={16} color={Colors.palette.white} />
          </Pressable>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-card-dark rounded-xl px-4 py-3 mb-5">
          <FontAwesome
            name="search"
            size={16}
            color={Colors.palette.zinc600}
            style={{ marginRight: 10 }}
          />
          <TextInput
            placeholder="Search movements..."
            placeholderTextColor={Colors.palette.zinc600}
            className="flex-1 text-white text-sm"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

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
        <FlatList
          data={filteredExercises}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View className="bg-card-dark rounded-2xl p-5 mb-3 flex-row justify-between items-center">
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
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
