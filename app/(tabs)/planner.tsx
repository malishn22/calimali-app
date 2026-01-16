import SessionWizard from "@/components/SessionWizard";
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
  Text,
  View,
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
    <SafeAreaView
      className="flex-1 bg-background-dark"
      edges={["left", "right", "bottom"]}
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      <View className="flex-1 p-6">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-3xl font-extrabold text-white">Planner</Text>
          <View className="bg-card-dark rounded-xl p-0.5 flex-row">
            <Pressable
              onPress={() =>
                setViewMode(viewMode === "Week" ? "Month" : "Week")
              }
              className="py-1.5 px-3 bg-zinc-800 rounded-lg"
            >
              <Text className="text-zinc-400 text-xs font-semibold">
                {viewMode}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Date Navigation */}
        <View className="flex-row justify-between items-center mb-5">
          <Text className="text-xs font-bold text-zinc-400 tracking-widest uppercase">
            {monthLabel}
          </Text>
          <View className="flex-row items-center gap-2">
            <Pressable
              className="w-8 h-8 rounded-full bg-card-dark items-center justify-center"
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
              className="bg-zinc-800 px-3 py-1.5 rounded-xl"
            >
              <Text className="text-white font-bold text-xs">Today</Text>
            </Pressable>
            <Pressable
              className="w-8 h-8 rounded-full bg-card-dark items-center justify-center"
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
        <View className="flex-row justify-between mb-8">
          {weekDays.map((date, index) => {
            const isSelected =
              date.toDateString() === selectedDate.toDateString();
            return (
              <Pressable
                key={index}
                onPress={() => handleDayPress(date)}
                className={`items-center justify-center w-10 h-16 rounded-3xl ${
                  isSelected ? "bg-white" : ""
                }`}
              >
                <Text
                  className={`text-[10px] font-bold mb-1 ${
                    isSelected ? "text-black" : "text-zinc-600"
                  }`}
                >
                  {date.toLocaleDateString("en-US", { weekday: "narrow" })}
                </Text>
                <Text
                  className={`text-base font-bold ${
                    isSelected ? "text-black font-extrabold" : "text-zinc-500"
                  }`}
                >
                  {date.getDate()}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Sessions Section */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xs font-bold text-zinc-400 tracking-widest">
            SESSIONS
          </Text>
          <Pressable
            className="w-8 h-8 rounded-full bg-blue-500 items-center justify-center"
            onPress={() => setWizardVisible(true)}
          >
            <FontAwesome name="plus" size={16} color="#fff" />
          </Pressable>
        </View>

        {/* Session List */}
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {displayedSessions.length === 0 ? (
            <Text className="text-zinc-600 italic text-center mt-5">
              No sessions planned for this day.
            </Text>
          ) : (
            displayedSessions.map((session) => {
              const exCount = JSON.parse(session.exercises || "[]").length;
              return (
                <Pressable
                  key={session.id}
                  onPress={() => {
                    setEditingSession(session);
                    setWizardVisible(true);
                  }}
                  className="flex-row justify-between items-center bg-card-dark rounded-2xl p-4 mb-3 border border-zinc-800"
                >
                  <View className="flex-row items-center bg-transparent">
                    <View
                      className="w-1 h-8 rounded-full mr-4"
                      style={{ backgroundColor: session.color }}
                    />
                    <View className="bg-transparent">
                      <Text className="text-white text-base font-bold mb-0.5">
                        {session.title}
                      </Text>
                      <Text className="text-zinc-400 text-xs">
                        {exCount} Exercises • {session.frequency}
                      </Text>
                    </View>
                  </View>
                  <Pressable onPress={() => handleDeleteSession(session.id)}>
                    <FontAwesome name="trash" size={16} color="#3F3F46" />
                  </Pressable>
                </Pressable>
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
