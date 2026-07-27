import { FontAwesome } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import Animated, { Easing, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCalendarContext } from "@/context/CalendarContext";
import { getMonthLabel, toDateId } from "@/utilities/calendarUtils";
import { MonthGrid } from "./MonthGrid";

const DURATION_IN = 120;
const DURATION_OUT = 100;

const easeOutCubic = Easing.bezier(0.33, 1, 0.68, 1);

const scaleIn = () => {
  "worklet";
  const config = { duration: DURATION_IN, easing: easeOutCubic };
  return {
    initialValues: { opacity: 0, transform: [{ scale: 0 }] },
    animations: {
      opacity: withTiming(1, config),
      transform: [{ scale: withTiming(1, config) }],
    },
  };
};

const scaleOut = () => {
  "worklet";
  const config = { duration: DURATION_OUT, easing: easeOutCubic };
  return {
    initialValues: { opacity: 1, transform: [{ scale: 1 }] },
    animations: {
      opacity: withTiming(0, config),
      transform: [{ scale: withTiming(0, config) }],
    },
  };
};

/**
 * Vertical distance from the top of the Planner's safe area to just under the
 * calendar icon: pt-4 (16) + "Planner" title row (60) + the header's py-3 (12)
 * + the 40px button, plus a small gap.
 */
const ANCHOR_OFFSET = 16 + 60 + 12 + 40 + 8;

export interface CalendarPanelProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Month picker in a dropdown anchored under the Planner's calendar icon — the
 * same popover idiom as VaultFilterSheet. Picking a day points the Planner at
 * that date and closes; the inline week strip follows via `selectedDate`.
 */
export function CalendarPanel({ visible, onClose }: CalendarPanelProps) {
  const { selectedDate, setSelectedDate, markedDates } = useCalendarContext();
  const insets = useSafeAreaInsets();

  const selectedDateId = useMemo(() => toDateId(selectedDate), [selectedDate]);

  const [cursor, setCursor] = useState(() => ({
    year: selectedDate.getFullYear(),
    month: selectedDate.getMonth(),
  }));

  // Re-sync the month cursor each time the panel opens so it always lands on the
  // selected day's month. Keyed on `visible` only — resyncing on every
  // selectedDate change would fight the user browsing months while open.
  useEffect(() => {
    if (visible) {
      setCursor({
        year: selectedDate.getFullYear(),
        month: selectedDate.getMonth(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const goPrev = useCallback(() => {
    setCursor((prev) =>
      prev.month === 0
        ? { year: prev.year - 1, month: 11 }
        : { year: prev.year, month: prev.month - 1 },
    );
  }, []);

  const goNext = useCallback(() => {
    setCursor((prev) =>
      prev.month === 11
        ? { year: prev.year + 1, month: 0 }
        : { year: prev.year, month: prev.month + 1 },
    );
  }, []);

  const handleDayPress = useCallback(
    (dateId: string) => {
      const [year, month, day] = dateId.split("-").map(Number);
      setSelectedDate(new Date(year, month - 1, day));
      onClose();
    },
    [setSelectedDate, onClose],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {visible && (
        <Pressable
          style={{
            flex: 1,
            paddingTop: insets.top + ANCHOR_OFFSET,
            paddingHorizontal: 16,
            alignItems: "flex-end",
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
          onPress={onClose}
        >
          <Animated.View
            entering={scaleIn}
            exiting={scaleOut}
            style={{ width: "100%", maxWidth: 360, transformOrigin: "top right" }}
            onStartShouldSetResponder={() => true}
          >
            <Pressable
              onPress={(e) => e.stopPropagation()}
              className="bg-card-dark rounded-2xl border border-zinc-800 shadow-xl overflow-hidden"
              style={{ paddingVertical: 8 }}
            >
              <View className="pt-2">
                <MonthGrid
                  year={cursor.year}
                  month={cursor.month}
                  selectedDateId={selectedDateId}
                  onDayPress={handleDayPress}
                  markedDates={markedDates}
                  hideLabel
                  compact
                />
              </View>

              {/* Month navigation lives at the bottom: the panel hangs from the
                  header icon, so the top-right corner is the hardest spot to
                  reach one-handed. Chevrons grouped right = thumb zone. */}
              <View className="flex-row items-center justify-between px-3 pt-2 border-t border-zinc-800/80">
                <Text className="text-white font-bold text-base capitalize font-inter-700">
                  {getMonthLabel(cursor.year, cursor.month)}
                </Text>

                <View className="flex-row items-center">
                  <Pressable
                    onPress={goPrev}
                    hitSlop={8}
                    className="w-11 h-11 items-center justify-center rounded-full active:bg-zinc-800"
                  >
                    <FontAwesome name="chevron-left" size={16} color="#fff" />
                  </Pressable>
                  <Pressable
                    onPress={goNext}
                    hitSlop={8}
                    className="w-11 h-11 items-center justify-center rounded-full active:bg-zinc-800"
                  >
                    <FontAwesome name="chevron-right" size={16} color="#fff" />
                  </Pressable>
                </View>
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      )}
    </Modal>
  );
}
