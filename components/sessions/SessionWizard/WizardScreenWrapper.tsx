import React from "react";
import { View } from "react-native";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export function WizardScreenWrapper({ children, className = "" }: Props) {
  return <View className={`flex-1 px-6 pt-6 ${className}`}>{children}</View>;
}
