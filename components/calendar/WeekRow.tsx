import React from "react";
import { Text, View } from "react-native";
import { CalendarDay } from "./CalendarDay";
import { getWeekDates, toDateId } from "@/utilities/calendarUtils";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export interface WeekRowProps {
  mondayOfWeek: Date;
  selectedDateId: string;
  onDayPress: (dateId: string) => void;
  markedDates?: Record<string, { dots?: { color: string }[] }>;
}

export const WeekRow = React.memo(
  ({
    mondayOfWeek,
    selectedDateId,
    onDayPress,
    markedDates,
  }: WeekRowProps) => {
    const dates = React.useMemo(
      () => getWeekDates(mondayOfWeek),
      [mondayOfWeek.getTime()],
    );
    const todayId = toDateId(new Date());

    return (
      <View className="px-4" style={{ width: "100%" }}>
        <View className="flex-row justify-between mb-2 h-6">
          {WEEK_DAYS.map((day, index) => (
            <View key={index} className="flex-1 items-center justify-center">
              <Text className="text-zinc-500 text-xs font-inter-500">
                {day}
              </Text>
            </View>
          ))}
        </View>
        <View className="flex-row justify-between">
          {dates.map((date) => {
            const id = toDateId(date);
            return (
              <CalendarDay
                key={id}
                dateId={id}
                displayLabel={String(date.getDate())}
                onPress={onDayPress}
                isSelected={id === selectedDateId}
                isToday={id === todayId}
                markedDates={markedDates}
              />
            );
          })}
        </View>
      </View>
    );
  },
);
