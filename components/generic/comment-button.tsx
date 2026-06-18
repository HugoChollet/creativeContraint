import { useStyles } from "@/hooks/use-styles";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity } from "react-native";

type CommentButtonProps = {
  count: number;
  color: string;
  onPress?: () => void;
};

export function CommentButton({ count, color, onPress }: CommentButtonProps) {
  const { globalStyles } = useStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={globalStyles.compactIconStatButton}
      accessibilityRole="button"
      accessibilityLabel="Comments"
    >
      <Ionicons name="chatbubble-outline" size={18} color={color} />
      <Text style={[globalStyles.compactStatText, { color }]}>{count}</Text>
    </TouchableOpacity>
  );
}
