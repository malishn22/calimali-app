import { Text, View } from "@/components/Themed";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors, { CategoryColors } from "@/constants/Colors";
import { ExerciseCategory } from "@/constants/Enums";
import { Exercise, getExercises } from "@/services/Database";
import { useEffect } from "react";

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
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Vault</Text>
          <Pressable style={styles.addBtn}>
            <FontAwesome name="plus" size={16} color={Colors.palette.white} />
          </Pressable>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <FontAwesome
            name="search"
            size={16}
            color={Colors.palette.zinc600}
            style={{ marginRight: 10 }}
          />
          <TextInput
            placeholder="Search movements..."
            placeholderTextColor={Colors.palette.zinc600}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Tags */}
        <View style={styles.filterRow}>
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
                  style={[
                    styles.filterTag,
                    isSelected && styles.filterTagSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      isSelected && styles.filterTextSelected,
                    ]}
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
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.exerciseCard}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: "transparent",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text style={styles.exerciseName}>{item.name}</Text>
                {item.is_unilateral && (
                  <MaterialCommunityIcons
                    name="alpha-u-box"
                    size={16}
                    color={Colors.palette.blue500}
                    style={{ marginLeft: 6 }}
                  />
                )}
              </View>

              <View
                style={[
                  styles.exerciseMeta,
                  { backgroundColor: "transparent" },
                ]}
              >
                <Text style={styles.difficultyText}>{item.difficulty}</Text>
                <Text
                  style={[
                    styles.typeText,
                    { color: getCategoryColor(item.category) },
                  ]}
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    backgroundColor: Colors.dark.background,
  },
  container: {
    flex: 1,
    padding: 24,
    paddingBottom: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.palette.blue500,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    color: Colors.palette.white,
    fontSize: 14,
  },
  filterRow: {
    flexDirection: "row",
    marginBottom: 24,
    height: 40,
  },
  filterTag: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.dark.card,
    justifyContent: "center",
  },
  filterTagSelected: {
    backgroundColor: Colors.palette.white,
  },
  filterText: {
    color: Colors.palette.zinc500,
    fontWeight: "700",
    fontSize: 12,
  },
  filterTextSelected: {
    color: Colors.palette.black,
  },
  listContent: {
    paddingBottom: 20,
  },
  exerciseCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.palette.white,
  },
  exerciseMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.palette.green500,
    marginRight: 8,
  },
  typeText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  unilteralLabel: {
    fontSize: 8,
    color: Colors.palette.zinc500,
    fontWeight: "700",
    marginTop: 2,
  },
});
