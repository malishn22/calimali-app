import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

const toggleStyle = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 } as const,
  shadowOpacity: 0.2,
  shadowRadius: 3,
  elevation: 3,
};

export interface CalendarHeaderProps {
  viewMode: "Week" | "Month";
  displayMonthLabel?: string;
  onViewModeChange?: (mode: "Week" | "Month") => void;
  onPrevPress: () => void;
  onNextPress: () => void;
  onTodayPress: () => void;
  isTodaySelected: boolean;
}

export function CalendarHeader({
  viewMode,
  displayMonthLabel,
  onViewModeChange,
  onPrevPress,
  onNextPress,
  onTodayPress,
  isTodaySelected,
}: CalendarHeaderProps) {
  return (
    <View
      className={`flex-row items-center px-4 py-3 gap-3 ${onViewModeChange ? "justify-between" : "justify-end"}`}
    >
      {onViewModeChange && (
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => onViewModeChange(viewMode === "Week" ? "Month" : "Week")}
            className="w-10 h-10 items-center justify-center rounded-xl border-2 border-zinc-600 bg-zinc-800 active:bg-zinc-700"
            style={toggleStyle}
          >
            <FontAwesome
              name={viewMode === "Week" ? "calendar" : "list"}
              size={18}
              color="#fff"
            />
          </Pressable>
          {viewMode === "Month" && displayMonthLabel && (
            <Text className="text-zinc-400 text-sm font-inter-500 capitalize">
              {displayMonthLabel}
            </Text>
          )}
        </View>
      )}
      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={onPrevPress}
          className="w-10 h-10 items-center justify-center rounded-full active:bg-zinc-800"
        >
          <FontAwesome name="chevron-left" size={16} color="#fff" />
        </Pressable>
        <Pressable
          onPress={onTodayPress}
          className={
            isTodaySelected
              ? "min-w-[72px] px-4 py-2 rounded-xl items-center justify-center border-2 border-transparent bg-transparent"
              : "min-w-[72px] px-4 py-2 rounded-xl items-center justify-center border-2 border-blue-500/40 bg-zinc-800 active:border-blue-500/60 active:bg-zinc-700"
          }
          style={isTodaySelected ? undefined : toggleStyle}
        >
          <Text
            className={`font-bold tracking-wide text-[10px] ${
              isTodaySelected ? "text-zinc-500" : "text-blue-400"
            }`}
          >
            Today
          </Text>
        </Pressable>
        <Pressable
          onPress={onNextPress}
          className="w-10 h-10 items-center justify-center rounded-full active:bg-zinc-800"
        >
          <FontAwesome name="chevron-right" size={16} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}
