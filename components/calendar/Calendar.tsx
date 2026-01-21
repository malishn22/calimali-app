import { useCalendarContext } from "@/context/CalendarContext";
import {
  CalendarDayMetadata,
  CalendarMonth,
  toDateId,
  useCalendar,
  useCalendarList,
} from "@marceloterreiro/flash-calendar";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface CalendarProps {
  viewMode: "Week" | "Month";
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const dayHeight = 50;

// --- Cached Day Component (The "Silver Bullet") ---
// We use a custom equality function to prevent re-renders when the "object reference" changes
// but the actual data (ID, State, Selection) has not.
const CachedDay = React.memo(
  ({
    metadata,
    onPress,
    isSelected,
    isToday,
    markedDates,
  }: {
    metadata: CalendarDayMetadata;
    onPress: (dateId: string) => void;
    isSelected: boolean;
    isToday: boolean;
    markedDates?: Record<string, any>;
  }) => {
    const dateId = metadata.id;
    const marking = markedDates?.[dateId];
    const dots = marking?.dots || [];
    const isDisabled = metadata.state === "disabled";

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
                  : isDisabled
                    ? "text-zinc-700"
                    : "text-white"
            }`}
          >
            {metadata.displayLabel}
          </Text>
        </View>

        {/* Dots Container */}
        <View className="flex-row flex-wrap justify-center gap-0.5 w-[24px]">
          {dots.map((dot: any, index: number) => (
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
  // Custom Comparison Function
  (prev, next) => {
    return (
      prev.metadata.id === next.metadata.id &&
      prev.metadata.state === next.metadata.state &&
      prev.isSelected === next.isSelected &&
      prev.isToday === next.isToday &&
      prev.markedDates === next.markedDates // Reference equality is sufficient here due to Context usage
    );
  },
);

// --- Month Component ---
// This component renders a single month's grid
const MonthItem = React.memo(
  ({
    calendarMonthId,
    onDayPress,
    markedDates,
    selectedDateId,
  }: {
    calendarMonthId: string;
    onDayPress: (dateId: string) => void;
    markedDates?: Record<string, any>;
    selectedDateId: string;
  }) => {
    const { weeksList, calendarRowMonth, weekDaysList } = useCalendar({
      calendarMonthId,
      calendarFirstDayOfWeek: "monday",
    });

    return (
      <View
        className="mb-4"
        style={{ width: SCREEN_WIDTH, paddingHorizontal: 16 }}
      >
        {/* Month Header */}
        <View className="h-[30px] justify-center items-center mb-2">
          <Text className="text-white font-bold text-lg capitalize font-inter-700">
            {calendarRowMonth}
          </Text>
        </View>

        {/* Week Days Header */}
        <View className="flex-row justify-between mb-2">
          {weekDaysList.map((day, index) => (
            <View key={index} className="flex-1 items-center">
              <Text className="text-zinc-500 text-xs font-inter-500">
                {day}
              </Text>
            </View>
          ))}
        </View>

        {/* Weeks Rows */}
        <View className="gap-2">
          {weeksList.map((week, weekIndex) => (
            <View key={weekIndex} className="flex-row justify-between">
              {week.map((dayMetadata) => {
                if (dayMetadata.isDifferentMonth) {
                  // Render empty placeholder or spacer
                  return (
                    <View key={dayMetadata.id} className="flex-1 h-[50px]" />
                  );
                }
                const isSelected = dayMetadata.id === selectedDateId;
                const isToday = dayMetadata.isToday;

                return (
                  <CachedDay
                    key={dayMetadata.id}
                    metadata={dayMetadata}
                    onPress={onDayPress}
                    isSelected={isSelected}
                    isToday={isToday}
                    markedDates={markedDates}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </View>
    );
  },
);

// --- Week View Component ---
// Renders only the week relevant to the selected date
// --- Week Page Component ---
const WeekPage = React.memo(
  ({
    startDate,
    onDayPress,
    selectedDateId,
    markedDates,
  }: {
    startDate: Date;
    onDayPress: (id: string) => void;
    selectedDateId: string;
    markedDates?: Record<string, any>;
  }) => {
    const weekDays = useMemo(() => {
      const days = [];
      const current = new Date(startDate);
      // Ensure we start from Monday (if that's the desired start)
      // FlashCalendar default is Sunday usually, but code above used 'monday'.
      // Native getDay(): 0=Sun, 1=Mon.
      // Adjust start date to Monday if needed, but assuming startDate passed IS the start.

      for (let i = 0; i < 7; i++) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      return days;
    }, [startDate]);

    const weekDaysLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return (
      <View className="w-screen px-4">
        {/* Week Days Header */}
        <View className="flex-row justify-between mb-2">
          {weekDaysLabels.map((day, index) => (
            <View key={index} className="flex-1 items-center">
              <Text className="text-zinc-500 text-xs font-inter-500">
                {day}
              </Text>
            </View>
          ))}
        </View>
        <View className="flex-row justify-between">
          {weekDays.map((date) => {
            const id = toDateId(date);
            // Mock metadata for CachedDay
            const metadata: CalendarDayMetadata = {
              id: id,
              date: date,
              isToday: toDateId(new Date()) === id,
              isDifferentMonth: false,
              state: "idle",
              displayLabel: String(date.getDate()),
              isWeekend: date.getDay() === 0 || date.getDay() === 6,
              isStartOfWeek: date.getDay() === 1,
              isEndOfWeek: date.getDay() === 0,
              isStartOfMonth: date.getDate() === 1,
              isEndOfMonth:
                new Date(
                  date.getFullYear(),
                  date.getMonth() + 1,
                  0,
                ).getDate() === date.getDate(),
              isDisabled: false,
              isStartOfRange: false,
              isEndOfRange: false,
              isRangeValid: false,
            };

            const isSelected = id === selectedDateId;

            return (
              <CachedDay
                key={id}
                metadata={metadata}
                onPress={onDayPress}
                isSelected={isSelected}
                isToday={metadata.isToday}
                markedDates={markedDates}
              />
            );
          })}
        </View>
      </View>
    );
  },
);

// --- Week View Component ---
const WeekView = React.memo(
  ({
    selectedDate,
    selectedDateId,
    onDayPress,
    markedDates,
    scrollTrigger,
  }: {
    selectedDate: Date;
    selectedDateId: string;
    onDayPress: (id: string) => void;
    markedDates?: Record<string, any>;
    scrollTrigger: number;
  }) => {
    const SCREEN_WIDTH = Dimensions.get("window").width;
    const INITIAL_RANGE = 12; // +/- 12 weeks (~3 months)

    // Helper to generate weeks
    const generateWeeks = useCallback((centerDate: Date, range: number) => {
      const weeks = [];
      const getMonday = (d: Date) => {
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
      };
      const centerMonday = getMonday(new Date(centerDate));

      for (let i = -range; i <= range; i++) {
        const w = new Date(centerMonday);
        w.setDate(w.getDate() + i * 7);
        weeks.push(w);
      }
      return weeks;
    }, []);

    // State for Dynamic List
    const [weeksList, setWeeksList] = useState<Date[]>([]);

    // Initialize list once
    useEffect(() => {
      setWeeksList(generateWeeks(new Date(selectedDateId), INITIAL_RANGE));
    }, []);

    const appendWeeks = useCallback(() => {
      setWeeksList((prev) => {
        const lastWeek = prev[prev.length - 1];
        const newWeeks = [];
        for (let i = 1; i <= 12; i++) {
          const w = new Date(lastWeek);
          w.setDate(w.setDate(w.getDate() + i * 7));
          newWeeks.push(w);
        }
        return [...prev, ...newWeeks];
      });
    }, []);

    const [listKey, setListKey] = useState(0);

    // Ref for FlashList
    const listRef = useRef<FlashListRef<Date>>(null);

    // Scroll Logic
    useEffect(() => {
      if (weeksList.length === 0) return;

      const selDate = new Date(selectedDateId);
      const index = weeksList.findIndex((startOfWeek) => {
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        const s = new Date(startOfWeek).setHours(0, 0, 0, 0);
        const e = new Date(endOfWeek).setHours(23, 59, 59, 999);
        const target = selDate.setHours(12, 0, 0, 0);
        return target >= s && target <= e;
      });

      if (index !== -1 && listRef.current) {
        // Normal navigation: Smooth scroll
        listRef.current.scrollToIndex({ index, animated: true });
      } else if (index === -1) {
        // Jump navigation: Remount list centered on target
        setWeeksList(generateWeeks(new Date(selectedDateId), INITIAL_RANGE));
        setListKey((prev) => prev + 1);
      }
    }, [selectedDateId, weeksList, scrollTrigger]);

    const renderItem = useCallback(
      ({ item }: { item: Date }) => {
        return (
          <WeekPage
            startDate={item}
            onDayPress={onDayPress}
            selectedDateId={selectedDateId}
            markedDates={markedDates}
          />
        );
      },
      [onDayPress, selectedDateId, markedDates],
    );

    return (
      <View className="w-full h-28">
        <FlashList
          key={listKey}
          ref={listRef}
          data={weeksList}
          renderItem={renderItem}
          keyExtractor={(item) => toDateId(item)}
          horizontal
          snapToInterval={SCREEN_WIDTH}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum
          initialScrollIndex={12}
          onEndReached={appendWeeks}
          onEndReachedThreshold={0.5}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    );
  },
);

export function Calendar({ viewMode }: { viewMode: "Week" | "Month" }) {
  // Access Data & State from Context
  const { selectedDate, setSelectedDate, markedDates } = useCalendarContext();
  const [scrollTrigger, setScrollTrigger] = useState(0);

  const selectedDateId = useMemo(() => toDateId(selectedDate), [selectedDate]);

  const handleDayPress = useCallback(
    (dateId: string) => {
      const [year, month, day] = dateId.split("-").map(Number);
      const newDate = new Date(year, month - 1, day);
      setSelectedDate(newDate);
    },
    [setSelectedDate],
  );

  // --- Month View Logic: Infinite Scroll ---
  // Fix: Initialize only once to prevent list regeneration on every click
  const [initialDateId] = useState(() => toDateId(selectedDate));

  const { monthList, initialMonthIndex, appendMonths, prependMonths } =
    useCalendarList({
      calendarInitialMonthId: initialDateId,
      calendarPastScrollRangeInMonths: 1,
      calendarFutureScrollRangeInMonths: 1,
      calendarFirstDayOfWeek: "monday",
    });

  const monthListRef = useRef<FlashListRef<CalendarMonth>>(null);

  // Scroll Month List when selectedDate changes (e.g. Today button)
  useEffect(() => {
    if (viewMode === "Month" && monthListRef.current) {
      const targetMonthId = toDateId(
        new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
      );
      const index = monthList.findIndex((m) => m.id === targetMonthId);
      if (index !== -1) {
        monthListRef.current.scrollToIndex({ index, animated: true });
      }
    }
  }, [selectedDate, viewMode, scrollTrigger]);

  const renderMonthItem = useCallback(
    ({ item }: { item: CalendarMonth }) => {
      return (
        <MonthItem
          calendarMonthId={item.id}
          onDayPress={handleDayPress}
          markedDates={markedDates}
          selectedDateId={selectedDateId}
        />
      );
    },
    [handleDayPress, markedDates, selectedDateId],
  );

  // Handle Today Press
  const handleTodayPress = () => {
    setSelectedDate(new Date());
    setScrollTrigger((prev) => prev + 1);
  };

  return (
    <View className="bg-background-dark">
      <View className="flex-row justify-end px-4 py-2">
        <Pressable
          onPress={handleTodayPress}
          className="bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-700"
        >
          <Text className="text-white font-bold text-xs text-blue-500 uppercase">
            Today
          </Text>
        </Pressable>
      </View>

      {viewMode === "Month" ? (
        <View className="h-[350px]">
          <FlashList
            ref={monthListRef}
            data={monthList}
            renderItem={renderMonthItem}
            keyExtractor={(item) => item.id}
            initialScrollIndex={initialMonthIndex}
            onEndReached={() => appendMonths(12)}
            onEndReachedThreshold={0.5}
            showsHorizontalScrollIndicator={false}
            horizontal
            snapToInterval={SCREEN_WIDTH}
            snapToAlignment="start"
            decelerationRate="fast"
            disableIntervalMomentum
          />
        </View>
      ) : (
        <View className="h-auto pb-4">
          <WeekView
            selectedDate={selectedDate}
            selectedDateId={selectedDateId}
            onDayPress={handleDayPress}
            markedDates={markedDates}
            scrollTrigger={scrollTrigger}
          />
        </View>
      )}
    </View>
  );
}
