import { Calendar } from "@/components/calendar/Calendar";
import { CalendarPanel } from "@/components/calendar/CalendarPanel";
import { RoutinePickerSheet } from "@/components/planner/RoutinePickerSheet";
import { SideActionButton } from "@/components/ui/SideActionButton";
import { PlannerSessionRow } from "@/components/sessions/PlannerSessionRow";
import { FAB_CONTENT_CLEARANCE } from "@/constants/Layout";
import { PlannedSession, ScheduledEntry } from "@/constants/Types";
import { useCalendarContext } from "@/context/CalendarContext";
import { Api } from "@/services/api";
import { occursOn } from "@/utilities/recurrence";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PlannerScreen() {
  const router = useRouter();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  /** Set when the picker is reopened to change an existing placement's recurrence. */
  const [editingEntry, setEditingEntry] = useState<ScheduledEntry | null>(null);

  // Use Context for Data
  const { selectedDate, entries, routines, refreshSessions } =
    useCalendarContext();

  // Session history to determine which routines are completed on selected date
  const [sessionHistory, setSessionHistory] = useState<
    { routineId: string; date: string }[]
  >([]);

  useFocusEffect(
    useCallback(() => {
      Api.getSessionHistory().then((history) => {
        setSessionHistory(
          history.map((h) => ({ routineId: h.routineId, date: h.date })),
        );
      });
    }, []),
  );

  // Completion is tracked per routine, not per schedule: doing "Push Day" today counts
  // however it got onto the calendar.
  const completedRoutineIdsForSelectedDate = useMemo(() => {
    const d = selectedDate;
    const ids = new Set<string>();
    sessionHistory.forEach((h) => {
      const hDate = new Date(h.date);
      if (
        hDate.getDate() === d.getDate() &&
        hDate.getMonth() === d.getMonth() &&
        hDate.getFullYear() === d.getFullYear()
      ) {
        ids.add(h.routineId);
      }
    });
    return ids;
  }, [selectedDate, sessionHistory]);

  // Filter entries for selected date — fast because `entries` is cached
  const selectedDateEntries = useMemo(
    () => entries.filter((e) => occursOn(e.plannedSession, selectedDate)),
    [entries, selectedDate],
  );

  const assignedRoutineIds = useMemo(
    () => new Set(selectedDateEntries.map((e) => e.routine.id)),
    [selectedDateEntries],
  );

  const handleRemoveFromSchedule = (entry: ScheduledEntry) => {
    Alert.alert(
      "Remove from schedule?",
      `"${entry.routine.name}" stays in your Routines — this only removes it from the calendar.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await Api.deletePlannedSession(entry.plannedSession.id);
              await refreshSessions();
            } catch (e) {
              Alert.alert(
                "Remove failed",
                e instanceof Error ? e.message : "Could not remove. Try again.",
              );
            }
          },
        },
      ],
    );
  };

  // The Planner is where you arrange training; the Dashboard is where you do it. Tapping
  // a row edits the routine behind it — starting a workout lives on the Dashboard card.
  const handleEditRoutine = (entry: ScheduledEntry) => {
    router.push({
      pathname: "/routine-editor",
      params: { routineId: entry.routine.id },
    });
  };

  const handleEditSchedule = (entry: ScheduledEntry) => {
    setEditingEntry(entry);
    setPickerOpen(true);
  };

  const closePicker = () => {
    setPickerOpen(false);
    setEditingEntry(null);
  };

  const handleAssign = async (plan: Omit<PlannedSession, "id">) => {
    try {
      if (editingEntry) {
        await Api.updatePlannedSession({
          ...plan,
          id: editingEntry.plannedSession.id,
        });
      } else {
        await Api.createPlannedSession(plan);
      }
      await refreshSessions();
      closePicker();
    } catch (e) {
      Alert.alert(
        editingEntry ? "Could not save" : "Could not add",
        e instanceof Error ? e.message : "Failed to update the calendar.",
      );
    }
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background-dark">
      <View className="flex-1">
        <ScrollView className="flex-1">
          <View className="flex-1 pt-4">
            <View>
              <View className="flex-row justify-between items-center mb-6 px-4">
                <Text className="text-3xl font-bold text-white font-inter-700">
                  Planner
                </Text>
              </View>

              {/* Calendar Component */}
              <Calendar onOpenCalendar={() => setCalendarOpen(true)} />
            </View>

            {/* Sessions List */}
            <View
              className="mt-6 px-4"
              style={{ marginBottom: FAB_CONTENT_CLEARANCE }}
            >
              <View className="mb-4">
                <Text className="text-stone-400 text-xs font-bold tracking-widest uppercase">
                  SESSIONS
                </Text>
              </View>

              <View className="gap-3">
                {selectedDateEntries.length > 0 ? (
                  selectedDateEntries.map((entry) => (
                    <PlannerSessionRow
                      key={entry.plannedSession.id}
                      entry={entry}
                      isCompleted={completedRoutineIdsForSelectedDate.has(
                        entry.routine.id,
                      )}
                      onPress={() => handleEditRoutine(entry)}
                      onLongPress={() => handleEditSchedule(entry)}
                      onRemove={() => handleRemoveFromSchedule(entry)}
                    />
                  ))
                ) : (
                  <Text className="text-zinc-500 text-center py-8 italic">
                    No sessions for this day.
                  </Text>
                )}
              </View>
            </View>
          </View>
        </ScrollView>

        <SideActionButton
          onPress={() => {
            setEditingEntry(null);
            setPickerOpen(true);
          }}
        />
      </View>

      <CalendarPanel
        visible={calendarOpen}
        onClose={() => setCalendarOpen(false)}
      />

      <RoutinePickerSheet
        visible={pickerOpen}
        date={selectedDate}
        routines={routines}
        assignedRoutineIds={assignedRoutineIds}
        editing={editingEntry}
        onAssign={handleAssign}
        onClose={closePicker}
        onCreateRoutine={() => {
          closePicker();
          router.push("/(tabs)/routines");
        }}
      />
    </SafeAreaView>
  );
}
