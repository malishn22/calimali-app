import { Calendar } from "@/components/calendar/Calendar";
import { SideActionButton } from "@/components/ui/SideActionButton";
import { PlannerSessionRow as SessionCard } from "@/components/sessions/PlannerSessionRow";
import SessionWizard from "@/components/sessions/SessionWizard";
import { ScheduledSession } from "@/constants/Types";
import { useCalendarContext } from "@/context/CalendarContext";
import { Api } from "@/services/api";
import { isSessionActiveOnDate } from "@/utilities/SessionUtils";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  LayoutAnimation,
  LayoutChangeEvent,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PlannerScreen() {
  const [viewMode, setViewMode] = useState<"Week" | "Month">("Week");

  // Use Context for Data
  const { selectedDate, setSelectedDate, sessions, refreshSessions } =
    useCalendarContext();

  // Session history to determine which sessions are completed on selected date
  const [sessionHistory, setSessionHistory] = useState<{ session_id: string; date: string }[]>([]);

  useFocusEffect(
    useCallback(() => {
      Api.getSessionHistory().then((history) => {
        setSessionHistory(history.map((h) => ({ session_id: h.session_id, date: h.date })));
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
        ids.add(h.session_id);
      }
    });
    return ids;
  }, [selectedDate, sessionHistory]);

  // Wizard State (Props-based control as per original)
  const [wizardVisible, setWizardVisible] = useState(false);
  const [editingSession, setEditingSession] = useState<ScheduledSession | null>(
    null,
  );

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
    setEditingSession(session);
    setWizardVisible(true);
  };

  // Filter sessions for selected date
  // Fast because `sessions` is cached
  const selectedDateSessions = sessions.filter((session) => {
    // Use shared helper for accurate frequency check
    return isSessionActiveOnDate(session, selectedDate);
  });

  const handleAddSession = () => {
    setEditingSession(null);
    setWizardVisible(true);
  };

  // FAB position from measured layout so it sits just below the calendar
  const [calendarBlockBottom, setCalendarBlockBottom] = useState(280);
  const handleCalendarBlockLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { y, height } = e.nativeEvent.layout;
      setCalendarBlockBottom(y + height);
    },
    [],
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background-dark">
      <View className="flex-1">
      <ScrollView className="flex-1">
        <View className="flex-1 pt-4">
          <View
            onLayout={handleCalendarBlockLayout}
            style={{ paddingTop: 0 }}
          >
            <View className="flex-row justify-between items-center mb-6 px-4">
              <Text className="text-3xl font-bold text-white font-inter-700">
                Planner
              </Text>
            </View>

            {/* Calendar Component */}
            <Calendar
              viewMode={viewMode}
              onViewModeChange={(mode) => {
                LayoutAnimation.configureNext(
                  LayoutAnimation.Presets.easeInEaseOut,
                );
                setViewMode(mode);
              }}
            />
          </View>

          {/* Sessions List */}
          <View className="mt-6 mb-20 px-4">
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

      <SideActionButton
        onPress={handleAddSession}
        position="top-right"
        size="sm"
        topOffset={Math.max(80, 16 + calendarBlockBottom - 20)}
      />
      </View>

      <SessionWizard
        visible={wizardVisible}
        onClose={() => {
          setWizardVisible(false);
          setEditingSession(null);
        }}
        onSave={() => {
          refreshSessions();
          setEditingSession(null);
        }}
        selectedDate={selectedDate}
        initialSession={editingSession}
      />
    </SafeAreaView>
  );
}
