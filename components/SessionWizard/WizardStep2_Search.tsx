import Colors, { CategoryColors } from "@/constants/Colors";
import { Exercise, getExercises } from "@/services/Database";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { Input } from "../ui/Input";

interface Props {
  onSelect: (ex: Exercise) => void;
}

export function WizardStep2_Search({ onSelect }: Props) {
  const [search, setSearch] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await getExercises();
    setExercises(data);
  };

  const filtered = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View className="flex-1">
      <Text className="text-3xl font-extrabold text-white mb-6">
        Select Movement
      </Text>

      <Input
        placeholder="Search exercises..."
        icon="search"
        value={search}
        onChangeText={setSearch}
        autoFocus
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            className="flex-row justify-between items-center bg-card-dark p-5 rounded-2xl mb-3 border border-zinc-800 active:bg-zinc-800"
            onPress={() => onSelect(item)}
          >
            <View className="flex-1 mr-4">
              <Text className="text-white font-bold text-base mb-1">
                {item.name}
              </Text>
              <View className="flex-row items-center">
                <Text className="text-[10px] text-green-500 font-bold mr-2 uppercase">
                  {item.difficulty}
                </Text>
                {item.is_unilateral && (
                  <MaterialCommunityIcons
                    name="alpha-u-box"
                    size={14}
                    color={Colors.palette.blue500}
                  />
                )}
              </View>
            </View>
            <Text
              className="text-[10px] font-bold uppercase"
              style={{
                color:
                  CategoryColors[
                    item.category as keyof typeof CategoryColors
                  ] || CategoryColors.OTHER,
              }}
            >
              {item.category}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}
