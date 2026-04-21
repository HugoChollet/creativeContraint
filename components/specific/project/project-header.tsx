import { useStyles } from "@/hooks/use-styles";
import { ProjectJSON } from "@/types/json-objects";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import Tooltip from "../../generic/tooltip";

interface ProjectHeaderProps {
  project: ProjectJSON;
  isEnabled?: boolean;
  onToggleProject: (name: string) => void;
  isExpanded: boolean;
  onExpand: () => void;
  color?: string;
  subtitle?: string;
}

export default function ProjectHeader({
  project,
  isEnabled = true,
  onToggleProject,
  isExpanded,
  onExpand,
  color,
  subtitle,
}: ProjectHeaderProps) {
  const { globalStyles, colors } = useStyles();

  return (
    <Pressable onPress={onExpand} style={globalStyles.headerRow}>
      <Pressable
        onPress={() => {
          onToggleProject(project.project_type);
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
            {project.project_label || project.project_type}
          </Text>
          {project.description && (
            <Tooltip
              title={project.project_label || project.project_type}
              description={project.description}
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
