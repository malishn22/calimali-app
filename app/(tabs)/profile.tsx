import Colors from "@/constants/Colors";
import { SessionHistory, UserProfile } from "@/constants/Types";
import { Api } from "@/services/api";
import { getLevelRank, getLevelRequirement } from "@/utilities/Gamification";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import SessionDetailSheet from "@/components/sessions/SessionDetailSheet";

// ... imports remain ...

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "HISTORY">(
    "OVERVIEW",
  );
  const [history, setHistory] = useState<SessionHistory[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Sheet State
  const [selectedSession, setSelectedSession] = useState<SessionHistory | null>(
    null,
  );
  const [detailVisible, setDetailVisible] = useState(false);

  // Cache timestamp to avoid excessive API calls
  const lastFetchTime = useRef<number>(0);
  const CACHE_DURATION_MS = 30000; // 30 seconds cache

  const loadHistory = useCallback(async () => {
    const now = Date.now();
    // Skip if data was fetched recently (within cache duration)
    if (now - lastFetchTime.current < CACHE_DURATION_MS) {
      return;
    }

    lastFetchTime.current = now;
    
    // Fetch both API calls in parallel for better performance
    try {
      const [historyData, profileData] = await Promise.all([
        Api.getSessionHistory(),
        Api.getUserProfile(),
      ]);
      setHistory(historyData);
      setProfile(profileData);
    } catch (error) {
      console.error("Failed to load profile data:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  // ... loadHistory and renderOverview remain ...

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
            <Pressable
              key={item.id || idx}
              className="bg-card-dark rounded-2xl p-4 mb-3 flex-row justify-between items-center active:bg-zinc-800"
              onPress={() => {
                setSelectedSession(item);
                setDetailVisible(true);
              }}
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
            </Pressable>
          );
        })
      )}
    </View>
  );


  const renderOverview = () => (
    <>
      <View className="bg-card-dark rounded-2xl p-6 mb-6 border border-zinc-800 relative overflow-hidden">
        <View className="flex-row justify-between items-start mb-5 bg-transparent">
          <View className="bg-transparent">
            <Text className="text-zinc-400 font-bold text-xs mb-2 tracking-widest">
              CURRENT LEVEL
            </Text>
            <Text className="text-5xl font-extrabold text-white leading-[56px]">
              {profile?.level || 1}
            </Text>
          </View>
          <View className="px-3 py-1.5 rounded-3xl bg-yellow-400/15 border border-yellow-400/30">
            <Text className="text-yellow-400 font-extrabold text-[10px]">
              {getLevelRank(profile?.level || 1)}
            </Text>
          </View>
        </View>

        <View className="absolute right-5 top-5 opacity-10">
          <FontAwesome name="trophy" size={120} color="#FACC15" />
        </View>

        <View className="mt-5 bg-transparent">
          <View className="flex-row justify-between mb-2 bg-transparent">
            <Text className="text-[10px] font-bold text-yellow-400">
              XP PROGRESS
            </Text>
            <Text className="text-[10px] font-bold text-zinc-500">
              {profile
                ? `${profile.xp} / ${getLevelRequirement(profile.level)} XP (Next Level)`
                : "0 XP"}
            </Text>
          </View>
          <View className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <View
              className="h-full bg-yellow-400 rounded-full"
              style={{
                width: `${profile ? Math.min(100, ((profile.xp % getLevelRequirement(profile.level)) / getLevelRequirement(profile.level)) * 100) : 0}%`,
              }}
            />
          </View>
        </View>
      </View>

      <View className="flex-row flex-wrap gap-3 mb-6">
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
            TOTAL SESSIONS
          </Text>
        </View>

        <View className="bg-card-dark rounded-3xl p-5 w-[47%] mb-3">
          <Feather
            name="trending-up"
            size={18}
            color={Colors.palette.green500}
            style={{ marginBottom: 12 }}
          />
          <Text className="text-2xl font-bold text-white mb-1">
            {profile?.total_reps || 0}
          </Text>
          <Text className="text-[10px] font-bold text-zinc-600 tracking-wider">
            TOTAL REPS
          </Text>
        </View>

        <View className="bg-card-dark rounded-3xl p-5 w-[47%] mb-3">
          <Feather
            name="zap"
            size={18}
            color={Colors.palette.orange500}
            style={{ marginBottom: 12 }}
          />
          <Text className="text-2xl font-bold text-white mb-1">
            {profile?.streak_current || 0}{" "}
            <Text className="text-xs font-semibold text-zinc-400">DAYS</Text>
          </Text>
          <Text className="text-[10px] font-bold text-zinc-600 tracking-wider">
            CURRENT STREAK
          </Text>
        </View>

        <View className="bg-card-dark rounded-3xl p-5 w-[47%] mb-3">
          <Feather
            name="github"
            size={18}
            color={Colors.palette.purple500}
            style={{ marginBottom: 12 }}
          />
          <Text className="text-2xl font-bold text-white mb-1">
            {profile?.streak_best || 0}{" "}
            <Text className="text-xs font-semibold text-zinc-400">DAYS</Text>
          </Text>
          <Text className="text-[10px] font-bold text-zinc-600 tracking-wider">
            BEST STREAK
          </Text>
        </View>
      </View>

      <View className="bg-card-dark rounded-3xl p-6 w-full mb-6 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-white mb-1">
            {profile?.streak_current &&
            profile.streak_current > 0 &&
            profile.streak_start_date
              ? new Date(profile.streak_start_date).toLocaleDateString()
              : "-"}
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

  return (
    <SafeAreaView
      className="flex-1 bg-background-dark"
      edges={["left", "right", "bottom"]}
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        {/* ... Header and Toggles remain ... */}

        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-3xl font-extrabold text-white">
            Profile & Stats
          </Text>
        </View>

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

      {/* Detail Sheet */}
      <SessionDetailSheet
        visible={detailVisible}
        session={selectedSession}
        onClose={() => setDetailVisible(false)}
      />
    </SafeAreaView>
  );
}
