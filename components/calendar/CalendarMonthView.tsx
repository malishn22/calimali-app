import React from "react";
import { View } from "react-native";
import { MonthGrid } from "./MonthGrid";

export interface CalendarMonthViewProps {
  year: number;
  month: number;
  selectedDateId: string;
  onDayPress: (dateId: string) => void;
  markedDates?: Record<string, { dots?: { color: string }[] }>;
}

export function CalendarMonthView({
  year,
  month,
  selectedDateId,
  onDayPress,
  markedDates,
}: CalendarMonthViewProps) {
  return (
    <View className="h-[350px]">
      <MonthGrid
        year={year}
        month={month}
        selectedDateId={selectedDateId}
        onDayPress={onDayPress}
        markedDates={markedDates}
        hideLabel
      />
    </View>
  );
}
