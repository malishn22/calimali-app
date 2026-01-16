import { Button } from "@/components/ui/Button";
import Colors from "@/constants/Colors";
import {
  clearAllData,
  getSessionHistory,
  SessionHistory,
} from "@/services/Database";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useIsFocused } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "HISTORY">(
    "OVERVIEW"
  );
  const [history, setHistory] = useState<SessionHistory[]>([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadHistory();
    }
  }, [isFocused]);

  const loadHistory = async () => {
    const data = await getSessionHistory();
    setHistory(data);
  };

  const handleEraseData = () => {
    Alert.alert(
      "Erase All Data",
      "Are you sure you want to delete all your sessions, history and stats? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Erase",
          style: "destructive",
          onPress: async () => {
            await clearAllData();
            Alert.alert("Data Cleared", "Please restart the app.");
            loadHistory();
          },
        },
      ]
    );
  };

  const renderOverview = () => (
    <>
      {/* Level Card */}
      <View className="bg-card-dark rounded-2xl p-6 mb-6 border border-zinc-800 relative overflow-hidden">
        <View className="flex-row justify-between items-start mb-5 bg-transparent">
          <View className="bg-transparent">
            <Text className="text-zinc-400 font-bold text-xs mb-2 tracking-widest">
              CURRENT LEVEL
            </Text>
            <Text className="text-5xl font-extrabold text-white leading-[56px]">
              1
            </Text>
          </View>
          <View className="px-3 py-1.5 rounded-3xl bg-yellow-400/15 border border-yellow-400/30">
            <Text className="text-yellow-400 font-extrabold text-[10px]">
              ELITE
            </Text>
          </View>
        </View>

        {/* Background Trophy Restored */}
        <View className="absolute right-5 top-5 opacity-10">
          <FontAwesome name="trophy" size={120} color="#FACC15" />
        </View>

        <View className="mt-5 bg-transparent">
          <View className="flex-row justify-between mb-2 bg-transparent">
            <Text className="text-[10px] font-bold text-yellow-400">
              XP PROGRESS
            </Text>
            <Text className="text-[10px] font-bold text-zinc-500">130 XP</Text>
          </View>
          <View className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <View className="h-full bg-yellow-400 rounded-full w-[30%]" />
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <View className="flex-row flex-wrap gap-3 mb-6">
        {/* Workouts */}
        <View className="bg-card-dark rounded-3xl p-5 w-[47%] mb-3">
          <Feather
            name="activity"
            size={18}
            color={Colors.palette.blue500}
            style={{ marginBottom: 12 }}
          />
          <Text className="text-2xl font-bold text-white mb-1">
            {history.length}
          </Text>
          <Text className="text-[10px] font-bold text-zinc-600 tracking-wider">
            TOTAL WORKOUTS
          </Text>
        </View>

        {/* Reps */}
        <View className="bg-card-dark rounded-3xl p-5 w-[47%] mb-3">
          <Feather
            name="trending-up"
            size={18}
            color={Colors.palette.green500}
            style={{ marginBottom: 12 }}
          />
          <Text className="text-2xl font-bold text-white mb-1">30</Text>
          <Text className="text-[10px] font-bold text-zinc-600 tracking-wider">
            TOTAL REPS
          </Text>
        </View>

        {/* Current Streak */}
        <View className="bg-card-dark rounded-3xl p-5 w-[47%] mb-3">
          <Feather
            name="zap"
            size={18}
            color={Colors.palette.orange500}
            style={{ marginBottom: 12 }}
          />
          <Text className="text-2xl font-bold text-white mb-1">
            1 <Text className="text-xs font-semibold text-zinc-400">DAYS</Text>
          </Text>
          <Text className="text-[10px] font-bold text-zinc-600 tracking-wider">
            CURRENT STREAK
          </Text>
        </View>

        {/* Best Streak */}
        <View className="bg-card-dark rounded-3xl p-5 w-[47%] mb-3">
          <Feather
            name="github"
            size={18}
            color={Colors.palette.purple500}
            style={{ marginBottom: 12 }}
          />
          <Text className="text-2xl font-bold text-white mb-1">
            1 <Text className="text-xs font-semibold text-zinc-400">DAYS</Text>
          </Text>
          <Text className="text-[10px] font-bold text-zinc-600 tracking-wider">
            BEST STREAK
          </Text>
        </View>
      </View>

      {/* Streak Started Panel */}
      <View className="bg-card-dark rounded-3xl p-6 w-full mb-6 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-white mb-1">
            Jan 15, 2026
          </Text>
          <Text className="text-[10px] font-bold text-zinc-600 tracking-wider">
            STREAK STARTED
          </Text>
        </View>
        <Feather
          name="calendar"
          size={24}
          color={Colors.palette.zinc600}
          style={{ opacity: 0.5 }}
        />
      </View>
    </>
  );

  const renderHistory = () => (
    <View>
      {history.length === 0 ? (
        <View className="p-10 items-center justify-center bg-card-dark rounded-2xl border border-dashed border-zinc-700 mt-2">
          <Text className="text-white text-base font-bold mb-1">
            No History Yet
          </Text>
          <Text className="text-zinc-500 text-xs">
            Complete a workout to see it here.
          </Text>
        </View>
      ) : (
        history.map((item, idx) => {
          // Parse performance data if needed, or just show date/time
          const date = new Date(item.date).toLocaleDateString();
          const time = new Date(item.date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          let perf = { elapsedTime: 0, exercises: [] };
          try {
            perf = JSON.parse(item.performance_data);
          } catch (e) {}

          const duration =
            Math.floor(perf.elapsedTime / 60) +
            "m " +
            (perf.elapsedTime % 60) +
            "s";
          const exerciseCount = perf.exercises ? perf.exercises.length : 0;

          return (
            <View
              key={item.id || idx}
              className="bg-card-dark rounded-2xl p-4 mb-3 flex-row justify-between items-center"
            >
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-xl bg-green-500/10 justify-center items-center">
                  <Feather
                    name="check"
                    size={16}
                    color={Colors.palette.green500}
                  />
                </View>
                <View>
                  <Text className="text-white text-sm font-bold">
                    Workout Session
                  </Text>
                  <Text className="text-zinc-500 text-[10px] mt-0.5 font-semibold">
                    {date} • {time}
                  </Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-white text-sm font-bold tabular-nums">
                  {duration}
                </Text>
                <Text className="text-zinc-600 text-[10px] mt-0.5 font-bold">
                  {exerciseCount} Exercises
                </Text>
              </View>
            </View>
          );
        })
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background-dark" edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-3xl font-extrabold text-white">
            Profile & Stats
          </Text>
          <Button
            variant="secondary"
            size="sm"
            onPress={handleEraseData}
            icon="sliders"
            iconColor={Colors.palette.zinc400}
            className="w-10 h-10 !p-0 bg-card-dark justify-center items-center"
            style={{ borderRadius: 9999 }}
          />
        </View>

        {/* Toggle Sections */}
        <View className="flex-row bg-card-dark rounded-xl p-1 mb-6">
          <Pressable
            className={`flex-1 py-2.5 rounded-lg items-center ${
              activeTab === "OVERVIEW" ? "bg-zinc-800" : ""
            }`}
            onPress={() => setActiveTab("OVERVIEW")}
          >
            <Text
              className={`font-bold text-xs ${
                activeTab === "OVERVIEW" ? "text-white" : "text-zinc-500"
              }`}
            >
              OVERVIEW
            </Text>
          </Pressable>
          <Pressable
            className={`flex-1 py-2.5 items-center ${
              activeTab === "HISTORY" ? "bg-zinc-800 rounded-lg" : ""
            }`}
            onPress={() => setActiveTab("HISTORY")}
          >
            <Text
              className={`font-bold text-xs ${
                activeTab === "HISTORY" ? "text-white" : "text-zinc-500"
              }`}
            >
              HISTORY
            </Text>
          </Pressable>
        </View>

        {activeTab === "OVERVIEW" ? renderOverview() : renderHistory()}
      </ScrollView>
    </SafeAreaView>
  );
}
