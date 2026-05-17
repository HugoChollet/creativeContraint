import { getProjectColor } from "@/constants/theme";
import { useProjectTranslations } from "@/hooks/use-project-translations";
import { useStyles } from "@/hooks/use-styles";
import { getConstraintSetProjectDataSource } from "@/lib/constraint-set-data";
import { SavedConstraintSet } from "@/types/constraints";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Tooltip from "../../generic/tooltip";

export function ConstraintsTags({
  constraintSet,
}: {
  constraintSet: SavedConstraintSet;
}) {
  const { globalStyles, colors, theme } = useStyles();
  const solidColor = getProjectColor({
    color: constraintSet.color?.toString(),
    theme,
    opacity: 0.1,
  });

  const dataSource = useMemo(() => {
    return getConstraintSetProjectDataSource({ constraintSet: constraintSet });
  }, [constraintSet]);

  const translatedConstraints = useProjectTranslations(
    constraintSet.constraints,
    dataSource?.categories,
  );

  return (
    <View
      style={[
        globalStyles.shadeContainer,
        {
          borderRadius: 0,
          overflow: "hidden",
          backgroundColor: constraintSet.color
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
