import React from "react";
import { Pressable, PressableProps, StyleProp, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface ScaleButtonProps extends PressableProps {
  children: React.ReactNode;
  activeScale?: number;
  springConfig?: any;
  style?: StyleProp<ViewStyle>;
  className?: string; // For NativeWind
}

export function ScaleButton({
  children,
  activeScale = 0.95,
  springConfig = { damping: 50, stiffness: 500 },
  style,
  onPressIn,
  onPressOut,
  ...props
}: ScaleButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = (e: any) => {
    scale.value = withSpring(activeScale, springConfig);
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    scale.value = withSpring(1, springConfig);
    onPressOut?.(e);
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} {...props}>
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
}
