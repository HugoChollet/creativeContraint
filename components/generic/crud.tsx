import { useStyles } from "@/hooks/use-styles";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface CrudProps {
  onDelete: () => void;
  onEdit: () => void;
  disabled?: boolean;
  color?: string;
}

export default function Crud({ onDelete, onEdit, disabled, color }: CrudProps) {
  const { globalStyles, colors } = useStyles();

  return (
    <View style={styles.crud}>
      <TouchableOpacity
        style={globalStyles.transparentButton}
        onPress={() => onEdit()}
        disabled={disabled}
      >
        <Ionicons
          name="pencil-sharp"
          size={24}
          color={disabled ? colors.disable : color || colors.tint}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={globalStyles.transparentButton}
        onPress={() => onDelete()}
        disabled={disabled}
      >
        <Ionicons
          name="trash-sharp"
          size={24}
          color={disabled ? colors.disable : color || colors.tint}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  crud: {
    flexDirection: "row",
    gap: 16,
  },
});
