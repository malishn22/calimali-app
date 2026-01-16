import Colors from "@/constants/Colors";
import { SessionExercise } from "@/services/Database";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { FlatList, Text, View } from "react-native";
import { Button } from "../ui/Button";

interface Props {
  exercises: SessionExercise[];
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export function WizardStep1_List({ exercises, onAdd, onRemove }: Props) {
  return (
    <View className="flex-1">
      <Text className="text-3xl font-extrabold text-white mb-2">
        Build Session
      </Text>
      <Text className="text-zinc-400 mb-8 font-semibold">
        Add exercises to your daily plan.
      </Text>

      {/* Add Button */}
      <Button
        variant="secondary"
        title="Add Movement"
        icon="plus"
        onPress={onAdd}
        className="mb-6 bg-zinc-800"
      />

      {/* List */}
      <FlatList
        data={exercises}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <View className="flex-row items-center justify-between bg-card-dark p-4 rounded-2xl mb-3 border border-zinc-800">
            <View>
              <Text className="text-white font-bold text-base mb-1">
                {item.name}
              </Text>
              <Text className="text-zinc-400 text-xs font-semibold">
                {item.sets} Sets × {item.reps} Reps
              </Text>
            </View>
            <Button
              variant="ghost"
              size="sm"
              icon="trash"
              onPress={() => onRemove(index)}
              className="px-0"
            />
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-20 opacity-50">
            <FontAwesome
              name="clipboard"
              size={48}
              color={Colors.palette.zinc600}
            />
            <Text className="text-zinc-500 mt-4 font-bold">
              No exercises yet
            </Text>
          </View>
        }
      />
    </View>
  );
}
