import { useStyles } from "@/hooks/use-styles";
import { Option } from "@/types/constraints";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Tooltip from "../../generic/tooltip";

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
      <View
        style={[
          globalStyles.optionItem,
          { justifyContent: "space-between", padding: 4 },
        ]}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            flex: 1,
          }}
        >
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
        <View style={styles.crud}>
          <TouchableOpacity
            style={globalStyles.transparentButton}
            onPress={() => onEdit()}
            disabled={option.value === ""}
          >
            <Ionicons
              name="pencil-sharp"
              size={24}
              color={option.value === "" ? colors.disable : projectColor}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={globalStyles.transparentButton}
            onPress={() => onDelete()}
            disabled={option.value === ""}
          >
            <Ionicons
              name="trash-sharp"
              size={24}
              color={option.value === "" ? colors.disable : projectColor}
            />
          </TouchableOpacity>
        </View>
      </View>
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
  crud: {
    flexDirection: "row",
    gap: 16,
  },
});
