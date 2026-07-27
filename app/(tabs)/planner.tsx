import { Calendar } from "@/components/calendar/Calendar";
import { CalendarPanel } from "@/components/calendar/CalendarPanel";
import { SideActionButton } from "@/components/ui/SideActionButton";
import { PlannerSessionRow as SessionCard } from "@/components/sessions/PlannerSessionRow";
import { FAB_CONTENT_CLEARANCE } from "@/constants/Layout";
import { ScheduledSession } from "@/constants/Types";
import { useCalendarContext } from "@/context/CalendarContext";
import { Api } from "@/services/api";
import { isSessionActiveOnDate } from "@/utilities/SessionUtils";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PlannerScreen() {
  const router = useRouter();
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Use Context for Data
  const { selectedDate, setSelectedDate, sessions, refreshSessions } =
    useCalendarContext();

  // Session history to determine which sessions are completed on selected date
  const [sessionHistory, setSessionHistory] = useState<{ sessionId: string; date: string }[]>([]);

  useFocusEffect(
    useCallback(() => {
      Api.getSessionHistory().then((history) => {
        setSessionHistory(history.map((h) => ({ sessionId: h.sessionId, date: h.date })));
      });
    }, []),
  );

  const completedSessionIdsForSelectedDate = useMemo(() => {
    const d = selectedDate;
    const ids = new Set<string>();
    sessionHistory.forEach((h) => {
      const hDate = new Date(h.date);
      if (
        hDate.getDate() === d.getDate() &&
        hDate.getMonth() === d.getMonth() &&
        hDate.getFullYear() === d.getFullYear()
      ) {
        ids.add(h.sessionId);
      }
    });
    return ids;
  }, [selectedDate, sessionHistory]);

  const handleDeleteSession = async (id: string) => {
    try {
      await Api.deletePlannedSession(id);
      await refreshSessions();
    } catch (e) {
      Alert.alert(
        "Delete failed",
        e instanceof Error ? e.message : "Could not delete session. Please try again.",
      );
    }
  };

  const handleEditSession = (session: ScheduledSession) => {
    router.push({
      pathname: "/session-wizard",
      params: {
        selectedDate: selectedDate.toISOString(),
        initialSession: JSON.stringify(session),
      },
    });
  };

  // Filter sessions for selected date
  // Fast because `sessions` is cached
  const selectedDateSessions = useMemo(
    // Use shared helper for accurate frequency check
    () =>
      sessions.filter((session) =>
        isSessionActiveOnDate(session, selectedDate),
      ),
    [sessions, selectedDate],
  );

  const handleAddSession = () => {
    router.push({
      pathname: "/session-wizard",
      params: { selectedDate: selectedDate.toISOString() },
    });
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
              {selectedDateSessions.length > 0 ? (
                selectedDateSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    isCompleted={completedSessionIdsForSelectedDate.has(session.id)}
                    onDelete={handleDeleteSession}
                    onPress={() => handleEditSession(session)}
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

      <SideActionButton onPress={handleAddSession} />
      </View>

      <CalendarPanel
        visible={calendarOpen}
        onClose={() => setCalendarOpen(false)}
      />
    </SafeAreaView>
  );
}
