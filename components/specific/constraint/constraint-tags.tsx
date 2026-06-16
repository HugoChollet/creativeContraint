import { getGeneratorColor } from "@/constants/theme";
import { useGeneratorTranslations } from "@/hooks/use-generator-translations";
import { useStyles } from "@/hooks/use-styles";
import { getConstraintSetGeneratorDataSource } from "@/lib/constraint-set-data";
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
  const solidColor = getGeneratorColor({
    color: constraintSet.color?.toString(),
    theme,
    opacity: 0.1,
  });

  const dataSource = useMemo(() => {
    return getConstraintSetGeneratorDataSource({ constraintSet: constraintSet });
  }, [constraintSet]);

  const translatedConstraints = useGeneratorTranslations(
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
