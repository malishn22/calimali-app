import { Text } from "@/components/Themed";
import Colors from "@/constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Profile & Stats</Text>

        {/* Toggle Sections */}
        <View style={styles.toggleContainer}>
          <Pressable style={styles.activeTab}>
            <Text style={styles.activeTabText}>OVERVIEW</Text>
          </Pressable>
          <Pressable style={styles.inactiveTab}>
            <Text style={styles.inactiveTabText}>HISTORY</Text>
          </Pressable>
        </View>

        {/* Level Card */}
        <View style={styles.levelCard}>
          <View
            style={[styles.levelHeader, { backgroundColor: "transparent" }]}
          >
            <View style={{ backgroundColor: "transparent" }}>
              <Text style={styles.levelLabel}>CURRENT LEVEL</Text>
              <Text style={styles.levelValue}>1</Text>
            </View>
            <View style={[styles.badge, styles.eliteBadge]}>
              <Text style={styles.badgeText}>ELITE</Text>
            </View>
          </View>

          {/* Background Trophy Restored */}
          <View style={styles.trophyContainer}>
            <FontAwesome
              name="trophy"
              size={120}
              color="#FACC15"
              style={{ opacity: 0.1 }}
            />
          </View>

          <View style={[styles.xpSection, { backgroundColor: "transparent" }]}>
            <View style={[styles.xpHeader, { backgroundColor: "transparent" }]}>
              <Text style={styles.xpLabel}>XP PROGRESS</Text>
              <Text style={styles.xpValue}>130 XP</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: "30%" }]} />
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Workouts */}
          <View style={styles.statCard}>
            <Feather
              name="activity"
              size={18}
              color={Colors.palette.blue500}
              style={{ marginBottom: 12 }}
            />
            <Text style={styles.statNumber}>2</Text>
            <Text style={styles.statTitle}>TOTAL WORKOUTS</Text>
          </View>

          {/* Reps */}
          <View style={styles.statCard}>
            <Feather
              name="trending-up"
              size={18}
              color={Colors.palette.green500}
              style={{ marginBottom: 12 }}
            />
            <Text style={styles.statNumber}>30</Text>
            <Text style={styles.statTitle}>TOTAL REPS</Text>
          </View>

          {/* Current Streak */}
          <View style={styles.statCard}>
            <Feather
              name="zap"
              size={18}
              color={Colors.palette.orange500}
              style={{ marginBottom: 12 }}
            />
            <Text style={styles.statNumber}>
              1 <Text style={styles.statUnit}>DAYS</Text>
            </Text>
            <Text style={styles.statTitle}>CURRENT STREAK</Text>
          </View>

          {/* Best Streak */}
          <View style={styles.statCard}>
            <FontAwesome
              name="trophy"
              size={18}
              color={Colors.palette.purple500}
              style={{ marginBottom: 12 }}
            />
            <Text style={styles.statNumber}>
              1 <Text style={styles.statUnit}>DAYS</Text>
            </Text>
            <Text style={styles.statTitle}>BEST STREAK</Text>
          </View>
        </View>

        {/* Streak Started Panel */}
        <View style={styles.streakDateCard}>
          <View>
            <Text style={styles.statNumber}>Jan 15, 2026</Text>
            <Text style={styles.statTitle}>STREAK STARTED</Text>
          </View>
          <Feather
            name="calendar"
            size={24}
            color={Colors.palette.zinc600}
            style={{ opacity: 0.5 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  container: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 24,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#1E1E22",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  activeTab: {
    flex: 1,
    backgroundColor: "#27272A",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  inactiveTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  inactiveTabText: {
    color: "#71717A",
    fontWeight: "700",
    fontSize: 12,
  },
  statLabel: {
    color: Colors.palette.white,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  statSubtext: {
    color: Colors.palette.zinc500,
    fontSize: 10,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  levelCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderColor: Colors.palette.zinc800,
    borderWidth: 1,
    position: "relative",
    overflow: "hidden",
  },
  levelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  levelLabel: {
    color: Colors.palette.zinc400,
    fontWeight: "700",
    fontSize: 12,
    marginBottom: 8,
    letterSpacing: 1,
  },
  levelValue: {
    fontSize: 48,
    fontWeight: "800",
    color: "#fff",
    lineHeight: 56,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  eliteBadge: {
    backgroundColor: "rgba(250, 204, 21, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(250, 204, 21, 0.3)",
  },
  badgeText: {
    color: "#FACC15",
    fontWeight: "800",
    fontSize: 10,
  },
  trophyContainer: {
    position: "absolute",
    right: 20,
    top: 20,
  },
  xpSection: {
    marginTop: 20,
  },
  xpHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  xpLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: Colors.palette.yellow400,
  },
  xpValue: {
    fontSize: 10,
    fontWeight: "700",
    color: "#71717A",
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "#27272A",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#FACC15",
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
    // Removed background color and padding to separate panels
  },
  statCard: {
    backgroundColor: "#1E1E22",
    borderRadius: 20,
    padding: 20,
    width: "47%", // roughly half - gap
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  statUnit: {
    fontSize: 12,
    fontWeight: "600",
    color: "#A1A1AA",
  },
  statTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "#52525B", // Zinc-600
    letterSpacing: 0.5,
  },
  streakDateCard: {
    backgroundColor: "#1E1E22",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    marginBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
