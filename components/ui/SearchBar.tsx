import React from "react";
import { TextInputProps } from "react-native";
import { Input } from "./Input";

interface SearchBarProps extends Omit<TextInputProps, "value" | "onChangeText"> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  containerClassName?: string;
  inputContainerClassName?: string;
  className?: string;
}

/**
 * Reusable search bar with magnifying glass icon.
 * Use for search/filter inputs across the app.
 */
export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search movements...",
  containerClassName = "",
  inputContainerClassName = "",
  className = "",
  style,
  ...props
}: SearchBarProps) {
  return (
    <Input
      icon="search"
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      containerClassName={containerClassName}
      // Drop Input's py-2.5 and set a compact height; trailing classes win.
      // h-10 (40px) matches the vault's category filter pills, which stretch to
      // fill their h-10 row. Keep it literal — NativeWind only picks up static classes.
      inputContainerClassName={`py-0 h-14 ${inputContainerClassName}`}
      className={className}
      // Zero the TextInput's own padding so it doesn't inflate the box, and drop
      // Android's extra font padding so the text sits centred in the 44px field.
      style={[
        { paddingVertical: 0, includeFontPadding: false, height: "100%" },
        style,
      ]}
      {...props}
    />
  );
}
