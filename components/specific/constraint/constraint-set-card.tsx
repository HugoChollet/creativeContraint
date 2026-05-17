import MetadataBadges from "@/components/generic/metadata-badges";
import { getProjectColor } from "@/constants/theme";
import { useProjectTranslations } from "@/hooks/use-project-translations";
import { useStyles } from "@/hooks/use-styles";
import {
  getConstraintSetProjectColor,
  getConstraintSetProjectDataSource,
  getConstraintSetName,
  getConstraintSetProjectLabel,
  getConstraintSetProjectLanguage,
  getConstraintSetProjectSupportedFile,
  getConstraintSetProjectTags,
} from "@/lib/constraint-set-data";
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
  const { t } = useTranslation();
  const { globalStyles, colors, theme } = useStyles();
  const constraintSetName = getConstraintSetName(item);
  const projectLabel = getConstraintSetProjectLabel(item);
  const solidColor = getConstraintSetProjectColor({
    constraintSet: item,
    theme,
  });

  const projectBackgroundColor = item.color
    ? getProjectColor({
        color: item.color,
        opacity: 0.1,
        theme,
      })
    : getProjectColor({
        label: item.project?.name ?? item.project_label,
        opacity: 0.1,
        theme,
      });

  const dataSource = useMemo(() => {
    return getConstraintSetProjectDataSource({ constraintSet: item });
  }, [item]);

  const translatedConstraints = useProjectTranslations(
    item.constraints,
    dataSource?.categories,
  );

  return (
    <View
      style={[
        globalStyles.shadeContainer,
        {
          marginBottom: 16,
          overflow: "hidden",
          backgroundColor: projectBackgroundColor,
        },
      ]}
    >
      <View style={styles.headerContainer}>
        <DifficultyIndicator difficultyIndicator={item.difficulty} />
        <View style={styles.titleBlock}>
          <Text style={[styles.constraintSetTitle, { color: solidColor }]}>
            {constraintSetName}
          </Text>
          <Text style={[globalStyles.discreetText, styles.projectLabelText]}>
            {projectLabel}
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <ShareConstraintButton
            projectLabel={projectLabel}
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
            backgroundColor: projectBackgroundColor,
          },
        ]}
      />

      <View style={{ marginBottom: 12 }}>
        <MetadataBadges
          language={getConstraintSetProjectLanguage(item)}
          supportedFile={getConstraintSetProjectSupportedFile(item)}
          tags={getConstraintSetProjectTags(item)}
          color={solidColor}
        />
      </View>

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
        {translatedConstraints.length === 0 && (
          <Text style={{ color: colors.textDiscreet }}>
            {t("screen:lab.empty_result")}
          </Text>
        )}
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
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 8,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  constraintSetTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  projectLabelText: {
    marginRight: 0,
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
