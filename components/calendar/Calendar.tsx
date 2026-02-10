import { useCalendarContext } from "@/context/CalendarContext";
import {
  getMonday,
  getMonthLabel,
  toDateId,
} from "@/utilities/calendarUtils";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarMonthView } from "./CalendarMonthView";
import { CalendarWeekView } from "./CalendarWeekView";

export { CALENDAR_HEADER_HEIGHT } from "./CalendarHeader";
export { CALENDAR_MONTH_VIEW_HEIGHT } from "./CalendarMonthView";
export { CALENDAR_WEEK_VIEW_HEIGHT } from "./CalendarWeekView";

interface CalendarProps {
  viewMode: "Week" | "Month";
  onViewModeChange?: (mode: "Week" | "Month") => void;
}

export function Calendar({ viewMode, onViewModeChange }: CalendarProps) {
  const { selectedDate, setSelectedDate, markedDates } = useCalendarContext();

  const selectedDateId = useMemo(() => toDateId(selectedDate), [selectedDate]);
  const todayId = useMemo(() => toDateId(new Date()), []);
  const isTodaySelected = selectedDateId === todayId;

  const [displayDate, setDisplayDate] = useState(() => ({
    year: selectedDate.getFullYear(),
    month: selectedDate.getMonth(),
  }));
  const [displayMonday, setDisplayMonday] = useState(() =>
    getMonday(new Date(selectedDate)),
  );

  // Sync display when selectedDate changes (day press or Today)
  useEffect(() => {
    const y = selectedDate.getFullYear();
    const m = selectedDate.getMonth();
    setDisplayDate({ year: y, month: m });
    setDisplayMonday(getMonday(new Date(selectedDate)));
  }, [selectedDate]);

  const handleDayPress = useCallback(
    (dateId: string) => {
      const [year, month, day] = dateId.split("-").map(Number);
      const newDate = new Date(year, month - 1, day);
      setSelectedDate(newDate);
    },
    [setSelectedDate],
  );

  const handleTodayPress = useCallback(() => {
    setSelectedDate(new Date());
  }, [setSelectedDate]);

  const goPrev = useCallback(() => {
    if (viewMode === "Month") {
      setDisplayDate((prev) =>
        prev.month === 0
          ? { year: prev.year - 1, month: 11 }
          : { year: prev.year, month: prev.month - 1 },
      );
    } else {
      setDisplayMonday((prev) => {
        const next = new Date(prev);
        next.setDate(next.getDate() - 7);
        return next;
      });
    }
  }, [viewMode]);

  const goNext = useCallback(() => {
    if (viewMode === "Month") {
      setDisplayDate((prev) =>
        prev.month === 11
          ? { year: prev.year + 1, month: 0 }
          : { year: prev.year, month: prev.month + 1 },
      );
    } else {
      setDisplayMonday((prev) => {
        const next = new Date(prev);
        next.setDate(next.getDate() + 7);
        return next;
      });
    }
  }, [viewMode]);

  const displayMonthLabel =
    viewMode === "Month"
      ? getMonthLabel(displayDate.year, displayDate.month)
      : undefined;

  return (
    <View className="bg-background-dark">
      <CalendarHeader
        viewMode={viewMode}
        displayMonthLabel={displayMonthLabel}
        onViewModeChange={onViewModeChange}
        onPrevPress={goPrev}
        onNextPress={goNext}
        onTodayPress={handleTodayPress}
        isTodaySelected={isTodaySelected}
      />

      {viewMode === "Month" ? (
        <CalendarMonthView
          year={displayDate.year}
          month={displayDate.month}
          selectedDateId={selectedDateId}
          onDayPress={handleDayPress}
          markedDates={markedDates}
        />
      ) : (
        <CalendarWeekView
          mondayOfWeek={displayMonday}
          selectedDateId={selectedDateId}
          onDayPress={handleDayPress}
          markedDates={markedDates}
        />
      )}
    </View>
  );
}
