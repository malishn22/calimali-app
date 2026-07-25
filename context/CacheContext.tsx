import { useAuth } from "@/context/AuthContext";
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
  const { token } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);

  // Only load authenticated data once we have a token. On sign-out, reset so a
  // later sign-in re-initializes from scratch.
  useEffect(() => {
    if (token) {
      initializeSystem();
    } else {
      setIsReady(false);
      setCalendarData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

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

  // Only block on the loader when authenticated and still initializing. When
  // there's no token, render children so the login screen can show.
  if (token && !isReady) {
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
