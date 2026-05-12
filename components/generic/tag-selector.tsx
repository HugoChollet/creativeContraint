import { getContrastingColor } from "@/constants/theme";
import { useStyles } from "@/hooks/use-styles";
import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export interface TagSelectorOption {
  label: string;
  value: string;
}

interface TagSelectorProps {
  label: string;
  options: TagSelectorOption[];
  selectedValues: readonly string[];
  onChange: (values: string[]) => void;
  helperText?: string;
  color?: string;
  singleSelect?: boolean;
  maxSelections?: number;
  alwaysEnabledValues?: readonly string[];
  maxVisibleRows?: number;
}

const DEFAULT_MAX_VISIBLE_ROWS = 3;
const CHIP_ROW_HEIGHT = 36;
const CHIP_ROW_GAP = 8;

export default function TagSelector({
  label,
  options,
  selectedValues,
  onChange,
  helperText,
  color,
  singleSelect = false,
  maxSelections,
  alwaysEnabledValues = [],
  maxVisibleRows = DEFAULT_MAX_VISIBLE_ROWS,
}: TagSelectorProps) {
  const { globalStyles, colors } = useStyles();
  const activeColor = color ?? colors.tint;
  const displayedOptions = useMemo(
    () =>
      [...options].sort((left, right) =>
        left.label.localeCompare(right.label, undefined, {
          sensitivity: "base",
        }),
      ),
    [options],
  );
  const chipsMaxHeight =
    Math.max(1, maxVisibleRows) * CHIP_ROW_HEIGHT +
    Math.max(0, maxVisibleRows - 1) * CHIP_ROW_GAP;

  const handlePress = (value: string) => {
    if (singleSelect) {
      onChange([value]);
      return;
    }

    const isSelected = selectedValues.includes(value);

    if (isSelected) {
      onChange(selectedValues.filter((item) => item !== value));
      return;
    }

    onChange([...selectedValues, value]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[globalStyles.label, styles.label]}>{label}</Text>
        {helperText ? (
          <Text style={[globalStyles.discreetText, styles.helperText]}>
            {helperText}
          </Text>
        ) : null}
      </View>

      <ScrollView
        nestedScrollEnabled={true}
        style={[styles.scrollWrapper, { maxHeight: chipsMaxHeight }]}
        contentContainerStyle={styles.chipsRow}
      >
        {displayedOptions.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          const isDisabled =
            !singleSelect &&
            !isSelected &&
            maxSelections !== undefined &&
            selectedValues.length >= maxSelections &&
            !alwaysEnabledValues.includes(option.value);

          return (
            <Pressable
              key={option.value}
              onPress={() => {
                if (isDisabled) return;
                handlePress(option.value);
              }}
              style={[
                styles.chip,
                {
                  borderColor: isSelected ? activeColor : colors.borderColor,
                  backgroundColor: isSelected ? activeColor : "transparent",
                  opacity: isDisabled ? 0.45 : 1,
                },
              ]}
            >
              <Text
                style={[
                  globalStyles.text,
                  styles.chipText,
                  {
                    color: isSelected
                      ? getContrastingColor(activeColor, "primary")
                      : colors.text,
                  },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  label: { marginBottom: 0 },
  helperText: { marginRight: 0 },
  scrollWrapper: {
    paddingRight: 4,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 12,
  },
});
