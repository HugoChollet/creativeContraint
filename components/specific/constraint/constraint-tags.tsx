import { getProjectColor } from "@/constants/theme";
import { useProjectTranslations } from "@/hooks/use-project-translations";
import { useStyles } from "@/hooks/use-styles";
import { getBundledProjectData } from "@/lib/project-data";
import { SavedConstraintSet } from "@/types/constraints";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import Tooltip from "../../generic/tooltip";

export function ConstraintsTags({ item }: { item: SavedConstraintSet }) {
  const { i18n } = useTranslation();
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
          borderRadius: 0,
          overflow: "hidden",
          backgroundColor: getProjectColor({
            label: item.project_type,
            opacity: 0.1,
            theme,
          }),
        },
      ]}
    >
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
    </View>
  );
}

export const styles = StyleSheet.create({
  tagContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
