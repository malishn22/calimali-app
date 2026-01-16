import {
  CalendarData,
  CalendarLoader,
} from "@/services/loaders/CalendarLoader";
import React, { createContext, useContext, useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

interface CacheState {
  isReady: boolean;
  calendarData: CalendarData | null;
  refreshCalendar: () => Promise<void>;
}

const CacheContext = createContext<CacheState | undefined>(undefined);

export function useCache() {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error("useCache must be used within a CacheProvider");
  }
  return context;
}

export function CacheProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);

  useEffect(() => {
    initializeSystem();
  }, []);

  const initializeSystem = async () => {
    try {
      // The "Conveyor Belt": Execute loaders in parallel or sequence
      console.log("[CacheContext] Starting initialization...");
      const calData = await CalendarLoader.load();
      setCalendarData(calData);

      console.log("[CacheContext] System Ready.");
      setIsReady(true);
    } catch (e) {
      console.error("Failed to initialize system:", e);
      // Handle error state appropriately
    }
  };

  const refreshCalendar = async () => {
    const calData = await CalendarLoader.load();
    setCalendarData(calData);
  };

  if (!isReady) {
    // Basic Loading Screen - can be replaced with Splash Screen logic
    return (
      <View className="flex-1 items-center justify-center bg-background-dark">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-zinc-400 mt-4 text-xs font-mono">
          INITIALIZING SYSTEM...
        </Text>
      </View>
    );
  }

  return (
    <CacheContext.Provider value={{ isReady, calendarData, refreshCalendar }}>
      {children}
    </CacheContext.Provider>
  );
}
