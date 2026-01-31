import { Colors, getProjectColor } from "@/constants/theme";
import { useProjectTranslations } from "@/hooks/use-project-translations";
import { useStyles } from "@/hooks/use-styles";
import { ProjectData } from "@/types/constraints";
import { SavedProjectConstraints } from "@/types/data";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { DifficultyIndicator } from "./difficulty-indicator";

const typeMapping: Record<string, string> = {
  // TODO unify with lab.tsx and json files project_type keys
  music: "music",
  book: "book",
  photography: "photo",
  "video fiction": "videoFiction",
  "video internet": "videoInternet",
  cooking: "cooking",
};

export function ConstraintsSetCard({
  item,
  deleteRecord,
}: {
  item: SavedProjectConstraints;
  deleteRecord: (id: number) => void;
}) {
  const { i18n } = useTranslation();
  const { globalStyles, colors } = useStyles();

  const typeKey = typeMapping[item.project_type.toLowerCase()] || "book";

  const dataSource = useMemo(() => {
    const data = i18n.getResourceBundle(i18n.language, typeKey) as ProjectData;
    return data || { constraints: [] };
  }, [i18n.language, typeKey]);

  const { translatedConstraints } = useProjectTranslations(
    item.constraints,
    dataSource.constraints,
  );

  return (
    <View
      style={[
        globalStyles.shadeContainer,
        {
          marginBottom: 16,
          overflow: "hidden",
          backgroundColor: getProjectColor(item.project_type, 0.1),
        },
      ]}
    >
      {/* Header: Project Type & Difficulty */}
      <View style={styles.headerContainer}>
        <DifficultyIndicator difficultyIndicator={item.difficulty} />
        <Text style={[globalStyles.title, { color: colors.text }]}>
          {(dataSource.project_label ?? dataSource.project_type).toUpperCase()}
        </Text>

        <TouchableOpacity onPress={() => deleteRecord(item.id)}>
          <Ionicons name="trash-outline" size={20} color={Colors.alert} />
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.circleDecorator,
          {
            backgroundColor: getProjectColor(item.project_type, 0.1),
          },
        ]}
      />

      {/* Constraints Tags Section */}
      <View style={styles.tagContainer}>
        {translatedConstraints.map(({ label, displayValue }) => (
          <View key={label} style={globalStyles.tag}>
            <Text style={{ fontSize: 12, color: colors.textDiscreet }}>
              {label}
            </Text>
            <Text style={{ color: colors.text, fontWeight: "600" }}>
              {displayValue}
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
