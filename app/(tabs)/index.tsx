import LiveSession from "@/components/LiveSession";
import SessionCard from "@/components/SessionCard";
import { Text, View } from "@/components/Themed";
import {
  getSessionHistory,
  getSessions,
  ScheduledSession,
} from "@/services/Database";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useIsFocused } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Platform, ScrollView, StatusBar, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DashboardScreen() {
  const isFocused = useIsFocused();
  const [dailySessions, setDailySessions] = useState<ScheduledSession[]>([]);
  const [liveSession, setLiveSession] = useState<ScheduledSession | null>(null);
  const [completedSessionIds, setCompletedSessionIds] = useState<Set<string>>(
    new Set()
  );

  const currentDate = new Date()
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
    .toUpperCase();

  useEffect(() => {
    if (isFocused) {
      loadDailySessions();
    }
  }, [isFocused]);

  const loadDailySessions = async () => {
    const allSessions = await getSessions();
    const history = await getSessionHistory();
    const today = new Date();

    // Find completed sessions for TODAY
    const completedIds = new Set<string>();
    history.forEach((h) => {
      const hDate = new Date(h.date);
      if (
        hDate.getDate() === today.getDate() &&
        hDate.getMonth() === today.getMonth() &&
        hDate.getFullYear() === today.getFullYear()
      ) {
        completedIds.add(h.session_id);
      }
    });

    // Filter for today
    const todays = allSessions.filter((session) => {
      const sessionDate = new Date(session.date);
      const isSameDay =
        sessionDate.getDate() === today.getDate() &&
        sessionDate.getMonth() === today.getMonth() &&
        sessionDate.getFullYear() === today.getFullYear();

      if (session.frequency === "ONCE") {
        return isSameDay;
      } else if (session.frequency === "DAILY") {
        return today >= sessionDate; // Simple check: if started in past/today
      } else if (session.frequency === "WEEKLY") {
        return today >= sessionDate && sessionDate.getDay() === today.getDay();
      } else if (session.frequency === "EVERY_2_DAYS") {
        if (today < sessionDate) return false;
        const diffTime = Math.abs(today.getTime() - sessionDate.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays % 2 === 0;
      }
      return false;
    });

    setDailySessions(todays);
    setCompletedSessionIds(completedIds);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={{ backgroundColor: "transparent" }}>
            <View style={styles.nameRow}>
              <Text style={styles.greeting}>Mali</Text>
              <View style={styles.levelBadge}>
                <MaterialCommunityIcons
                  name="crown"
                  size={14}
                  color="#713F12"
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.levelText}>LVL 1</Text>
              </View>
            </View>
            <Text style={styles.date}>{currentDate}</Text>
          </View>

          <View style={styles.streakCard}>
            <FontAwesome name="fire" size={20} color="#FF4500" />
            <Text style={styles.streakCount}>1</Text>
          </View>
        </View>

        {/* Daily Sessions */}
        <View style={styles.sectionHeader}>
          <FontAwesome
            name="trophy"
            size={14}
            color="#FACC15"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.sectionTitle}>DAILY SESSIONS</Text>
        </View>

        {dailySessions.length > 0 ? (
          dailySessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onPress={() => setLiveSession(session)}
              isCompleted={completedSessionIds.has(session.id)}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Rest Day</Text>
            <Text style={styles.emptySubtext}>
              No sessions scheduled for today.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Live Session Modal */}
      <LiveSession
        visible={!!liveSession}
        session={liveSession}
        onClose={() => setLiveSession(null)}
        onComplete={(data) => {
          setLiveSession(null);
          loadDailySessions(); // Refresh UI
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    backgroundColor: "#121214",
  },
  container: {
    padding: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 40,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  greeting: {
    fontSize: 32,
    fontWeight: "800", // Extra bold
    marginRight: 10,
  },
  levelBadge: {
    flexDirection: "row",
    backgroundColor: "#FACC15",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: "center",
  },
  levelText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#713F12",
  },
  date: {
    fontSize: 12,
    color: "#71717A",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  streakCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#27272A",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3F3F46",
  },
  streakCount: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#A1A1AA",
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1E1E22",
    borderRadius: 16,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#3F3F46",
  },
  emptyText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    color: "#71717A",
    fontSize: 12,
  },
});
