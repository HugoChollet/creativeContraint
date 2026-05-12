import { getContrastingColor } from "@/constants/theme";
import { useStyles } from "@/hooks/use-styles";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Pressable, ScrollView, Text, View, ViewStyle } from "react-native";

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

const DEFAULT_MAX_VISIBLE_ROWS = 2;
const CHIP_ROW_HEIGHT = 36;
const CHIP_ROW_GAP = 8;
const HEIGHT_OFFSET = 28;

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
  const shouldSeparateSelectedValues = !singleSelect;
  const selectedValueSet = useMemo(
    () => new Set(selectedValues),
    [selectedValues],
  );
  const sortedOptions = useMemo(
    () =>
      [...options].sort((left, right) =>
        left.label.localeCompare(right.label, undefined, {
          sensitivity: "base",
        }),
      ),
    [options],
  );
  const selectedOptions = useMemo(
    () =>
      shouldSeparateSelectedValues
        ? sortedOptions.filter((option) => selectedValueSet.has(option.value))
        : [],
    [selectedValueSet, shouldSeparateSelectedValues, sortedOptions],
  );
  const displayedOptions = useMemo(
    () =>
      shouldSeparateSelectedValues
        ? sortedOptions.filter((option) => !selectedValueSet.has(option.value))
        : sortedOptions,
    [selectedValueSet, shouldSeparateSelectedValues, sortedOptions],
  );
  const chipsMaxHeight =
    Math.max(1, maxVisibleRows) * CHIP_ROW_HEIGHT +
    Math.max(0, maxVisibleRows - 1) * CHIP_ROW_GAP +
    HEIGHT_OFFSET;

  const colorContrast = getContrastingColor(activeColor, "primary");

  const handlePress = (value: string) => {
    if (singleSelect) {
      onChange([value]);
      return;
    }

    const isSelected = selectedValueSet.has(value);

    if (isSelected) {
      onChange(selectedValues.filter((item) => item !== value));
      return;
    }

    onChange([...selectedValues, value]);
  };

  const getChipStyle = (
    isSelected: boolean,
    isDisabled: boolean,
  ): ViewStyle[] => [
    globalStyles.tag,
    {
      borderRadius: 999,
      minHeight: 36,
      justifyContent: "center",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderColor: isSelected ? activeColor : colors.borderColor,
      backgroundColor: isSelected ? activeColor : "transparent",
      opacity: isDisabled ? 0.45 : 1,
    },
  ];

  const renderAvailableChip = (option: TagSelectorOption) => {
    const isSelected = selectedValueSet.has(option.value);
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
        style={getChipStyle(isSelected, isDisabled)}
      >
        <Text
          style={[
            globalStyles.text,
            {
              fontSize: 12,
              color: isSelected ? colorContrast : colors.text,
            },
          ]}
        >
          {option.label}
        </Text>
      </Pressable>
    );
  };

  const renderSelectedChip = (option: TagSelectorOption) => (
    <Pressable
      key={`selected-${option.value}`}
      onPress={() => handlePress(option.value)}
      style={[
        globalStyles.tag,
        globalStyles.elementAndDescriptorContainer,
        {
          borderRadius: 999,
          minHeight: 36,
          justifyContent: "center",
          paddingHorizontal: 12,
          paddingVertical: 8,
          gap: 6,
          borderColor: activeColor,
          backgroundColor: activeColor,
        },
      ]}
    >
      <Text
        style={[
          globalStyles.text,
          {
            fontSize: 12,
            color: colorContrast,
          },
        ]}
      >
        {option.label}
      </Text>
      <Ionicons name="close" size={14} color={colorContrast} />
    </Pressable>
  );

  return (
    <View style={{ marginBottom: 20 }}>
      <View
        style={[
          globalStyles.rowBetween,
          { justifyContent: "space-between", marginBottom: 8 },
        ]}
      >
        <Text style={[globalStyles.label, { marginBottom: 0, flex: 1 }]}>
          {label}
        </Text>
        {helperText ? (
          <Text
            style={[
              globalStyles.discreetText,
              { marginRight: 0, flexShrink: 1, textAlign: "right" },
            ]}
          >
            {helperText}
          </Text>
        ) : null}
      </View>

      {selectedOptions.length > 0 ? (
        <View style={[globalStyles.wrapRow, { marginBottom: 8 }]}>
          {selectedOptions.map((option) => renderSelectedChip(option))}
        </View>
      ) : null}

      <ScrollView
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={displayedOptions.length > 0}
        style={{ maxHeight: chipsMaxHeight, paddingRight: 4 }}
        contentContainerStyle={globalStyles.wrapRow}
      >
        {displayedOptions.map((option) => renderAvailableChip(option))}
      </ScrollView>
    </View>
  );
}
