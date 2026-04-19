import Crud from "@/components/generic/crud";
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
      <Crud onDelete={onDelete} onEdit={onEdit} color={projectColor} />
    </View>
  );
}
