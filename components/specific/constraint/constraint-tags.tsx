import { getProjectColor } from "@/constants/theme";
import { useProjectTranslations } from "@/hooks/use-project-translations";
import { useStyles } from "@/hooks/use-styles";
import { ConstraintSetDataJSON, SavedConstraintSet } from "@/types/constraints";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import Tooltip from "../../generic/tooltip";

const typeMapping: Record<string, string> = {
  music: "music",
  book: "book",
  photography: "photo",
  "video fiction": "videoFiction",
  "internet video": "videoInternet",
  cooking: "cooking",
};

export function ConstraintsTags({ item }: { item: SavedConstraintSet }) {
  const { i18n } = useTranslation();
  const { globalStyles, colors, theme } = useStyles();
  const solidColor = getProjectColor(item.project_type, 1, theme);

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
          borderRadius: 0,
          overflow: "hidden",
          backgroundColor: getProjectColor(item.project_type, 0.1, theme),
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
