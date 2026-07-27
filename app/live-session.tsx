import LiveSession from "@/components/sessions/LiveSession";
import { Routine, SessionHistory } from "@/constants/Types";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

export default function LiveSessionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  let routine: Routine | null = null;

  try {
    if (typeof params.routine === "string") {
      routine = JSON.parse(params.routine);
    }
  } catch (e) {
    console.error("Failed to parse routine param", e);
  }

  const handleClose = () => {
    router.back();
  };

  const handleComplete = (data: SessionHistory) => {
    requestIdleCallback(() => {
      router.replace("/");
    });
  };

  if (!routine) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center">
        <Text className="text-white">Error loading session.</Text>
      </View>
    );
  }

  return (
    <LiveSession
      routine={routine}
      onClose={handleClose}
      onComplete={handleComplete}
    />
  );
}
