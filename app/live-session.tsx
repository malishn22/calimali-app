import LiveSession from "@/components/sessions/LiveSession";
import { ScheduledSession, SessionHistory } from "@/constants/Types";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

export default function LiveSessionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  let session: ScheduledSession | null = null;

  try {
    if (typeof params.session === "string") {
      session = JSON.parse(params.session);
    }
  } catch (e) {
    console.error("Failed to parse session param", e);
  }

  const handleClose = () => {
    router.back();
  };

  const handleComplete = (data: SessionHistory) => {
    const { InteractionManager } = require("react-native");
    InteractionManager.runAfterInteractions(() => {
      router.replace("/");
    });
  };

  if (!session) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center">
        <Text className="text-white">Error loading session.</Text>
      </View>
    );
  }

  return (
    <LiveSession
      session={session}
      onClose={handleClose}
      onComplete={handleComplete}
    />
  );
}
