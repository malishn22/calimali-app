import React from "react";
import { Text, View } from "react-native";
import { CalendarDay } from "./CalendarDay";
import {
  getMonthLabel,
  getMonthWeeks,
  toDateId,
  type DayCell,
} from "@/utilities/calendarUtils";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export interface MonthGridProps {
  year: number;
  month: number;
  selectedDateId: string;
  onDayPress: (dateId: string) => void;
  markedDates?: Record<string, { dots?: { color: string }[] }>;
  hideLabel?: boolean;
}

export const MonthGrid = React.memo(
  ({ year, month, selectedDateId, onDayPress, markedDates, hideLabel }: MonthGridProps) => {
    const weeks = React.useMemo(
      () => getMonthWeeks(year, month),
      [year, month],
    );
    const todayId = toDateId(new Date());

    return (
      <View className="px-4" style={{ width: "100%" }}>
        {!hideLabel && (
          <View className="h-[30px] justify-center items-center mb-2">
            <Text className="text-white font-bold text-lg capitalize font-inter-700">
              {getMonthLabel(year, month)}
            </Text>
          </View>
        )}

        <View className="flex-row justify-between mb-2 h-6">
          {WEEK_DAYS.map((day, index) => (
            <View key={index} className="flex-1 items-center justify-center">
              <Text className="text-zinc-500 text-xs font-inter-500">
                {day}
              </Text>
            </View>
          ))}
        </View>

        <View>
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} className="flex-row justify-between mb-2">
              {week.map((cell: DayCell) =>
              cell.isDifferentMonth ? (
                <View key={cell.id} className="flex-1 h-[50px]" />
              ) : (
                <CalendarDay
                  key={cell.id}
                  dateId={cell.id}
                  displayLabel={cell.displayLabel}
                  onPress={onDayPress}
                  isSelected={cell.id === selectedDateId}
                  isToday={cell.id === todayId}
                  markedDates={markedDates}
                />
              ),
            )}
            </View>
          ))}
        </View>
      </View>
    );
  },
);
