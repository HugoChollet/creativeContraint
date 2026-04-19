import Crud, { Action } from "@/components/generic/crud";
import { OptionItem } from "@/components/generic/option-item";
import { useStyles } from "@/hooks/use-styles";
import { Option } from "@/types/constraints";
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

  return (
    <View
      style={[
        globalStyles.optionItem,
        { justifyContent: "space-between", padding: 4, alignItems: "center" },
      ]}
    >
      <OptionItem option={option} color={projectColor} />
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
