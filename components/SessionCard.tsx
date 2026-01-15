import { ScheduledSession } from "@/services/Database";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { Pressable, StyleSheet } from "react-native";
import { Text, View } from "./Themed";

import { SessionColors } from "@/constants/Colors";

interface SessionCardProps {
  session: ScheduledSession;
  onPress?: () => void;
}

// Map SessionColors (Bright) to Mid-Dark Variants (700-ish) for smoother Gradient
const GradientMap: Record<string, string> = {
  [SessionColors.BLUE]: "#1D4ED8", // Blue 700
  [SessionColors.GREEN]: "#15803D", // Green 700
  [SessionColors.RED]: "#B91C1C", // Red 700
  [SessionColors.ORANGE]: "#C2410C", // Orange 700
  [SessionColors.PURPLE]: "#7E22CE", // Purple 700
  [SessionColors.PINK]: "#BE185D", // Pink 700
};

export default function SessionCard({ session, onPress }: SessionCardProps) {
  const gradientStart = GradientMap[session.color] || session.color; // Fallback

  const totalSets = useMemo(() => {
    try {
      const exercises = JSON.parse(session.exercises);
      return exercises.reduce(
        (acc: number, ex: any) => acc + (ex.sets?.length || 0),
        0
      );
    } catch {
      return 0;
    }
  }, [session.exercises]);

  return (
    <LinearGradient
      colors={[gradientStart, "#1E1E22"]} // Dark Color -> Card Dark (Placeholder style)
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{session.title}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>EXP</Text>
            <Text style={styles.statValue}>+{totalSets * 10}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>VOLUME</Text>
            <Text style={styles.statValue}>{totalSets} Sets</Text>
          </View>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.playButton,
            { backgroundColor: session.color, opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={onPress}
        >
          <FontAwesome
            name="play"
            size={16}
            color="#fff" // White icon as requested
            style={{ marginLeft: 2 }}
          />
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 24,
    width: "100%",
    height: 160,
    justifyContent: "space-between",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    maxWidth: "80%",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18181B",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  statItem: {
    backgroundColor: "transparent",
  },
  statLabel: {
    fontSize: 10,
    color: "#A1A1AA",
    fontWeight: "700",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "700",
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: "#3F3F46",
    marginHorizontal: 12,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
