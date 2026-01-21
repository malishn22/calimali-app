import Colors from "@/constants/Colors";
import { SessionHistory } from "@/constants/Types";
import { Feather } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Text, View } from "react-native";

interface SessionDetailSheetProps {
  visible: boolean;
  session: SessionHistory | null;
  onClose: () => void;
}

export default function SessionDetailSheet({
  visible,
  session,
  onClose,
}: SessionDetailSheetProps) {
  // Ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // Variables
  const snapPoints = useMemo(() => ["85%"], []);

  // Effects
  useEffect(() => {
    if (visible && session) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [visible, session]);

  // Callbacks
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose],
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.7}
      />
    ),
    [],
  );

  if (!session) return null;

  // Parsing Data
  let parsedData: any = {};
  if (session?.performance_data) {
    try {
      parsedData =
        typeof session.performance_data === "string"
          ? JSON.parse(session.performance_data)
          : session.performance_data;
    } catch (e) {
      parsedData = {};
    }
  }

  const date = new Date(session.date).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const duration = parsedData.elapsedTime
    ? Math.floor(parsedData.elapsedTime / 60) +
      "m " +
      (parsedData.elapsedTime % 60) +
      "s"
    : "-";

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: "#1c1c1e" }}
      handleIndicatorStyle={{ backgroundColor: "#3f3f46" }}
    >
      <BottomSheetView className="flex-1 bg-card-dark">
        {/* Header */}
        <View className="px-6 pb-4 border-b border-zinc-800 flex-row justify-between items-start">
          <View>
            <Text className="text-zinc-400 font-bold text-xs uppercase tracking-wider mb-1">
              SESSION DETAILS
            </Text>
            <Text className="text-2xl font-bold text-white mb-1">
              Workout Session
            </Text>
            <Text className="text-zinc-500 text-sm font-semibold">{date}</Text>
          </View>
        </View>

        {/* Stats Bar */}
        <View className="flex-row border-b border-zinc-800">
          <View className="flex-1 p-4 items-center border-r border-zinc-800">
            <Feather
              name="clock"
              size={14}
              color={Colors.palette.blue500}
              style={{ marginBottom: 4 }}
            />
            <Text className="text-white font-bold">{duration}</Text>
            <Text className="text-[10px] text-zinc-500 font-bold uppercase">
              Duration
            </Text>
          </View>
          <View className="flex-1 p-4 items-center">
            <Feather
              name="layers"
              size={14}
              color={Colors.palette.green500}
              style={{ marginBottom: 4 }}
            />
            <Text className="text-white font-bold">
              {parsedData?.exercises?.length || 0}
            </Text>
            <Text className="text-[10px] text-zinc-500 font-bold uppercase">
              Exercises
            </Text>
          </View>
        </View>

        {/* Exercises List (Scrollable) */}
        <BottomSheetScrollView contentContainerStyle={{ padding: 24 }}>
          {parsedData?.exercises?.map((ex: any, idx: number) => (
            <View key={idx} className="mb-6">
              <Text className="text-lg font-bold text-white mb-3">
                {ex.name}
              </Text>
              <View className="bg-zinc-900 rounded-xl overflow-hidden">
                <View className="flex-row bg-zinc-800/50 p-2 border-b border-zinc-800">
                  <Text className="flex-1 text-center text-zinc-500 font-bold text-[10px] uppercase">
                    Set
                  </Text>
                  <Text className="flex-1 text-center text-zinc-500 font-bold text-[10px] uppercase">
                    Reps
                  </Text>
                  <Text className="flex-1 text-center text-zinc-500 font-bold text-[10px] uppercase">
                    Weight
                  </Text>
                </View>
                {Array.isArray(ex.reps) ? (
                  ex.reps.map((r: number, sIdx: number) => (
                    <View
                      key={sIdx}
                      className="flex-row p-3 border-b border-zinc-800/50"
                    >
                      <Text className="flex-1 text-center text-zinc-400 font-bold text-xs">
                        {sIdx + 1}
                      </Text>
                      <Text className="flex-1 text-center text-white font-bold text-xs">
                        {r}
                      </Text>
                      <Text className="flex-1 text-center text-zinc-400 font-bold text-xs">
                        -
                      </Text>
                    </View>
                  ))
                ) : (
                  <View className="p-3">
                    <Text className="text-zinc-500 text-xs italic text-center">
                      {ex.sets} Sets x {ex.reps} Reps
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
          <View className="h-10" />
        </BottomSheetScrollView>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
