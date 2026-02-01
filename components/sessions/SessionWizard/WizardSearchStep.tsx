import { Input } from "@/components/ui/Input";
import Colors from "@/constants/Colors";
import { Exercise } from "@/constants/Types";
import { Api } from "@/services/api";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
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
    const data = await Api.getExercises();
    data.sort((a, b) => a.name.localeCompare(b.name));
    setExercises(data);
  };

  const filtered = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(search.toLowerCase()),
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
              <View className="flex-row items-center">
                {/* Unilateral Icon - Blue Box U */}
                {item.is_unilateral && (
                  <MaterialCommunityIcons
                    name="alpha-u-box"
                    size={14}
                    color={Colors.palette.electricBlue}
                    style={{ marginRight: 6 }}
                  />
                )}
                <Text className="text-xs text-zinc-400 font-bold uppercase tracking-wide">
                  {item.category?.name} • {item.difficulty}
                </Text>
              </View>
            </View>
            <FontAwesome
              name="chevron-right"
              size={12}
              color={Colors.palette.silver}
            />
          </Pressable>
        )}
      />
    </WizardScreenWrapper>
  );
}
