import { useStyles } from "@/hooks/use-styles";
import { Option } from "@/types/constraints";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Tooltip from "../generic/tooltip";

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
      <View style={styles.textContainer}>
        <Text
          style={{
            color: colors.text,
          }}
        >
          {option.value}
        </Text>
        <Text
          style={{
            ...styles.rarityLabel,
            color: colors.textDiscreet,
          }}
        >
          {t("component:constraint-selector.difficulty") + option.rarity}
        </Text>
      </View>
      {option.description && (
        <Tooltip
          title={option.value}
          description={option.description}
          color={color}
        />
      )}
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
  textContainer: { marginLeft: 12 },
  optionValue: { fontSize: 16, color: "#333" },
  textDisabled: { color: "#aaa" },
  rarityLabel: { fontSize: 11, marginTop: 2 },
});
