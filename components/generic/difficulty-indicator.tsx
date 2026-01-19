import { Colors } from "@/constants/theme";
import { useStyles } from "@/hooks/use-styles";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

interface DifficultyIndicatorProps {
  difficultyIndicator?: number;
}

export function DifficultyIndicator({
  difficultyIndicator,
}: DifficultyIndicatorProps) {
  const { globalStyles } = useStyles();

  const getColorByValue = (value: number) => {
    if (value < 9) return Colors.easy;
    if (value < 12) return Colors.easyMedium;
    if (value < 15) return Colors.medium;
    if (value < 18) return Colors.aboveMedium;
    if (value < 21) return Colors.hardMedium;
    if (value < 24) return Colors.hard;
    if (value < 30) return Colors.veryHard;
    return Colors.black;
  };

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Text style={globalStyles.title}>{difficultyIndicator}</Text>
      <Ionicons
        name="speedometer-outline"
        size={28}
        color={getColorByValue(difficultyIndicator || 0)}
      />
    </View>
  );
}
