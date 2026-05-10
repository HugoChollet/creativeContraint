import { getProjectColor } from "@/constants/theme";
import { useProjectTranslations } from "@/hooks/use-project-translations";
import { useStyles } from "@/hooks/use-styles";
import {
  getBundledProjectData,
  getProjectTitle,
} from "@/lib/project-data";
import { SavedConstraintSet } from "@/types/constraints";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Tooltip from "../../generic/tooltip";
import { DifficultyIndicator } from "../difficulty-indicator";
import ShareConstraintButton from "../share-constraint-set";

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
  const { globalStyles, colors, theme } = useStyles();
  const solidColor = getProjectColor({ label: item.project_type, theme });

  const dataSource = useMemo(() => {
    return getBundledProjectData({
      projectType: item.project_type,
      language: i18n.language,
    });
  }, [i18n.language, item.project_type]);

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
          backgroundColor: getProjectColor({
            label: item.project_type,
            opacity: 0.1,
            theme,
          }),
        },
      ]}
    >
      <View style={styles.headerContainer}>
        <DifficultyIndicator difficultyIndicator={item.difficulty} />
        <Text style={[globalStyles.title, { color: solidColor }]}>
          {getProjectTitle(dataSource).toUpperCase()}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <ShareConstraintButton
            project_type={getProjectTitle(dataSource)}
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
            backgroundColor: getProjectColor({
              label: item.project_type,
              opacity: 0.1,
              theme,
            }),
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
