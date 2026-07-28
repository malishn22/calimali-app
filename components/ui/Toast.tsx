import { FontAwesome } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ToastProps {
  visible: boolean;
  message: string;
  /** How long the toast stays up before auto-hiding, in ms. */
  duration?: number;
  variant?: "default" | "error";
  onHide: () => void;
  /** Extra clearance above the safe-area bottom inset, e.g. to clear a caller's own bottom bar. */
  bottomOffset?: number;
  side?: "left" | "right";
}

export function Toast({
  visible,
  message,
  duration = 2000,
  variant = "default",
  onHide,
  bottomOffset = 24,
  side = "right",
}: ToastProps) {
  const insets = useSafeAreaInsets();
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(side === "right" ? 40 : -40);

  useEffect(() => {
    if (!visible) return;

    opacity.value = withTiming(1, { duration: 180 });
    translateX.value = withTiming(0, { duration: 220 });
    const timer = setTimeout(() => {
      const offscreen = side === "right" ? 40 : -40;
      opacity.value = withTiming(0, { duration: 180 });
      translateX.value = withTiming(offscreen, { duration: 200 });
      setTimeout(onHide, 200);
    }, duration);

    return () => clearTimeout(timer);
  }, [visible, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  if (!visible) return null;

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        bottom: insets.bottom + bottomOffset,
        [side]: 16,
        zIndex: 100,
      }}
    >
      <Animated.View
        style={[
          {
            maxWidth: 260,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 8,
          },
          animatedStyle,
        ]}
        className="flex-row items-center gap-2 bg-zinc-900 rounded-2xl px-4 py-3 border border-zinc-800"
      >
        {variant === "error" && (
          <FontAwesome name="exclamation-circle" size={14} color="#EF4444" />
        )}
        <Text className="text-white font-bold text-sm shrink">{message}</Text>
      </Animated.View>
    </View>
  );
}
