import React from "react";
import { View } from "react-native";
import { MonthGrid } from "./MonthGrid";

/** Height of the month grid (h-[350px]). Used for FAB/overlay positioning. */
export const CALENDAR_MONTH_VIEW_HEIGHT = 300;

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
    <View style={{ height: CALENDAR_MONTH_VIEW_HEIGHT }}>
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
