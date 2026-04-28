import { useStyles } from "@/hooks/use-styles";
import { Option } from "@/types/constraints";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import Tooltip from "../../generic/tooltip";

export function ConstraintItem({
  option,
  color,
}: {
  option: Option;
  color?: string;
}) {
  const { t } = useTranslation();
  const { colors } = useStyles();
  return (
    <View style={styles.itemContainer}>
      <View style={styles.textContainer}>
        <Text
          style={{
            color: colors.text,
          }}
        >
          {option.value}
        </Text>
        <Text
          style={{
            ...styles.rarityLabel,
            color: colors.textDiscreet,
          }}
        >
          {t("component:constraint-selector.difficulty") + option.rarity}
        </Text>
      </View>
      {option.description && (
        <Tooltip
          title={option.value}
          description={option.description}
          color={color}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: "row",
    gap: 8,
  },
  textContainer: { marginLeft: 12 },
  optionValue: { fontSize: 16, color: "#333" },
  textDisabled: { color: "#aaa" },
  rarityLabel: { fontSize: 11, marginTop: 2 },
});
