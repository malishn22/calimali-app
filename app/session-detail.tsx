import SessionDetailContent from "@/components/sessions/SessionDetailContent";
import { SessionHistory } from "@/constants/Types";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Platform, Pressable, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SessionDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  let session: SessionHistory | null = null;

  try {
    if (typeof params.session === "string") {
      session = JSON.parse(params.session);
    }
  } catch (e) {
    console.error("Failed to parse session param", e);
  }

  if (!session) {
    return (
      <SafeAreaView className="flex-1 bg-background-dark items-center justify-center">
        <Text className="text-zinc-500">Session not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-background-dark"
      edges={["left", "right", "bottom"]}
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      {/* Back button */}
      <View className="px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="arrow-left" size={22} color="#A1A1AA" />
        </Pressable>
      </View>

      <SessionDetailContent session={session} />
    </SafeAreaView>
  );
}
