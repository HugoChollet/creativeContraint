import Crud, { Action } from "@/components/generic/crud";
import { Item } from "@/components/generic/item";
import { useStyles } from "@/hooks/use-styles";
import { Option } from "@/types/constraints";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

interface ConstraintSelectorFormProps {
  onDelete: () => void;
  onEdit: () => void;
  generatorColor: string;
  option: Option;
}

export default function ConstraintCrud({
  onDelete,
  onEdit,
  generatorColor,
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
        subtitle={
          t("component:constraint-selector.difficulty") + option.difficulty
        }
        description={option.description}
        color={generatorColor}
      />
      <Crud
        actions={[
          { action: Action.EDIT, onPress: onEdit },
          { action: Action.DELETE, onPress: onDelete },
        ]}
        color={generatorColor}
      />
    </View>
  );
}
