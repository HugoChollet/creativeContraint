import { Colors } from "@/constants/theme";
import { useStyles } from "@/hooks/use-styles";
import { SavedProjectConstraints } from "@/types/data";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { DifficultyIndicator } from "./difficulty-indicator";

export function ConstraintsSetCard({
  item,
  deleteRecord,
}: {
  item: SavedProjectConstraints;
  deleteRecord: (id: number) => void;
}) {
  const { t } = useTranslation();
  const { globalStyles, colors } = useStyles();
  const constraintKeys = Object.keys(item.constraints);

  return (
    <View
      style={[
        globalStyles.shadeContainer,
        {
          marginBottom: 16,
          overflow: "hidden",
        },
      ]}
    >
      {/* Header: Project Type & Difficulty */}
      <View style={styles.headerContainer}>
        <DifficultyIndicator difficultyIndicator={item.difficulty} />
        <Text style={[globalStyles.title, { color: colors.text }]}>
          {item.project_type.toUpperCase()}
        </Text>

        <TouchableOpacity onPress={() => deleteRecord(item.id)}>
          <Ionicons name="trash-outline" size={20} color={Colors.alert} />
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.circleDecorator,
          {
            backgroundColor: colors.cookingShade,
          },
        ]}
      />

      {/* Constraints Tags Section */}
      <View style={styles.tagContainer}>
        {constraintKeys.map((key) => (
          <View key={key} style={globalStyles.tag}>
            <Text style={{ fontSize: 12, color: colors.textDiscreet }}>
              {key}:{" "}
              <Text style={{ color: colors.text, fontWeight: "600" }}>
                {item.constraints[key].value}
              </Text>
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export const styles = StyleSheet.create({
  tagContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  circleDecorator: {
    position: "absolute",
    right: -40,
    top: 120,
    width: 250,
    height: 250,
    borderRadius: "50%",
  },
});
