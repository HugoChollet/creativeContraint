import { getProjectColor } from "@/constants/theme";
import { useProjectTranslations } from "@/hooks/use-project-translations";
import { useStyles } from "@/hooks/use-styles";
import { ConstraintSetDataJSON, SavedConstraintSet } from "@/types/constraints";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Tooltip from "../generic/tooltip";
import { DifficultyIndicator } from "./difficulty-indicator";
import ShareConstraintButton from "./share-constraint-set";

const typeMapping: Record<string, string> = {
  music: "music",
  book: "book",
  photography: "photo",
  "video fiction": "videoFiction",
  "internet video": "videoInternet",
  cooking: "cooking",
};

export function ConstraintsSetCard({
  item,
  deleteRecord,
  submit,
}: {
  item: SavedConstraintSet;
  deleteRecord: (id: number | string) => void;
  submit: () => void;
}) {
  const { i18n, t } = useTranslation();
  const { globalStyles, colors } = useStyles();
  const solidColor = getProjectColor(item.project_type, 1);

  const typeKey = typeMapping[item.project_type.toLowerCase()] || "book";

  const dataSource = useMemo(() => {
    const data = i18n.getResourceBundle(
      i18n.language,
      typeKey,
    ) as ConstraintSetDataJSON;
    return data || { constraints: [] };
  }, [i18n.language, typeKey]);

  const translatedConstraints = useProjectTranslations(
    item.constraints,
    dataSource.categories,
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
      <View style={styles.headerContainer}>
        <DifficultyIndicator difficultyIndicator={item.difficulty} />
        <Text style={[globalStyles.title, { color: solidColor }]}>
          {(dataSource.project_label ?? dataSource.project_type).toUpperCase()}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <ShareConstraintButton
            project_type={dataSource.project_label ?? item.project_type}
            constraints={translatedConstraints}
            difficulty={item.difficulty}
            color={solidColor}
          />

          <TouchableOpacity onPress={() => deleteRecord(item.id)}>
            <Ionicons name="trash-outline" size={20} color={solidColor} />
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={[
          styles.circleDecorator,
          {
            backgroundColor: getProjectColor(item.project_type, 0.1),
          },
        ]}
      />

      <View style={styles.tagContainer}>
        {translatedConstraints.map(({ label, displayValue, description }) => (
          <View key={label} style={globalStyles.tag}>
            <Text style={{ fontSize: 12, color: colors.textDiscreet }}>
              {label}
            </Text>
            <View style={globalStyles.elementAndDescriptorContainer}>
              <Text style={{ color: colors.text, fontWeight: "600" }}>
                {displayValue}
              </Text>
              {description && (
                <Tooltip
                  title={label}
                  description={description}
                  color={solidColor}
                />
              )}
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[
          globalStyles.borderButton,
          { borderColor: solidColor, marginTop: 12 },
        ]}
        onPress={submit}
      >
        <Text style={{ color: solidColor }}>
          {t("component:constraint-set-card.upload")}
        </Text>
      </TouchableOpacity>
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
    gap: 8,
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
