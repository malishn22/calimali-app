import { Button } from "@/components/ui/Button";
import Colors from "@/constants/Colors";
import { UserProfile } from "@/constants/Types";
import { FontAwesome } from "@expo/vector-icons";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  elapsedTime: number;
  onContinue: () => void;
}

type Step = "rewards" | "level";

export interface XPBreakdown {
  baseXP: number;
  bonusXP?: number;
}

export interface SessionCompletionHandle {
  present: (
    earnedXP: number,
    stats: UserProfile,
    breakdown?: XPBreakdown,
  ) => void;
  dismiss: () => void;
}

export const SessionCompletion = forwardRef<SessionCompletionHandle, Props>(
  ({ elapsedTime, onContinue }, ref) => {
    const [visible, setVisible] = useState(false);
    const [step, setStep] = useState<Step>("rewards");
    const [earnedXP, setEarnedXP] = useState(0);
    const [stats, setStats] = useState<UserProfile | null>(null);
    const [breakdown, setBreakdown] = useState<XPBreakdown | null>(null);

    useImperativeHandle(ref, () => ({
      present: (xp, newStats, xpBreakdown) => {
        setEarnedXP(xp);
        setStats(newStats);
        setBreakdown(xpBreakdown ?? { baseXP: xp });
        setStep("rewards");
        setVisible(true);
      },
      dismiss: () => {
        setVisible(false);
      },
    }));

    useEffect(() => {
      // Auto-transition to level after 3 seconds if we are in rewards
      let timer: ReturnType<typeof setTimeout>;
      if (visible && step === "rewards") {
        timer = setTimeout(() => {
          setStep("level");
        }, 3000);
      }
      return () => clearTimeout(timer);
    }, [visible, step]);

    // Handle "Continue": Parent will navigate away.
    // We can keeps it visible until unmount, or hide it.
    // Since parent navigates, unmount happens.

    if (!visible) return null;

    return (
      <View
        style={[StyleSheet.absoluteFill, { zIndex: 1000, elevation: 1000 }]}
      >
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "rgba(10, 10, 10, 0.95)" }, // Fallback/Tint
          ]}
        >
          <SafeAreaView
            className={`flex-1 items-center p-6 ${
              step === "level" ? "justify-start pt-8" : "justify-center"
            }`}
          >
            {step === "rewards" && (
              <View className="items-center w-full">
                {/* Stage 1: Rewards */}
                <View className="items-center mb-10">
                  <View className="w-32 h-32 items-center justify-center mb-6">
                    {/* Trophy Visualization */}
                    <FontAwesome
                      name="trophy"
                      size={64}
                      color={Colors.palette.solarYellow}
                    />
                    <View className="absolute w-2 h-2 bg-blue-400 rounded-full -top-2 -right-4" />
                    <View className="absolute w-3 h-3 bg-yellow-400 rounded-full top-10 -left-10" />
                  </View>

                  <Text className="text-4xl font-black text-white text-center mb-2">
                    Session Complete!
                  </Text>
                  <Text className="text-zinc-400 font-semibold tracking-wide text-center uppercase text-sm">
                    Rewards Earned
                  </Text>
                </View>

                <View className="bg-card-dark w-full p-8 rounded-3xl items-center border border-zinc-800 shadow-lg">
                  <Text className="text-6xl font-black text-blue-500 mb-2">
                    +{earnedXP}
                  </Text>
                  <Text className="text-zinc-500 font-bold text-xs tracking-widest uppercase">
                    Experience Points
                  </Text>
                </View>
              </View>
            )}

            {step === "level" && (
              <View className="items-center w-full flex-1 justify-between">
                {/* Header at top - larger */}
                <View className="items-center w-full">
                  <View className="w-32 h-32 bg-green-500 rounded-full items-center justify-center mb-5 shadow-2xl shadow-green-500/50">
                    <FontAwesome name="star" size={52} color="black" />
                  </View>
                  <Text className="text-4xl font-black text-white text-center mb-1">
                    Session Cleared
                  </Text>
                  <Text className="text-center text-lg">
                    <Text className="text-zinc-400 font-semibold tracking-wide">
                      Great work,{" "}
                    </Text>
                    <Text className="text-white font-bold">Mali.</Text>
                  </Text>
                </View>

                <View className="w-full flex-1 mt-12 justify-center">
                  <View className="bg-card-dark w-full p-5 rounded-2xl border border-zinc-800 mb-6">
                    <Text className="text-zinc-400 font-bold text-sm uppercase mb-4 tracking-wider">
                      XP Summary
                    </Text>
                    <View className="gap-3">
                      <View className="flex-row justify-between items-center">
                        <Text className="text-zinc-300 text-base">Sets completed</Text>
                        <Text className="text-blue-500 font-bold text-lg">
                          +{breakdown?.baseXP ?? earnedXP}
                        </Text>
                      </View>
                      {breakdown?.bonusXP !== undefined &&
                        breakdown.bonusXP > 0 && (
                          <View className="flex-row justify-between items-center">
                            <Text className="text-zinc-300 text-base">
                              Variety bonus
                            </Text>
                            <Text className="text-green-500 font-bold text-lg">
                              +{breakdown.bonusXP}
                            </Text>
                          </View>
                        )}
                      <View className="flex-row justify-between items-center pt-3 border-t border-zinc-800 mt-1">
                        <Text className="text-white font-bold text-base">Total</Text>
                        <Text className="text-white font-black text-xl">
                          +{earnedXP}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Level Bar Card */}
                  <View className="bg-card-dark w-full p-6 rounded-3xl border border-zinc-800">
                    <View className="flex-row justify-between items-center mb-3">
                      <Text className="text-zinc-400 font-bold text-sm uppercase">
                        Level {stats?.level ?? 1}
                      </Text>
                      <Text className="text-white font-bold text-base">
                        {stats ? Math.floor(((stats.xp % 500) / 500) * 100) : 0}%
                      </Text>
                    </View>
                    <View className="h-5 bg-zinc-800 rounded-full overflow-hidden">
                      <View
                        className="h-full bg-blue-500"
                        style={{
                          width: `${stats ? ((stats.xp % 500) / 500) * 100 : 0}%`,
                        }}
                      />
                    </View>
                  </View>
                </View>

                {/* Button pinned to bottom */}
                <View className="w-full pt-6 pb-2">
                  <Button
                    title="CONTINUE"
                    onPress={onContinue}
                    size="lg"
                    variant="completed"
                    className="w-full"
                    textClassName="font-black"
                    icon="arrow-right"
                  />
                </View>
              </View>
            )}
          </SafeAreaView>
        </View>
      </View>
    );
  },
);
