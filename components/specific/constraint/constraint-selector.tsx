import { OptionItem } from "@/components/generic/option-item";
import { useStyles } from "@/hooks/use-styles";
import { Option } from "@/types/constraints";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet } from "react-native";

interface OptionProps {
  option: Option;
  isSelected: boolean;
  isParentEnabled: boolean;
  color?: string;
  onToggle: (id: number) => void;
}

export function ConstraintSelector({
  option,
  isSelected,
  isParentEnabled,
  color,
  onToggle,
}: OptionProps) {
  const { t } = useTranslation();
  const { colors } = useStyles();

  return (
    <Pressable
      style={styles.optionRow}
      onPress={() => onToggle(option.id)}
      disabled={!isParentEnabled}
    >
      <Ionicons
        name={isSelected ? "checkmark-circle" : "ellipse-outline"}
        size={22}
        color={isSelected ? color : colors.textDiscreet}
      />
      <OptionItem option={option} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
});
