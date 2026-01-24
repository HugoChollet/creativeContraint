import { useStyles } from "@/hooks/use-styles";
import { IoniconsName } from "@/types/Icons";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface FloatingButtonProps {
  onPress: () => void;
  color?: string;
  disabled?: boolean;
  icon?: IoniconsName;
  label?: string;
  bottom?: number;
  right?: number;
}

export function FloatingButton({
  onPress,
  color,
  disabled = false,
  icon,
  label,
  bottom,
  right,
}: FloatingButtonProps) {
  const { globalStyles, colors } = useStyles();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          bottom: bottom ?? "50%",
          right: right,
          boxShadow: `${color} 0px 0px 4.65px`,
        },
        disabled && { opacity: 0.7 },
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <BlurView
        intensity={20}
        tint={colors.background === "#fff" ? "light" : "dark"}
        style={styles.blurWrapper}
        experimentalBlurMethod="dimezisBlurView"
      >
        {label && (
          <Text style={[globalStyles.text, disabled && { opacity: 0.5 }]}>
            {label}
          </Text>
        )}
        {icon && (
          <Ionicons
            name={icon}
            size={24}
            color={disabled ? colors.disable : colors.text}
          />
        )}
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  blurWrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  button: {
    position: "absolute",
    borderRadius: 32,
    elevation: 8,
    overflow: "hidden",
  },
});
