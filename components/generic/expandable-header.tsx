import { useStyles } from "@/hooks/use-styles";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MetadataBadges from "./metadata-badges";
import Tooltip from "./tooltip";

interface ExpandableHeaderProps {
  title: string;
  description?: string;
  language?: string | null;
  tags?: readonly string[] | null;
  isEnabled?: boolean;
  onToggle?: () => void;
  isExpanded: boolean;
  onExpand?: () => void;
  color?: string;
  subtitle?: string;
}

export default function ExpandableHeader({
  title,
  description,
  language,
  tags,
  isEnabled = true,
  onToggle,
  isExpanded,
  onExpand,
  color,
  subtitle,
}: ExpandableHeaderProps) {
  const { globalStyles, colors } = useStyles();

  return (
    <Pressable
      onPress={onExpand}
      style={[globalStyles.headerRow, { borderRadius: "12px" }]}
    >
      {onToggle && (
        <Pressable
          onPress={() => {
            onToggle();
          }}
        >
          <Ionicons
            name={isEnabled ? "checkbox" : "square-outline"}
            size={24}
            color={isEnabled ? color : colors.textDiscreet}
          />
        </Pressable>
      )}

      <View style={[globalStyles.titleArea, styles.contentArea]}>
        <View style={styles.headerLeft}>
          <View
            style={[
              globalStyles.elementAndDescriptorContainer,
              styles.titleRow,
            ]}
          >
            <Text
              style={[
                globalStyles.text,
                { color: isEnabled ? colors.text : colors.textDiscreet },
              ]}
            >
              {title}
            </Text>
            {description && (
              <Tooltip title={title} description={description} color={color} />
            )}
          </View>

          <MetadataBadges
            language={language}
            tags={tags}
            size="small"
            color={color}
            textColor={isEnabled ? colors.textDiscreet : colors.disable}
          />
        </View>
        <View style={styles.trailingControls}>
          {subtitle && (
            <Text
              numberOfLines={1}
              style={[
                globalStyles.discreetText,
                styles.subtitle,
                { color: isEnabled ? colors.textDiscreet : colors.disable },
              ]}
            >
              {subtitle}
            </Text>
          )}
          {onExpand && (
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color={isEnabled ? colors.textDiscreet : colors.disable}
            />
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  contentArea: {
    alignItems: "stretch",
    gap: 8,
  },
  headerLeft: {
    gap: 4,
  },
  titleRow: {
    flex: 1,
  },
  trailingControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
  },
  subtitle: {
    textAlign: "right",
    flexShrink: 1,
  },
});
