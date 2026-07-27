import SessionCard from "@/components/sessions/SessionCard";
import { ScheduledEntry, UserProfile } from "@/constants/Types";
import { useCalendarContext } from "@/context/CalendarContext";
import { Api } from "@/services/api";
import { occursOn } from "@/utilities/recurrence";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Platform, ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DashboardScreen() {
  const router = useRouter();
  // Read schedules from the shared cache rather than re-fetching, so the Dashboard and
  // Planner can't disagree about what is on today.
  const { entries, refreshSessions } = useCalendarContext();
  const [completedRoutineIds, setCompletedRoutineIds] = useState<Set<string>>(
    new Set(),
  );
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const currentDate = new Date()
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
    .toUpperCase();

  useFocusEffect(
    React.useCallback(() => {
      loadDashboard();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const dailyEntries = useMemo(() => {
    const today = new Date();
    return entries.filter((e) => occursOn(e.plannedSession, today));
  }, [entries]);

  const loadDashboard = async () => {
    const [history, profile] = await Promise.all([
      Api.getSessionHistory(),
      Api.getUserProfile(),
    ]);
    setUserProfile(profile);
    await refreshSessions();

    const today = new Date();

    // Completion is keyed on the routine, so it holds up across routine edits and
    // schedule changes.
    const completedIds = new Set<string>();
    history.forEach((h) => {
      const hDate = new Date(h.date);
      if (
        hDate.getDate() === today.getDate() &&
        hDate.getMonth() === today.getMonth() &&
        hDate.getFullYear() === today.getFullYear()
      ) {
        completedIds.add(h.routineId);
      }
    });

    setCompletedRoutineIds(completedIds);
  };

  const handleStartSession = (entry: ScheduledEntry) => {
    router.push({
      pathname: "/live-session",
      params: { routine: JSON.stringify(entry.routine) },
    });
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background-dark"
      edges={["left", "right"]}
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        {/* Header Section */}
        <View className="flex-row justify-between items-start mb-10">
          <View className="bg-transparent">
            <View className="flex-row items-center mb-1">
              <Text className="text-3xl font-extrabold mr-2.5 text-white">
                Mali
              </Text>
              <View className="flex-row bg-yellow-400 px-2 py-1 rounded-lg items-center">
                <MaterialCommunityIcons
                  name="crown"
                  size={14}
                  color="#713F12"
                  style={{ marginRight: 4 }}
                />
                <Text className="text-xs font-bold text-[#713F12]">
                  LVL {userProfile?.level || 1}
                </Text>
              </View>
            </View>
            <Text className="text-xs text-zinc-500 font-semibold tracking-wide">
              {currentDate}
            </Text>
          </View>

          <View className="flex-row items-center bg-zinc-800 px-4 py-2.5 rounded-2xl border border-zinc-700">
            <FontAwesome
              name="fire"
              size={20}
              color={userProfile?.streakCurrent ? "#FF4500" : "#71717a"}
            />
            <Text className="text-xl font-bold ml-2 text-white">
              {userProfile?.streakCurrent || 0}
            </Text>
          </View>
        </View>

        {/* Daily Sessions */}
        <View className="flex-row items-center mb-4">
          <FontAwesome
            name="trophy"
            size={14}
            color="#FACC15"
            style={{ marginRight: 8 }}
          />
          <Text className="text-xs font-bold tracking-widest text-zinc-400">
            DAILY SESSIONS
          </Text>
        </View>

        {dailyEntries.length > 0 ? (
          dailyEntries.map((entry) => (
            <SessionCard
              key={entry.plannedSession.id}
              routine={entry.routine}
              onPress={() => handleStartSession(entry)}
              isCompleted={completedRoutineIds.has(entry.routine.id)}
            />
          ))
        ) : (
          <View className="p-6 items-center justify-center bg-card-dark rounded-2xl border border-dashed border-zinc-700">
            <Text className="text-white font-bold text-base mb-1">
              Rest Day
            </Text>
            <Text className="text-zinc-500 text-xs">
              No sessions scheduled for today.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
