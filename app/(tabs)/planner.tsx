import SessionWizard from "@/components/SessionWizard";
import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import {
  deleteSession,
  getSessions,
  ScheduledSession,
} from "@/services/Database";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useIsFocused } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PlannerScreen() {
  const isFocused = useIsFocused();
  const [currentDate, setCurrentDate] = useState(new Date()); // The reference date for the strip
  const [selectedDate, setSelectedDate] = useState(new Date()); // The actual selected date
  const [viewMode, setViewMode] = useState<"Week" | "Month">("Week");

  // Data
  const [allSessions, setAllSessions] = useState<ScheduledSession[]>([]);
  const [displayedSessions, setDisplayedSessions] = useState<
    ScheduledSession[]
  >([]);

  // Wizard
  const [wizardVisible, setWizardVisible] = useState(false);
  const [editingSession, setEditingSession] = useState<ScheduledSession | null>(
    null
  );

  useEffect(() => {
    loadSessions();
  }, [isFocused]);

  useEffect(() => {
    filterSessions();
  }, [selectedDate, allSessions]);

  const loadSessions = async () => {
    const data = await getSessions();
    setAllSessions(data);
  };

  const filterSessions = () => {
    // Filter logic based on frequency and selectedDate
    const filtered = allSessions.filter((session) => {
      const sessionDate = new Date(session.date);
      const selDate = new Date(selectedDate);

      // Normalize to midnight for comparison
      sessionDate.setHours(0, 0, 0, 0);
      selDate.setHours(0, 0, 0, 0);

      if (session.frequency === "ONCE") {
        return sessionDate.getTime() === selDate.getTime();
      }
      if (session.frequency === "DAILY") {
        return true; // Shows every day
      }
      if (session.frequency === "WEEKLY") {
        return sessionDate.getDay() === selDate.getDay();
      }
      if (session.frequency === "EVERY_2_DAYS") {
        const diffTime = Math.abs(selDate.getTime() - sessionDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays % 2 === 0 && selDate >= sessionDate;
      }
      return false;
    });
    setDisplayedSessions(filtered);
  };

  // Week Logic
  const getWeekDays = () => {
    const days = [];
    // Start of the strip (e.g. current date or start of week)
    // Let's just show 7 days starting from 'currentDate' for simplicity or center it
    // Simple implementation: 3 days before, 3 days after
    const start = new Date(currentDate);
    start.setDate(start.getDate() - 3);

    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const weekLabel = `${weekDays[0].toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} - ${weekDays[6].toLocaleDateString("en-US", { day: "numeric" })}`;
  const monthLabel = weekDays[0]
    .toLocaleDateString("en-US", { month: "long" })
    .toUpperCase();

  const handleDayPress = (date: Date) => {
    setSelectedDate(date);
  };

  const handleDeleteSession = async (id: string) => {
    await deleteSession(id);
    loadSessions();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Planner</Text>
          <View style={styles.toggleContainer}>
            <Pressable
              onPress={() =>
                setViewMode(viewMode === "Week" ? "Month" : "Week")
              }
              style={styles.toggleData}
            >
              <Text style={styles.toggleText}>{viewMode}</Text>
            </Pressable>
          </View>
        </View>

        {/* Date Navigation */}
        <View style={styles.navRow}>
          <Text style={styles.monthLabel}>{monthLabel}</Text>
          <View style={styles.navControls}>
            <Pressable
              style={styles.navBtn}
              onPress={() => {
                const newDate = new Date(currentDate);
                newDate.setDate(newDate.getDate() - 7);
                setCurrentDate(newDate);
              }}
            >
              <FontAwesome
                name="chevron-left"
                size={12}
                color={Colors.palette.zinc400}
              />
            </Pressable>
            <Pressable
              onPress={() => {
                const today = new Date();
                setCurrentDate(today);
                setSelectedDate(today);
              }}
              style={{
                backgroundColor: Colors.palette.zinc800,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  color: Colors.palette.white,
                  fontWeight: "700",
                  fontSize: 12,
                }}
              >
                Today
              </Text>
            </Pressable>
            <Pressable
              style={styles.navBtn}
              onPress={() => {
                const newDate = new Date(currentDate);
                newDate.setDate(newDate.getDate() + 7);
                setCurrentDate(newDate);
              }}
            >
              <FontAwesome
                name="chevron-right"
                size={12}
                color={Colors.palette.zinc400}
              />
            </Pressable>
          </View>
        </View>

        {/* Calendar Strip */}
        <View style={styles.calendarStrip}>
          {weekDays.map((date, index) => {
            const isSelected =
              date.toDateString() === selectedDate.toDateString();
            return (
              <Pressable
                key={index}
                onPress={() => handleDayPress(date)}
                style={[styles.dayItem, isSelected && styles.dayItemSelected]}
              >
                <Text
                  style={[
                    styles.dayLabel,
                    isSelected && styles.dayLabelSelected,
                  ]}
                >
                  {date.toLocaleDateString("en-US", { weekday: "narrow" })}
                </Text>
                <Text
                  style={[
                    styles.dateLabel,
                    isSelected && styles.dateLabelSelected,
                  ]}
                >
                  {date.getDate()}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Sessions Section */}
        <View style={styles.sessionsHeader}>
          <Text style={styles.sessionsTitle}>SESSIONS</Text>
          <Pressable
            style={styles.addBtn}
            onPress={() => setWizardVisible(true)}
          >
            <FontAwesome name="plus" size={16} color="#fff" />
          </Pressable>
        </View>

        {/* Session List */}
        <ScrollView contentContainerStyle={styles.sessionList}>
          {displayedSessions.length === 0 ? (
            <Text style={styles.emptyText}>
              No sessions planned for this day.
            </Text>
          ) : (
            displayedSessions.map((session) => {
              const exCount = JSON.parse(session.exercises || "[]").length;
              return (
                <View key={session.id} style={styles.sessionItem}>
                  <View
                    style={[
                      styles.sessionInfoComponent,
                      { backgroundColor: "transparent" },
                    ]}
                  >
                    <View
                      style={[
                        styles.activeIndicator,
                        { backgroundColor: session.color },
                      ]}
                    />
                    <View style={{ backgroundColor: "transparent" }}>
                      <Text style={styles.sessionName}>{session.title}</Text>
                      <Text style={styles.sessionDetails}>
                        {exCount} Exercises • {session.frequency}
                      </Text>
                    </View>
                  </View>
                  <Pressable onPress={() => handleDeleteSession(session.id)}>
                    <FontAwesome name="trash" size={16} color="#3F3F46" />
                  </Pressable>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>

      <SessionWizard
        visible={wizardVisible}
        onClose={() => {
          setWizardVisible(false);
          setEditingSession(null);
        }}
        onSave={() => {
          loadSessions();
          setEditingSession(null);
        }}
        selectedDate={selectedDate}
        initialSession={editingSession}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    backgroundColor: Colors.dark.background,
  },
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: Colors.palette.white,
  },
  toggleContainer: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 2,
    flexDirection: "row",
  },
  toggleData: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.palette.zinc800,
    borderRadius: 10,
  },
  toggleText: {
    color: Colors.palette.zinc400,
    fontSize: 12,
    fontWeight: "600",
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  monthLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.palette.zinc400,
    letterSpacing: 1,
  },
  navControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark.card,
    alignItems: "center",
    justifyContent: "center",
  },
  weekDate: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.palette.zinc300,
  },
  calendarStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  dayItem: {
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 64,
    borderRadius: 20,
  },
  dayItemSelected: {
    backgroundColor: Colors.palette.white,
  },
  dayLabel: {
    fontSize: 10,
    color: Colors.palette.zinc600,
    fontWeight: "700",
    marginBottom: 4,
  },
  dayLabelSelected: {
    color: "#000",
  },
  dateLabel: {
    fontSize: 16,
    color: Colors.palette.zinc500,
    fontWeight: "700",
  },
  dateLabelSelected: {
    color: "#000",
    fontWeight: "800",
  },
  sessionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sessionsTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    color: Colors.palette.zinc400,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.palette.blue500,
    alignItems: "center",
    justifyContent: "center",
  },
  sessionList: {
    flex: 1,
  },
  sessionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.palette.zinc800,
  },
  sessionInfoComponent: {
    flexDirection: "row",
    alignItems: "center",
  },
  activeIndicator: {
    width: 4,
    height: 32,
    borderRadius: 2,
    marginRight: 16,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
    color: Colors.palette.white,
  },
  sessionDetails: {
    fontSize: 12,
    color: Colors.palette.zinc400,
  },
  emptyText: {
    color: Colors.palette.zinc600,
    fontStyle: "italic",
    marginTop: 20,
    textAlign: "center",
  },
});
