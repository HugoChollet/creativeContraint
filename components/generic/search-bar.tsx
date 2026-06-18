import { useStyles } from "@/hooks/use-styles";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput, View, ViewStyle } from "react-native";

interface SearchBarProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  style?: ViewStyle;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder,
  style,
}: SearchBarProps) {
  const { globalStyles, colors } = useStyles();

  return (
    <View style={[styles.container, style]}>
      <Ionicons name="search" size={18} color={colors.textDiscreet} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        style={[globalStyles.input, styles.input]}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    height: 44,
  },
});
