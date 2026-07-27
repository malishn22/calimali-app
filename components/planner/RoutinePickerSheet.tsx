import { RecurrenceStep, RecurrenceValue } from "@/components/planner/RecurrenceStep";
import { Button } from "@/components/ui/Button";
import { SessionButton } from "@/components/ui/SessionButton";
import Colors from "@/constants/Colors";
import { RecurrenceType } from "@/constants/Enums";
import { BOTTOM_BAR_ACTION_HEIGHT } from "@/constants/Layout";
import { PlannedSession, Routine } from "@/constants/Types";
import { useBottomSheetModal } from "@/hooks/useBottomSheetModal";
import { toDateOnly } from "@/utilities/recurrence";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useCallback, useEffect, useState } from "react";
import { BackHandler, Pressable, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  visible: boolean;
  /** The day being scheduled. */
  date: Date;
  routines: Routine[];
  /** Routine ids already scheduled on this day, shown as unavailable. */
  assignedRoutineIds?: Set<string>;
  onAssign: (plan: Omit<PlannedSession, "id">) => Promise<void> | void;
  onClose: () => void;
  /** Invoked from the empty state to send the user to the Routines tab. */
  onCreateRoutine: () => void;
}

const formatDay = (date: Date) =>
  date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

/**
 * Two-phase sheet: pick a routine, then choose how it repeats. It never opens the
 * routine editor — authoring lives on the Routines tab, which is what keeps this sheet
 * free of navigation round trips (it renders in the root portal and would otherwise
 * float above any pushed screen).
 */
export function RoutinePickerSheet({
  visible,
  date,
  routines,
  assignedRoutineIds,
  onAssign,
  onClose,
  onCreateRoutine,
}: Props) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<Routine | null>(null);
  const [saving, setSaving] = useState(false);
  const [recurrence, setRecurrence] = useState<RecurrenceValue>({
    recurrenceType: RecurrenceType.ONCE,
    daysOfWeek: [date.getDay()],
    intervalDays: 2,
  });

  const {
    ref: bottomSheetRef,
    snapPoints,
    handleSheetChanges,
    renderBackdrop,
    commonProps,
  } = useBottomSheetModal(visible, true, onClose, { snapPoints: ["70%"] });

  // Reset to phase one whenever the sheet is reopened, and seed the weekday chips with
  // the day the user tapped.
  useEffect(() => {
    if (visible) {
      setSelected(null);
      setSaving(false);
      setRecurrence({
        recurrenceType: RecurrenceType.ONCE,
        daysOfWeek: [date.getDay()],
        intervalDays: 2,
      });
    }
  }, [visible, date]);

  // Android back should step back to the routine list, not dismiss the whole sheet.
  useEffect(() => {
    if (!visible || !selected) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      setSelected(null);
      return true;
    });
    return () => sub.remove();
  }, [visible, selected]);

  const handleConfirm = useCallback(async () => {
    if (!selected || saving) return;
    setSaving(true);
    try {
      await onAssign({
        routineId: selected.id,
        startDate: toDateOnly(date),
        endDate: null,
        recurrenceType: recurrence.recurrenceType,
        daysOfWeek:
          recurrence.recurrenceType === RecurrenceType.WEEKLY
            ? recurrence.daysOfWeek
            : [],
        intervalDays:
          recurrence.recurrenceType === RecurrenceType.INTERVAL
            ? recurrence.intervalDays
            : null,
      });
    } finally {
      setSaving(false);
    }
  }, [selected, saving, onAssign, date, recurrence]);

  const canConfirm =
    !!selected &&
    !saving &&
    (recurrence.recurrenceType !== RecurrenceType.WEEKLY ||
      recurrence.daysOfWeek.length > 0);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      enableDynamicSizing={false}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: "#52525B" }}
      {...commonProps}
    >
      <BottomSheetScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 24,
        }}
      >
        {/* Centred sheet header, matching ExerciseDetailSheet. Back lives in the footer
            (as everywhere else in the app), so nothing crowds the title. */}
        <View className="items-center mb-6">
          <Text className="text-zinc-400 text-[10px] font-bold tracking-widest uppercase mb-1">
            {selected ? "SCHEDULE" : "ADD TO"}
          </Text>
          <Text
            className="text-2xl font-black text-white text-center leading-tight"
            numberOfLines={2}
          >
            {selected ? selected.name : formatDay(date)}
          </Text>
        </View>

        {!selected ? (
          <Animated.View entering={FadeIn.duration(150)}>
            {routines.length === 0 ? (
              <View className="py-8 items-center">
                <Text className="text-zinc-500 text-center italic mb-2">
                  No routines yet.
                </Text>
                <Text className="text-zinc-600 text-center text-xs px-4 mb-6">
                  Build a routine first — then you can add it to any day.
                </Text>
                <Button
                  variant="primary"
                  size="md"
                  title="GO TO ROUTINES"
                  onPress={onCreateRoutine}
                />
              </View>
            ) : (
              <View className="gap-3">
                {routines.map((routine) => {
                  const alreadyAssigned = assignedRoutineIds?.has(routine.id);
                  return (
                    <Pressable
                      key={routine.id}
                      disabled={alreadyAssigned}
                      onPress={() => setSelected(routine)}
                      className={`flex-row items-center bg-card-dark rounded-2xl p-4 border border-zinc-800 ${
                        alreadyAssigned ? "opacity-40" : ""
                      }`}
                    >
                      <View
                        className="w-1 h-8 rounded-full mr-4"
                        style={{ backgroundColor: routine.color }}
                      />
                      <View className="flex-1">
                        <Text
                          className="text-white text-base font-bold mb-0.5"
                          numberOfLines={1}
                        >
                          {routine.name}
                        </Text>
                        <Text className="text-zinc-400 text-xs">
                          {routine.exercises.length}{" "}
                          {routine.exercises.length === 1
                            ? "Exercise"
                            : "Exercises"}
                          {alreadyAssigned ? " • Already on this day" : ""}
                        </Text>
                      </View>
                      {!alreadyAssigned && (
                        <FontAwesome
                          name="chevron-right"
                          size={14}
                          color="#3F3F46"
                        />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            )}
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.duration(150)}>
            <RecurrenceStep value={recurrence} onChange={setRecurrence} />

            {/* Same pair as BottomActionPanel — a zinc back button beside the primary
                action — composed by hand rather than reusing that component, whose
                insets.bottom padding would double up against the sheet's own. */}
            <View className="flex-row items-center gap-4 mt-8">
              <Button
                variant="secondary"
                size="sm"
                onPress={() => setSelected(null)}
                className="bg-zinc-800 w-24 rounded-xl items-center justify-center"
                style={{
                  height: BOTTOM_BAR_ACTION_HEIGHT,
                  minHeight: BOTTOM_BAR_ACTION_HEIGHT,
                }}
              >
                <FontAwesome
                  name="chevron-left"
                  size={16}
                  color={Colors.palette.silver}
                />
              </Button>
              <SessionButton
                variant="completed"
                size="compact"
                className="flex-1"
                title={saving ? "ADDING…" : "ADD TO CALENDAR"}
                icon="check"
                disabled={!canConfirm}
                onPress={handleConfirm}
              />
            </View>
          </Animated.View>
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
