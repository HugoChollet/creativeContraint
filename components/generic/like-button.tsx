import { Ionicons } from "@expo/vector-icons";
import { useStyles } from "@/hooks/use-styles";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

type LikeButtonProps = {
  count: number;
  isLiked: boolean;
  color: string;
  disabled?: boolean;
  isLoading?: boolean;
  onPress?: () => void;
};

export function LikeButton({
  count,
  isLiked,
  color,
  disabled = false,
  isLoading = false,
  onPress,
}: LikeButtonProps) {
  const { globalStyles } = useStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading || !onPress}
      style={[
        globalStyles.compactIconStatButton,
        (disabled || isLoading || !onPress) && styles.disabled,
      ]}
      accessibilityRole="button"
      accessibilityLabel={isLiked ? "Unlike" : "Like"}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        <Ionicons
          name={isLiked ? "heart" : "heart-outline"}
          size={18}
          color={color}
        />
      )}
      <Text style={[globalStyles.compactStatText, { color }]}>{count}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.55,
  },
});
