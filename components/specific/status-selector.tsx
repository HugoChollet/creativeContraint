import { useStyles } from "@/hooks/use-styles";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

export type PresetMode = "none" | "easy" | "custom" | "hard" | "all";

interface StatusSelectorProps {
  currentMode: PresetMode;
  onSelect: (mode: PresetMode) => void;
  disabled?: boolean;
}

export function StatusSelector({
  currentMode,
  onSelect,
  disabled,
}: StatusSelectorProps) {
  const { t } = useTranslation();
  const { globalStyles, colors } = useStyles();

  const MODES: { id: PresetMode; color: string }[] = [
    { id: "none", color: "#8E8E93" },
    { id: "easy", color: colors.easy },
    { id: "custom", color: colors.custom },
    { id: "hard", color: colors.hard },
    { id: "all", color: "#000000" },
  ];
  return (
    <View style={[globalStyles.tabContainer, disabled && { opacity: 0.5 }]}>
      {MODES.map((mode) => {
        const isActive = currentMode === mode.id;

        return (
          <Pressable
            key={mode.id}
            disabled={disabled}
            onPress={() => onSelect(mode.id)}
            style={({ pressed }) => [
              globalStyles.tabSegment,
              {
                // Background is full color if active, very pale if not
                backgroundColor: isActive ? mode.color : `${mode.color}15`,
                borderColor: isActive ? mode.color : "transparent",
                transform: [{ scale: pressed ? 0.96 : 1 }],
              },
            ]}
          >
            <Text
              style={[
                globalStyles.tabText,
                { color: isActive ? "#fff" : mode.color },
              ]}
            >
              {t("component:status." + mode.id)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
