import { useStyles } from "@/hooks/use-styles";
import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export enum Action {
  EDIT = "edit",
  FORK = "fork",
  DELETE = "delete",
  ADD = "add",
  PUBLISH = "publish",
  FAVORITE = "favorite",
}

type CrudIconName = ComponentProps<typeof Ionicons>["name"];

export interface CrudActionItem {
  action: Action;
  onPress: () => void;
}

interface CrudProps {
  actions: CrudActionItem[];
  disabled?: boolean;
  color?: string;
}

const ACTION_ICONS: Record<Action, CrudIconName> = {
  [Action.EDIT]: "pencil-sharp",
  [Action.FORK]: "git-branch-sharp",
  [Action.DELETE]: "trash-sharp",
  [Action.ADD]: "add-sharp",
  [Action.PUBLISH]: "cloud-upload-sharp",
  [Action.FAVORITE]: "bookmark-sharp",
};

export default function Crud({ actions, disabled, color }: CrudProps) {
  const { globalStyles, colors } = useStyles();

  return (
    <View style={styles.crud}>
      {actions.map(({ action, onPress }, index) => (
        <TouchableOpacity
          key={`${action}-${index}`}
          style={globalStyles.transparentButton}
          onPress={onPress}
          disabled={disabled}
        >
          <Ionicons
            name={ACTION_ICONS[action]}
            size={24}
            color={disabled ? colors.disable : color || colors.tint}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  crud: {
    flexDirection: "row",
    gap: 16,
  },
});
