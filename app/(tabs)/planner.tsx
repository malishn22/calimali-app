import SessionWizard from "@/components/SessionWizard";
import { Calendar } from "@/components/ui/Calendar";
import { SessionCard } from "@/components/ui/SessionCard";
import { useCalendarContext } from "@/context/CalendarContext";
import { deleteSession, ScheduledSession } from "@/services/Database";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PlannerScreen() {
  const [viewMode, setViewMode] = useState<"Week" | "Month">("Week");

  // Use Context for Data
  const { selectedDate, setSelectedDate, sessions, refreshSessions } =
    useCalendarContext();

  // Wizard State (Props-based control as per original)
  const [wizardVisible, setWizardVisible] = useState(false);
  const [editingSession, setEditingSession] = useState<ScheduledSession | null>(
    null,
  );

  const handleDeleteSession = async (id: string) => {
    await deleteSession(id);
    await refreshSessions();
  };

  const handleEditSession = (session: ScheduledSession) => {
    setEditingSession(session);
    setWizardVisible(true);
  };

  // Filter sessions for selected date
  // Fast because `sessions` is cached
  const selectedDateSessions = sessions.filter((session) => {
    const sessionDate = new Date(session.date);
    return (
      sessionDate.getDate() === selectedDate.getDate() &&
      sessionDate.getMonth() === selectedDate.getMonth() &&
      sessionDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background-dark">
      <ScrollView className="flex-1">
        <View className="flex-1 pt-4">
          <View className="flex-row justify-between items-center mb-6 px-4">
            <Text className="text-3xl font-bold text-white font-inter-700">
              Planner
            </Text>
            {/* View Mode Toggle */}
            <Pressable
              onPress={() =>
                setViewMode(viewMode === "Week" ? "Month" : "Week")
              }
              className="bg-zinc-800 px-4 py-2 rounded-xl border border-zinc-700"
            >
              <Text className="text-zinc-200 text-xs font-bold">
                {viewMode === "Week" ? "Month" : "Week"}
              </Text>
            </Pressable>
          </View>

          {/* Calendar Component */}
          <Calendar viewMode={viewMode} />

          {/* Sessions List */}
          <View className="mt-6 mb-20 px-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-stone-400 text-xs font-bold tracking-widest uppercase">
                SESSIONS
              </Text>
              <Pressable
                className="w-8 h-8 rounded-full bg-blue-500 items-center justify-center"
                onPress={() => {
                  setEditingSession(null);
                  setWizardVisible(true);
                }}
              >
                <FontAwesome name="plus" size={16} color="#fff" />
              </Pressable>
            </View>

            <View className="gap-3">
              {selectedDateSessions.length > 0 ? (
                selectedDateSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
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
