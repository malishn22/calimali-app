import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export interface CalendarDayProps {
  dateId: string;
  displayLabel: string;
  onPress: (dateId: string) => void;
  isSelected: boolean;
  isToday: boolean;
  isDifferentMonth?: boolean;
  markedDates?: Record<string, { dots?: { color: string }[] }>;
}

export const CalendarDay = React.memo(
  ({
    dateId,
    displayLabel,
    onPress,
    isSelected,
    isToday,
    isDifferentMonth = false,
    markedDates,
  }: CalendarDayProps) => {
    const marking = markedDates?.[dateId];
    const dots = marking?.dots || [];

    return (
      <TouchableOpacity
        onPress={() => onPress(dateId)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        className="items-center justify-start h-[50px] flex-1"
      >
        <View
          className={`w-8 h-8 items-center justify-center mb-0.5 ${
            isSelected ? "bg-blue-500 rounded-full" : ""
          }`}
        >
          <Text
            className={`text-sm font-bold ${
              isSelected
                ? "text-white"
                : isToday
                  ? "text-blue-500"
                  : isDifferentMonth
                    ? "text-zinc-700"
                    : "text-white"
            }`}
          >
            {displayLabel}
          </Text>
        </View>

        <View className="flex-row flex-wrap justify-center gap-0.5 w-[24px]">
          {dots.map((dot, index) => (
            <View
              key={index}
              style={{ backgroundColor: dot.color }}
              className="w-1.5 h-1.5 rounded-full"
            />
          ))}
        </View>
      </TouchableOpacity>
    );
  },
);
