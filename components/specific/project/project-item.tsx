import { useStyles } from "@/hooks/use-styles";
import { ProjectJSON } from "@/types/json-objects";
import { Project } from "@/types/projects";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Text, View } from "react-native";
import Crud, { Action, CrudActionItem } from "../../generic/crud";
import ProjectHeader from "./project-header";

interface ProjectItemProps {
  onDelete?: () => void;
  onEdit?: () => void;
  onFork?: () => void;
  onPublish?: () => void;
  projectColor: string;
  project: Project;
  selected: boolean;
  expanded: boolean;
  toggleExpand: () => void;
  type: string;
}

export default function ProjectItem({
  onDelete,
  onEdit,
  onFork,
  onPublish,
  projectColor,
  selected,
  project,
  expanded,
  toggleExpand,
  type,
}: ProjectItemProps) {
  const { globalStyles } = useStyles();
  const { t } = useTranslation();
  const [isEnabled, setIsEnabled] = useState(selected);
  const isPersonalProject =
    type === t("screen:project_browse.personal_section");
  const isCommunity = type === t("screen:project_browse.community_section");
  const [toJSONProject, setToJSONProject] = useState<ProjectJSON>({
    project_type: project.name,
    project_label: project.name,
    id: project.id,
    description: project.description,
    categories: project.categories || [],
  });

  const actions: CrudActionItem[] = [
    ...(isPersonalProject && onEdit
      ? [{ action: Action.EDIT, onPress: onEdit }]
      : []),
    ...(isPersonalProject && onDelete
      ? [{ action: Action.DELETE, onPress: onDelete }]
      : []),
    ...(isPersonalProject && onPublish
      ? [{ action: Action.PUBLISH, onPress: onPublish }]
      : []),
    ...(!isPersonalProject && onFork
      ? [{ action: Action.FORK, onPress: onFork }]
      : []),
    ...(isCommunity && onFork
      ? [
          {
            action: Action.FAVORITE,
            onPress: () => console.log("favorite ", project.name),
          },
        ]
      : []),
  ];

  return (
    <View
      style={{
        flexDirection: "row",
        gap: 12,
      }}
    >
      <View style={[globalStyles.card, { width: 300 }]}>
        <ProjectHeader
          project={toJSONProject}
          onToggleProject={() => setIsEnabled(!isEnabled)}
          isExpanded={expanded}
          onExpand={() => toggleExpand()}
          color={projectColor}
          isEnabled={isEnabled}
          subtitle={
            project.categories
              ? t("component:project_item.possibilities", {
                  count: project.categories.length,
                })
              : undefined
          }
        />
        {expanded && project.categories && (
          <FlatList
            data={project.categories}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={{ padding: 8 }}>
                <Text style={{ color: projectColor, fontWeight: "bold" }}>
                  {item.name}
                </Text>
              </View>
            )}
          />
        )}
      </View>
      <Crud actions={actions} color={projectColor} />
    </View>
  );
}
