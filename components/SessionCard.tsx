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
  isCompleted?: boolean;
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

export default function SessionCard({
  session,
  onPress,
  isCompleted = false,
}: SessionCardProps) {
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
    <Pressable
      onPress={isCompleted ? undefined : onPress}
      disabled={isCompleted}
      style={({ pressed }) => ({
        marginBottom: 20,
        opacity: isCompleted ? 0.9 : pressed ? 0.9 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <LinearGradient
        colors={
          isCompleted
            ? ["#2f2f35", "#18181b"] // Subtle dark gradient, almost black but with hint
            : [gradientStart, "#1E1E22"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          isCompleted && {
            borderColor: "#22C55E",
            borderWidth: 1,
            borderStyle: "solid",
          },
        ]}
      >
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              isCompleted && {
                color: "#A1A1AA",
                textDecorationLine: "line-through",
              },
            ]}
          >
            {session.title}
          </Text>
          {isCompleted && (
            <View
              style={{
                backgroundColor: "rgba(34, 197, 94, 0.15)",
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "rgba(34, 197, 94, 0.3)",
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "800",
                  color: "#22C55E",
                  letterSpacing: 0.5,
                }}
              >
                COMPLETED
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <View
            style={[styles.statsContainer, isCompleted && { opacity: 0.4 }]}
          >
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

          {isCompleted ? (
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: "#22C55E",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#22C55E",
                shadowOpacity: 0.4,
                shadowRadius: 10,
              }}
            >
              <FontAwesome name="check" size={20} color="#000" />
            </View>
          ) : (
            <View
              style={[styles.playButton, { backgroundColor: session.color }]}
            >
              <FontAwesome
                name="play"
                size={16}
                color="#fff" // White icon as requested
                style={{ marginLeft: 2 }}
              />
            </View>
          )}
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 24,
    width: "100%",
    height: 160,
    justifyContent: "space-between",
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
