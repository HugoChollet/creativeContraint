import { useStyles } from "@/hooks/use-styles";
import { Option } from "@/types/constraints";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface OptionProps {
  option: Option;
  isSelected: boolean;
  isParentEnabled: boolean;
  onToggle: (id: number) => void;
}

export function ConstraintOption({
  option,
  isSelected,
  isParentEnabled,
  onToggle,
}: OptionProps) {
  const { t } = useTranslation();
  const { globalStyles, colors } = useStyles();

  return (
    <Pressable
      style={styles.optionRow}
      onPress={() => onToggle(option.id)}
      disabled={!isParentEnabled}
    >
      <Ionicons
        name={isSelected ? "checkmark-circle" : "ellipse-outline"}
        size={22}
        color={
          !isParentEnabled
            ? colors.text
            : isSelected
            ? colors.tint
            : colors.disable
        }
      />
      <View style={styles.textContainer}>
        <Text
          style={{
            color:
              !isSelected || !isParentEnabled ? colors.disable : colors.text,
          }}
        >
          {option.value}
        </Text>
        <Text
          style={{
            ...styles.rarityLabel,
            color:
              !isSelected || !isParentEnabled
                ? colors.disable
                : colors.textDiscreet,
          }}
        >
          {t("component:constraint-option.difficulty") + option.rarity}
        </Text>
      </View>
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
