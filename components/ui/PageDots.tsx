import React from "react";
import { View } from "react-native";

interface PageDotsProps {
  count: number;
  activeIndex: number;
}

export function PageDots({ count, activeIndex }: PageDotsProps) {
  return (
    <View className="flex-row items-center justify-center gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${
            i === activeIndex ? "bg-white" : "bg-zinc-700"
          }`}
        />
      ))}
    </View>
  );
}
