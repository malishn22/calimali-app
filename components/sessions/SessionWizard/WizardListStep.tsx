import { Button } from "@/components/ui/Button";
import Colors from "@/constants/Colors";
import { SessionExercise } from "@/constants/Types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { FlatList, Text, View } from "react-native";
import { WizardScreenWrapper } from "./WizardScreenWrapper";

interface Props {
  exercises: SessionExercise[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onEdit: (index: number) => void;
}

export function WizardListStep({ exercises, onAdd, onRemove, onEdit }: Props) {
  return (
    <WizardScreenWrapper>
      <View className="items-center py-4 mb-2">
        <Text className="text-xl font-bold text-white">Plan Routine</Text>
      </View>

      {/* Add Button */}
      <Button
        variant="secondary"
        title="+ Add movement"
        onPress={onAdd}
        className="mb-8 bg-zinc-900 border border-zinc-800 h-14 rounded-2xl"
        style={
          {
            // Overriding default button inner padding causing center alignment issues if present
          }
        }
      />

      {/* List */}
      <FlatList
        data={exercises}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={{ flexGrow: 1 }}
        renderItem={({ item, index }) => {
          // Mock category lookup since SessionExercise might not have it directly if simply stored.
          // Assuming we might need to pass it or look it up. For now sticking to design.
          // If data is missing, we use placeholder.
          const setText = `${item.sets} SETS`;
          const catText = "PUSH"; // Placeholder as SessionExercise usually just has IDs/Name. We might need to enrich this data.

          return (
            <View className="flex-row items-center justify-between bg-zinc-800 p-4 rounded-2xl mb-3">
              <View>
                <Text className="text-white font-extrabold text-lg mb-1">
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
                  <Text className="text-blue-500 text-xs font-bold tracking-widest">
                    {setText}
                  </Text>
                </View>
              </View>
              <View className="flex-row gap-3">
                {/* Edit Button */}
                <Button
                  variant="secondary"
                  size="sm"
                  icon="pencil"
                  onPress={() => onEdit(index)}
                  className="w-10 h-10 rounded-full bg-zinc-800"
                  iconColor={Colors.palette.electricBlue}
                />
                {/* Delete Button */}
                <Button
                  variant="secondary"
                  size="sm"
                  icon="trash"
                  onPress={() => onRemove(index)}
                  className="w-10 h-10 rounded-full bg-zinc-800/50"
                  iconColor={Colors.palette.crimsonRed}
                />
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View className="items-center justify-center flex-1 mt-20">
            <Text className="text-zinc-400 font-bold tracking-widest text-xs uppercase">
              NO EXERCISES ADDED YET
            </Text>
          </View>
        }
      />
    </WizardScreenWrapper>
  );
}
