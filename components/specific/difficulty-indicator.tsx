import { useStyles } from "@/hooks/use-styles";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

interface DifficultyIndicatorProps {
  difficultyIndicator?: number;
  isLabel?: boolean;
}

export function DifficultyIndicator({
  difficultyIndicator,
  isLabel = true,
}: DifficultyIndicatorProps) {
  const { globalStyles, colors } = useStyles();

  const getColorByValue = (value: number) => {
    if (value < 9) return colors.easy;
    if (value < 12) return colors.easyMedium;
    if (value < 15) return colors.medium;
    if (value < 18) return colors.aboveMedium;
    if (value < 21) return colors.hardMedium;
    if (value < 24) return colors.hard;
    if (value < 30) return colors.veryHard;
    return colors.impossible;
  };

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      {isLabel && <Text style={globalStyles.title}>{difficultyIndicator}</Text>}
      <Ionicons
        name="speedometer-outline"
        size={28}
        color={getColorByValue(difficultyIndicator || 0)}
      />
    </View>
  );
}
