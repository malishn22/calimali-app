import Colors from "@/constants/Colors";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof FontAwesome.glyphMap;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  icon,
  containerClassName = "",
  className = "",
  ...props
}: InputProps) {
  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && (
        <Text className="text-zinc-500 text-xs font-bold tracking-widest mb-2.5 uppercase">
          {label}
        </Text>
      )}
      <View className="flex-row items-center bg-card-dark rounded-xl px-4 py-3.5 border border-transparent focus:border-blue-500">
        {icon && (
          <FontAwesome
            name={icon}
            size={16}
            color={Colors.palette.zinc600}
            style={{ marginRight: 12 }}
          />
        )}
        <TextInput
          placeholderTextColor={Colors.palette.zinc600}
          className={`flex-1 text-white text-base font-semibold h-6 leading-5 ${className}`} // h-6 fixes vertical alignment
          {...props}
        />
      </View>
      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
    </View>
  );
}
