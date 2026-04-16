import { DifficultyIndicator } from "@/components/specific/difficulty-indicator";
import { useStyles } from "@/hooks/use-styles";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ResultModalHeaderProps {
  difficultyIndicator?: number;
  onSaveConstraints: () => void;
  isSaved: boolean;
  color: string;
}

export default function ResultModalHeader({
  difficultyIndicator,
  onSaveConstraints,
  isSaved,
  color,
}: ResultModalHeaderProps) {
  const { globalStyles, colors } = useStyles();
  const { t } = useTranslation();

  return (
    <>
      <View style={styles.handle} />
      <DifficultyIndicator difficultyIndicator={difficultyIndicator} />
      <View style={styles.headerContainer}>
        <Text style={globalStyles.title}>
          {t("screen:lab.categories_title", {
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
            color={color}
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
    alignItems: "center",
    paddingBottom: 8,
    gap: 12,
  },
});
