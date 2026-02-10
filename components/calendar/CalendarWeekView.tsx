import React from "react";
import { WeekRow } from "./WeekRow";
import { View } from "react-native";

/** Height of week view container (h-28 + pb-4 = 112 + 16). Used for FAB/overlay positioning. */
export const CALENDAR_WEEK_VIEW_HEIGHT = 112 + 16; // 128

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
