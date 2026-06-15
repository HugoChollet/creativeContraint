import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

type CommentButtonProps = {
  count: number;
  color: string;
  onPress?: () => void;
};

export function CommentButton({ count, color, onPress }: CommentButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel="Comments"
    >
      <Ionicons name="chatbubble-outline" size={18} color={color} />
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
});
