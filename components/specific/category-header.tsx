import { useStyles } from "@/hooks/use-styles";
import { CategoryJSON } from "@/types/json-objects";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import Tooltip from "../generic/tooltip";

interface CategoryHeaderProps {
  category: CategoryJSON;
  isEnabled?: boolean;
  onToggleCategory: (name: string) => void;
  isExpanded: boolean;
  onExpand: () => void;
  color?: string;
  subtitle?: string;
}

export default function CategoryHeader({
  category,
  isEnabled = true,
  onToggleCategory,
  isExpanded,
  onExpand,
  color,
  subtitle,
}: CategoryHeaderProps) {
  const { globalStyles, colors } = useStyles();

  return (
    <Pressable onPress={onExpand} style={globalStyles.headerRow}>
      <Pressable
        onPress={() => {
          onToggleCategory(category.name);
        }}
      >
        <Ionicons
          name={isEnabled ? "checkbox" : "square-outline"}
          size={24}
          color={isEnabled ? color : colors.textDiscreet}
        />
      </Pressable>

      <View style={globalStyles.titleArea}>
        <View style={globalStyles.elementAndDescriptorContainer}>
          <Text
            style={[
              globalStyles.text,
              { color: isEnabled ? colors.text : colors.textDiscreet },
            ]}
          >
            {category.label || category.name}
          </Text>
          {category.description && (
            <Tooltip
              title={category.label || category.name}
              description={category.description}
              color={color}
            />
          )}
        </View>
        <Text
          style={[
            globalStyles.discreetText,
            { color: isEnabled ? colors.textDiscreet : colors.disable },
          ]}
        >
          {subtitle}
        </Text>
      </View>
      <Ionicons
        name={isExpanded ? "chevron-up" : "chevron-down"}
        size={20}
        color={isEnabled ? colors.textDiscreet : colors.disable}
      />
    </Pressable>
  );
}
