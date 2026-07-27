import { Chip } from "@/components/ui/Chip";
import { Stepper } from "@/components/ui/Stepper";
import { RecurrenceType } from "@/constants/Enums";
import { DAY_INITIALS, WEEK_ORDER } from "@/utilities/recurrence";
import React from "react";
import { Text, View } from "react-native";

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

/**
 * Shortcuts for the common weekday sets. The labels deliberately match the ones
 * `formatRecurrence` prints on Planner rows, so what you pick here is what you read back.
 */
const DAY_PRESETS: { label: string; days: number[] }[] = [
  { label: "Every day", days: [0, 1, 2, 3, 4, 5, 6] },
  { label: "Weekdays", days: [1, 2, 3, 4, 5] },
  { label: "Weekends", days: [0, 6] },
];

const sameDays = (a: number[], b: number[]) =>
  a.length === b.length && a.every((d) => b.includes(d));

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

  return (
    <View>
      <Text className="text-zinc-400 text-[10px] font-bold tracking-widest mb-3 uppercase pl-1">
        REPEATS
      </Text>

      <View className="flex-row gap-2 mb-6">
        {MODES.map((mode) => (
          <Chip
            key={mode.value}
            label={mode.label}
            selected={value.recurrenceType === mode.value}
            onPress={() => onChange({ ...value, recurrenceType: mode.value })}
            size="sm"
            className="flex-1"
          />
        ))}
      </View>

      {value.recurrenceType === RecurrenceType.WEEKLY && (
        <View className="mb-2">
          <Text className="text-zinc-400 text-[10px] font-bold tracking-widest uppercase pl-1 mb-3">
            ON THESE DAYS
          </Text>

          {/* Rendered Monday-first to match the calendar, while the values written are
              getDay() indices (Sunday = 0) to match the wire format. */}
          <View className="flex-row justify-between">
            {WEEK_ORDER.map((day, i) => (
              <Chip
                key={`${day}-${i}`}
                shape="circle"
                label={DAY_INITIALS[day]}
                selected={value.daysOfWeek.includes(day)}
                onPress={() => toggleDay(day)}
              />
            ))}
          </View>

          {/* Shortcuts for the common sets. Each one lights up while it matches the
              current selection, so the row doubles as a readout of what's picked;
              tapping the lit one clears the days again. */}
          <View className="flex-row gap-2 mt-4">
            {DAY_PRESETS.map((preset) => {
              const active = sameDays(value.daysOfWeek, preset.days);
              return (
                <Chip
                  key={preset.label}
                  label={preset.label}
                  selected={active}
                  onPress={() =>
                    onChange({
                      ...value,
                      daysOfWeek: active ? [] : [...preset.days],
                    })
                  }
                  size="sm"
                />
              );
            })}
          </View>

          {value.daysOfWeek.length === 0 && (
            <Text className="text-amber-500/80 text-xs mt-3 pl-1">
              Pick at least one day.
            </Text>
          )}
        </View>
      )}

      {value.recurrenceType === RecurrenceType.INTERVAL && (
        <View className="flex-row items-center justify-between bg-card-dark border border-zinc-800 rounded-2xl px-5 py-3">
          <Text className="text-white text-base">Days between</Text>
          {/* The shared stepper the routine editor uses for sets/reps — brings the
              minus/plus icons, haptics and clamping for free. Its own chrome is stripped
              because this row is already a bordered card (same as SetRepsRow). */}
          <Stepper
            value={value.intervalDays}
            onIncrement={() => setInterval(1)}
            onDecrement={() => setInterval(-1)}
            min={MIN_INTERVAL}
            max={MAX_INTERVAL}
            size="sm"
            containerClassName="bg-transparent border-0 p-0"
          />
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
