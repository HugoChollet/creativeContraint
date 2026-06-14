import { useStyles } from "@/hooks/use-styles";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";

interface SegmentedTabOption<T extends string> {
  label: string;
  value: T;
}

interface SegmentedTabsProps<T extends string> {
  options: readonly SegmentedTabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  color?: string;
  style?: ViewStyle;
}

export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  color,
  style,
}: SegmentedTabsProps<T>) {
  const { globalStyles, colors } = useStyles();
  const activeColor = color ?? colors.tint;

  return (
    <View style={[globalStyles.tabContainer, styles.container, style]}>
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              globalStyles.tabSegment,
              isActive && { backgroundColor: activeColor },
            ]}
          >
            <Text
              style={[
                globalStyles.tabText,
                { color: isActive ? colors.invertedText : colors.text },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
});
