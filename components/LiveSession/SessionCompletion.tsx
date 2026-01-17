import Colors from "@/constants/Colors";
import { FontAwesome } from "@expo/vector-icons";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../ui/Button";

interface Props {
  elapsedTime: number;
  onContinue: () => void;
}

type Step = "rewards" | "level";

export interface SessionCompletionHandle {
  present: () => void;
  dismiss: () => void;
}

export const SessionCompletion = forwardRef<SessionCompletionHandle, Props>(
  ({ elapsedTime, onContinue }, ref) => {
    const [visible, setVisible] = useState(false);
    const [step, setStep] = useState<Step>("rewards");

    useImperativeHandle(ref, () => ({
      present: () => {
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
          <SafeAreaView className="flex-1 items-center justify-center p-6">
            {step === "rewards" && (
              <View className="items-center w-full">
                {/* Stage 1: Rewards */}
                <View className="items-center mb-10">
                  <View className="w-32 h-32 items-center justify-center mb-6">
                    {/* Trophy Visualization */}
                    <FontAwesome
                      name="trophy"
                      size={64}
                      color={Colors.palette.yellow400}
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
                    +60
                  </Text>
                  <Text className="text-zinc-500 font-bold text-xs tracking-widest uppercase">
                    Experience Points
                  </Text>
                </View>
              </View>
            )}

            {step === "level" && (
              <View className="items-center w-full">
                {/* Stage 2: Level Progress */}
                <View className="items-center mb-10">
                  <View className="w-32 h-32 bg-green-500 rounded-full items-center justify-center mb-6 shadow-2xl shadow-green-500/50">
                    <FontAwesome name="star" size={48} color="black" />
                  </View>

                  <Text className="text-4xl font-black text-white text-center mb-2">
                    Session Cleared
                  </Text>
                  <Text className="text-center">
                    <Text className="text-zinc-400 font-semibold tracking-wide">
                      Great work,{" "}
                    </Text>
                    <Text className="text-white font-bold">Mali.</Text>
                  </Text>
                </View>

                {/* Level Bar Card */}
                <View className="bg-card-dark w-full p-6 rounded-3xl border border-zinc-800 mb-8">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-zinc-400 font-bold text-xs uppercase">
                      Level 1
                    </Text>
                    <Text className="text-white font-bold text-xs">13%</Text>
                  </View>
                  <View className="h-4 bg-zinc-800 rounded-full overflow-hidden">
                    <View className="h-full bg-blue-500 w-[13%]" />
                  </View>
                </View>

                <Button
                  title="CONTINUE"
                  onPress={onContinue}
                  size="lg"
                  className="w-full bg-green-500"
                  textClassName="text-black font-black"
                  icon="arrow-right"
                />
              </View>
            )}
          </SafeAreaView>
        </View>
      </View>
    );
  },
);
