import { Ionicons } from "@expo/vector-icons";
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
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading || !onPress}
      style={[
        styles.button,
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
      <Text style={[styles.count, { color }]}>{count}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 36,
    height: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  count: {
    fontSize: 12,
    fontWeight: "700",
  },
  disabled: {
    opacity: 0.55,
  },
});
