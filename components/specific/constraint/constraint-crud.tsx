import Crud, { Action } from "@/components/generic/crud";
import { Item } from "@/components/generic/item";
import { useStyles } from "@/hooks/use-styles";
import { Option } from "@/types/constraints";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

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
  const { globalStyles } = useStyles();
  const { t } = useTranslation();

  return (
    <View
      style={[
        globalStyles.optionItem,
        { justifyContent: "space-between", padding: 4, alignItems: "center" },
      ]}
    >
      <Item
        title={option.value}
        subtitle={t("component:constraint-selector.difficulty") + option.rarity}
        description={option.description}
        color={projectColor}
      />
      <Crud
        actions={[
          { action: Action.EDIT, onPress: onEdit },
          { action: Action.DELETE, onPress: onDelete },
        ]}
        color={projectColor}
      />
    </View>
  );
}
