import { useStyles } from "@/hooks/use-styles";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity } from "react-native";

interface AddButtonProps {
  generatorColor: string;
  label: string;
  onClick: () => void;
}

export const AddButton = ({ generatorColor, label, onClick }: AddButtonProps) => {
  const { globalStyles } = useStyles();

  return (
    <TouchableOpacity
      style={[
        globalStyles.mediaIntegrationContainer,
        {
          borderColor: generatorColor,
        },
      ]}
      onPress={onClick}
    >
      <Ionicons name="add" size={32} color={generatorColor} />
      <Text style={[globalStyles.text, { color: generatorColor }]}>{label}</Text>
    </TouchableOpacity>
  );
};
