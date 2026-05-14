import { useProjectTranslations } from "@/hooks/use-project-translations";
import { useStyles } from "@/hooks/use-styles";
import {
  getConstraintSetProjectColor,
  getConstraintSetProjectDataSource,
} from "@/lib/constraint-set-data";
import { SavedConstraintSet } from "@/types/constraints";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Tooltip from "../../generic/tooltip";

export function ConstraintsTags({ item }: { item: SavedConstraintSet }) {
  const { globalStyles, colors, theme } = useStyles();
  const solidColor = getConstraintSetProjectColor({
    constraintSet: item,
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
          borderRadius: 0,
          overflow: "hidden",
          backgroundColor: item.color
            ? solidColor
            : colors.shadeContainer,
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
