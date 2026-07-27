import { RecurrenceType } from "@/constants/Enums";
import { DAY_INITIALS, WEEK_ORDER } from "@/utilities/recurrence";
import React from "react";
import { Pressable, Text, View } from "react-native";

const MIN_INTERVAL = 2;
const MAX_INTERVAL = 14;

export interface RecurrenceValue {
  recurrenceType: RecurrenceType;
  /** getDay() values, 0=Sun .. 6=Sat. */
  daysOfWeek: number[];
  intervalDays: number;
}

interface Props {
  value: RecurrenceValue;
  onChange: (value: RecurrenceValue) => void;
}

const MODES = [
  { label: "Once", value: RecurrenceType.ONCE },
  { label: "Weekly", value: RecurrenceType.WEEKLY },
  { label: "Every N days", value: RecurrenceType.INTERVAL },
];

export function RecurrenceStep({ value, onChange }: Props) {
  const toggleDay = (day: number) => {
    const days = value.daysOfWeek.includes(day)
      ? value.daysOfWeek.filter((d) => d !== day)
      : [...value.daysOfWeek, day];
    onChange({ ...value, daysOfWeek: days });
  };

  const setInterval = (delta: number) => {
    const next = Math.min(
      MAX_INTERVAL,
      Math.max(MIN_INTERVAL, value.intervalDays + delta),
    );
    onChange({ ...value, intervalDays: next });
  };

  const allSelected = value.daysOfWeek.length === 7;

  return (
    <View>
      <Text className="text-zinc-400 text-[10px] font-bold tracking-widest mb-3 uppercase pl-1">
        REPEATS
      </Text>

      <View className="flex-row gap-2 mb-6">
        {MODES.map((mode) => {
          const selected = value.recurrenceType === mode.value;
          return (
            <Pressable
              key={mode.value}
              onPress={() => onChange({ ...value, recurrenceType: mode.value })}
              className={`flex-1 py-3 rounded-xl border items-center justify-center ${
                selected ? "bg-white border-white" : "bg-zinc-900 border-zinc-700"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  selected ? "text-black" : "text-zinc-400"
                }`}
              >
                {mode.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {value.recurrenceType === RecurrenceType.WEEKLY && (
        <View className="mb-2">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-zinc-400 text-[10px] font-bold tracking-widest uppercase pl-1">
              ON THESE DAYS
            </Text>
            <Pressable
              onPress={() =>
                onChange({
                  ...value,
                  daysOfWeek: allSelected ? [] : [...WEEK_ORDER],
                })
              }
            >
              <Text className="text-zinc-400 text-xs font-bold">
                {allSelected ? "Clear" : "Every day"}
              </Text>
            </Pressable>
          </View>

          {/* Rendered Monday-first to match the calendar, while the values written are
              getDay() indices (Sunday = 0) to match the wire format. */}
          <View className="flex-row justify-between">
            {WEEK_ORDER.map((day, i) => {
              const selected = value.daysOfWeek.includes(day);
              return (
                <Pressable
                  key={`${day}-${i}`}
                  onPress={() => toggleDay(day)}
                  className={`w-10 h-10 rounded-full items-center justify-center border ${
                    selected
                      ? "bg-white border-white"
                      : "bg-zinc-900 border-zinc-700"
                  }`}
                >
                  <Text
                    className={`text-sm font-bold ${
                      selected ? "text-black" : "text-zinc-400"
                    }`}
                  >
                    {DAY_INITIALS[day]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {value.daysOfWeek.length === 0 && (
            <Text className="text-amber-500/80 text-xs mt-3 pl-1">
              Pick at least one day, or it will never appear.
            </Text>
          )}
        </View>
      )}

      {value.recurrenceType === RecurrenceType.INTERVAL && (
        <View className="flex-row items-center justify-between bg-zinc-900 border border-zinc-700 rounded-xl px-5 py-4">
          <Text className="text-white text-base">
            Every{" "}
            <Text className="font-bold">{value.intervalDays}</Text> days
          </Text>
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => setInterval(-1)}
              disabled={value.intervalDays <= MIN_INTERVAL}
              className={`w-9 h-9 rounded-full items-center justify-center border border-zinc-700 ${
                value.intervalDays <= MIN_INTERVAL ? "opacity-40" : ""
              }`}
            >
              <Text className="text-white text-lg font-bold">−</Text>
            </Pressable>
            <Pressable
              onPress={() => setInterval(1)}
              disabled={value.intervalDays >= MAX_INTERVAL}
              className={`w-9 h-9 rounded-full items-center justify-center border border-zinc-700 ${
                value.intervalDays >= MAX_INTERVAL ? "opacity-40" : ""
              }`}
            >
              <Text className="text-white text-lg font-bold">+</Text>
            </Pressable>
          </View>
        </View>
      )}

      {value.recurrenceType === RecurrenceType.ONCE && (
        <Text className="text-zinc-500 text-xs pl-1">
          Appears on the selected day only.
        </Text>
      )}
    </View>
  );
}
