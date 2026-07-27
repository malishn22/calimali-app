import { RoutineRow } from "@/components/routines/RoutineRow";
import { SideActionButton } from "@/components/ui/SideActionButton";
import { FAB_CONTENT_CLEARANCE } from "@/constants/Layout";
import { Routine } from "@/constants/Types";
import { useCalendarContext } from "@/context/CalendarContext";
import { Api } from "@/services/api";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * The library of reusable routines. This is the only place routines are created or
 * edited — the Planner just picks from what lives here.
 */
export default function RoutinesScreen() {
  const router = useRouter();
  const { routines, entries, refreshSessions } = useCalendarContext();

  // How many calendar placements point at each routine, so the row can warn before a
  // delete takes scheduled days with it.
  const scheduleCounts = useMemo(() => {
    const counts = new Map<string, number>();
    entries.forEach((e) => {
      counts.set(e.routine.id, (counts.get(e.routine.id) ?? 0) + 1);
    });
    return counts;
  }, [entries]);

  const handleCreate = () => router.push("/routine-editor");

  const handleEdit = (routine: Routine) =>
    router.push({
      pathname: "/routine-editor",
      params: { routineId: routine.id },
    });

  const handleDelete = (id: string) => {
    const routine = routines.find((r) => r.id === id);
    const scheduled = scheduleCounts.get(id) ?? 0;

    Alert.alert(
      `Delete "${routine?.name ?? "routine"}"?`,
      scheduled > 0
        ? `This also removes it from ${scheduled} ${
            scheduled === 1 ? "schedule" : "schedules"
          } on your calendar. Completed workouts are kept.`
        : "Completed workouts are kept.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await Api.deleteRoutine(id);
              await refreshSessions();
            } catch (e) {
              Alert.alert(
                "Delete failed",
                e instanceof Error ? e.message : "Could not delete routine.",
              );
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background-dark">
      <View className="flex-1">
        <ScrollView className="flex-1">
          <View className="flex-1 pt-4">
            <View className="flex-row justify-between items-center mb-6 px-4">
              <Text className="text-3xl font-bold text-white font-inter-700">
                Routines
              </Text>
            </View>

            <View
              className="px-4"
              style={{ marginBottom: FAB_CONTENT_CLEARANCE }}
            >
              <View className="mb-4">
                <Text className="text-stone-400 text-xs font-bold tracking-widest uppercase">
                  YOUR ROUTINES
                </Text>
              </View>

              <View className="gap-3">
                {routines.length > 0 ? (
                  routines.map((routine) => {
                    const count = scheduleCounts.get(routine.id) ?? 0;
                    return (
                      <RoutineRow
                        key={routine.id}
                        routine={routine}
                        scheduleLabel={
                          count > 0
                            ? `On ${count} ${count === 1 ? "schedule" : "schedules"}`
                            : "Not scheduled"
                        }
                        onPress={() => handleEdit(routine)}
                        onDelete={handleDelete}
                      />
                    );
                  })
                ) : (
                  <View className="py-10 items-center">
                    <Text className="text-zinc-500 text-center italic mb-1">
                      No routines yet.
                    </Text>
                    <Text className="text-zinc-600 text-center text-xs px-6">
                      Build one here, then add it to any day from the Planner.
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </ScrollView>

        <SideActionButton onPress={handleCreate} />
      </View>
    </SafeAreaView>
  );
}
