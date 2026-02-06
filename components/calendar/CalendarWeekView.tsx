import React from "react";
import { WeekRow } from "./WeekRow";
import { View } from "react-native";

export interface CalendarWeekViewProps {
  mondayOfWeek: Date;
  selectedDateId: string;
  onDayPress: (dateId: string) => void;
  markedDates?: Record<string, { dots?: { color: string }[] }>;
}

export function CalendarWeekView({
  mondayOfWeek,
  selectedDateId,
  onDayPress,
  markedDates,
}: CalendarWeekViewProps) {
  return (
    <View className="w-full h-28 pb-4">
      <WeekRow
        mondayOfWeek={mondayOfWeek}
        selectedDateId={selectedDateId}
        onDayPress={onDayPress}
        markedDates={markedDates}
      />
    </View>
  );
}
