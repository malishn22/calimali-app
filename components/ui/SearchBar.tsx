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
  ...props
}: SearchBarProps) {
  return (
    <Input
      icon="search"
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      containerClassName={containerClassName}
      inputContainerClassName={inputContainerClassName}
      className={className}
      {...props}
    />
  );
}
