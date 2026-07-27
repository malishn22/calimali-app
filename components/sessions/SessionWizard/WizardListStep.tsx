import { Button } from "@/components/ui/Button";
import { MoreMenuButton } from "@/components/ui/MoreMenuButton";
import { SideActionButton } from "@/components/ui/SideActionButton";
import Colors from "@/constants/Colors";
import { FAB_CONTENT_CLEARANCE } from "@/constants/Layout";
import { UnilateralIndicator } from "@/components/ui/UnilateralIndicator";
import { WizardHeader } from "@/components/ui/WizardHeader";
import { SessionExercise } from "@/constants/Types";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { parseRoutineClipboard } from "./index";
import { Text, TouchableOpacity, View } from "react-native";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { WizardScreenWrapper } from "./WizardScreenWrapper";

interface Props {
  exercises: SessionExercise[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onEdit: (index: number) => void;
  onReorder: (data: SessionExercise[]) => void;
  onCopyRoutine: () => void | Promise<void>;
  onPasteRoutine: () => void | Promise<void>;
}

export function WizardListStep({
  exercises,
  onAdd,
  onRemove,
  onEdit,
  onReorder,
  onCopyRoutine,
  onPasteRoutine,
}: Props) {
  const [pasteDisabled, setPasteDisabled] = useState(true);

  const checkClipboard = async () => {
    const text = await Clipboard.getStringAsync();
    setPasteDisabled(!text?.trim() || !parseRoutineClipboard(text));
  };

  const renderItem = ({
    item,
    drag,
    isActive,
    getIndex,
  }: RenderItemParams<SessionExercise>) => {
    const index = getIndex()!;
    const setText = `${item.sets} SETS`;

    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          activeOpacity={0.7}
          style={isActive ? { elevation: 8, shadowOpacity: 0.3, shadowRadius: 8 } : undefined}
          className={`flex-row items-center justify-between bg-zinc-800 p-4 rounded-2xl mb-3 ${isActive ? "opacity-90" : ""}`}
        >
          <View className="flex-row items-center flex-1">
            <View className="mr-3 justify-center">
              <Text className="text-zinc-500 text-base">☰</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white font-extrabold text-lg mb-1">
                {item.name}
              </Text>
              <View className="flex-row items-center">
                {item.isUnilateral && (
                  <UnilateralIndicator variant="inline" size={14} className="mr-1.5" />
                )}
                <Text className="text-blue-500 text-xs font-bold tracking-widest">
                  {setText}
                </Text>
              </View>
            </View>
          </View>
          <View className="flex-row gap-3">
            <Button
              variant="secondary"
              size="sm"
              icon="pencil"
              onPress={() => onEdit(index)}
              className="w-10 h-10 rounded-full bg-zinc-800"
              iconColor={Colors.palette.electricBlue}
            />
            <Button
              variant="secondary"
              size="sm"
              icon="trash"
              onPress={() => onRemove(index)}
              className="w-10 h-10 rounded-full bg-zinc-800/50"
              iconColor={Colors.palette.crimsonRed}
            />
          </View>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  return (
    <View className="flex-1">
      <WizardScreenWrapper className="flex-1">
        <WizardHeader
          title="Plan Routine"
          className="mb-4"
          rightAccessory={
            <MoreMenuButton
              onOpen={checkClipboard}
              menuItems={[
                { id: "copy-routine", label: "Copy", onPress: onCopyRoutine },
                { id: "paste-routine", label: "Paste", onPress: onPasteRoutine, disabled: pasteDisabled },
              ]}
            />
          }
        />

        <DraggableFlatList
          data={exercises}
          keyExtractor={(item, i) => `${item.exerciseId}-${i}`}
          renderItem={renderItem}
          onDragEnd={({ data }) => onReorder(data)}
          onDragBegin={() =>
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: FAB_CONTENT_CLEARANCE,
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

      <SideActionButton onPress={onAdd} />
    </View>
  );
}
