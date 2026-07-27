import React from "react";
import Animated, { FadeInDown } from "react-native-reanimated";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export function WizardScreenWrapper({ children, className = "" }: Props) {
  return (
    <Animated.View
      entering={FadeInDown.duration(600)}
      className={`flex-1 px-6 pt-6 ${className}`}
    >
      {children}
    </Animated.View>
  );
}
