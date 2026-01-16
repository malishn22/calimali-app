import Colors from "@/constants/Colors";
import { Exercise, getExercises } from "@/services/Database";
import { FontAwesome } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { Input } from "../ui/Input";
import { WizardScreenWrapper } from "./WizardScreenWrapper";

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
    const data = await getExercises();
    setExercises(data);
  };

  const filtered = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <WizardScreenWrapper>
      <View className="items-center py-4 mb-4">
        <Text className="text-xl font-bold text-white">Search Movement</Text>
      </View>

      <View className="mb-4">
        <Input
          placeholder="Find movement..."
          icon="search"
          value={search}
          onChangeText={setSearch}
          // Custom styling to match design (darker bg, blue accent)
          inputContainerClassName="bg-zinc-900 border border-zinc-700"
          className="text-lg"
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            className="flex-row justify-between items-center bg-zinc-800 p-5 rounded-2xl mb-3 active:bg-zinc-700"
            onPress={() => onSelect(item)}
          >
            <View className="flex-1 mr-4">
              <Text className="text-white font-bold text-base mb-1">
                {item.name}
              </Text>
              <Text className="text-xs text-zinc-500 font-bold uppercase tracking-wide">
                {item.category} • {item.difficulty}
              </Text>
            </View>
            <FontAwesome
              name="chevron-right"
              size={12}
              color={Colors.palette.zinc600}
            />
          </Pressable>
        )}
      />
    </WizardScreenWrapper>
  );
}
