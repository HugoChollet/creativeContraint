import { useStyles } from "@/hooks/use-styles";
import { Option } from "@/types/constraints";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { Spacer } from "../generic/spacer";
import Tooltip from "../generic/tooltip";

interface ConstraintSelectorFormProps {
  onDelete: () => void;
  onEdit: () => void;
  projectColor: string;
  option: Option;
}

export default function ConstraintCrud({
  onDelete,
  onEdit,
  projectColor,
  option,
}: ConstraintSelectorFormProps) {
  const { globalStyles, colors } = useStyles();
  const projectColorSoft = projectColor.replace(/[\d.]+\)$/g, `0.2)`);
  const { t } = useTranslation();

  return (
    <>
      <View style={[globalStyles.optionItem, { justifyContent: "flex-start" }]}>
        <View>
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
        {!!option.description && (
          <Tooltip
            title={option.value}
            description={option.description}
            color={projectColor}
          />
        )}
      </View>
      <Spacer divider={true} />
      <Spacer height={8} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  rarityLabel: { fontSize: 11, marginTop: 2 },
});
