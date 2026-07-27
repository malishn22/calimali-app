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
  /** Tighter cell for the month picker popover. */
  compact?: boolean;
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
    compact = false,
  }: CalendarDayProps) => {
    const marking = markedDates?.[dateId];
    const dots = marking?.dots || [];

    return (
      <TouchableOpacity
        onPress={() => onPress(dateId)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        className={`items-center justify-start flex-1 ${
          compact ? "h-[38px]" : "h-[50px]"
        }`}
      >
        <View
          className={`${
            compact ? "w-7 h-7" : "w-8 h-8"
          } items-center justify-center mb-0.5 ${
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
