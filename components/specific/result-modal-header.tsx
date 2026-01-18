import { Colors } from "@/constants/theme";
import { useStyles } from "@/hooks/use-styles";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ResultModalHeaderProps {
  difficultyIndicator?: number;
  onSaveConstraints: () => void;
  isSaved: boolean;
}

export default function ResultModalHeader({
  difficultyIndicator,
  onSaveConstraints,
  isSaved,
}: ResultModalHeaderProps) {
  const { globalStyles, colors } = useStyles();
  const { t } = useTranslation();

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
    <>
      <View style={styles.handle} />

      <View style={styles.headerContainer}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={globalStyles.title}>{difficultyIndicator}</Text>
          <Ionicons
            name="speedometer-outline"
            size={28}
            color={getColorByValue(difficultyIndicator || 0)}
          />
        </View>
        <Text style={globalStyles.title}>
          {t("screen:lab.constraints_title", {
            type: "Project",
          })}
        </Text>
        <TouchableOpacity
          style={globalStyles.transparentButton}
          onPress={onSaveConstraints}
        >
          <Ionicons
            size={28}
            name={isSaved ? "bookmark" : "bookmark-outline"}
            color={colors.tint}
          />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#444",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingBottom: 8,
    gap: 12,
  },
});
