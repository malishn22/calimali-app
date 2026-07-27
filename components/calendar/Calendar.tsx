import { useCalendarContext } from "@/context/CalendarContext";
import { getMonday, getWeekLabel, toDateId } from "@/utilities/calendarUtils";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarWeekView } from "./CalendarWeekView";

interface CalendarProps {
  /** Opens the month picker sheet (owned by the screen). */
  onOpenCalendar?: () => void;
}

export function Calendar({ onOpenCalendar }: CalendarProps) {
  const { selectedDate, setSelectedDate, markedDates } = useCalendarContext();

  const selectedDateId = useMemo(() => toDateId(selectedDate), [selectedDate]);
  const todayId = useMemo(() => toDateId(new Date()), []);
  const isTodaySelected = selectedDateId === todayId;

  const [displayMonday, setDisplayMonday] = useState(() =>
    getMonday(new Date(selectedDate)),
  );

  // Sync the visible week when selectedDate changes — from a day press, Today,
  // or a pick in the month sheet.
  useEffect(() => {
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
    setDisplayMonday((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() - 7);
      return next;
    });
  }, []);

  const goNext = useCallback(() => {
    setDisplayMonday((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 7);
      return next;
    });
  }, []);

  const weekLabel = useMemo(
    () => getWeekLabel(displayMonday),
    [displayMonday],
  );

  return (
    <View className="bg-background-dark">
      <CalendarHeader
        weekLabel={weekLabel}
        onOpenCalendar={onOpenCalendar}
        onPrevPress={goPrev}
        onNextPress={goNext}
        onTodayPress={handleTodayPress}
        isTodaySelected={isTodaySelected}
      />

      <CalendarWeekView
        mondayOfWeek={displayMonday}
        selectedDateId={selectedDateId}
        onDayPress={handleDayPress}
        markedDates={markedDates}
      />
    </View>
  );
}
