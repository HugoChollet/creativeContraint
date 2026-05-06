import { Item } from "@/components/generic/item";
import MetadataBadges from "@/components/generic/metadata-badges";
import { useStyles } from "@/hooks/use-styles";
import { ProjectJSON } from "@/types/json-objects";
import { Project } from "@/types/projects";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
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
  onToggleProject: () => void;
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
  onToggleProject,
  type,
}: ProjectItemProps) {
  const { globalStyles } = useStyles();
  const { t } = useTranslation();
  const isPersonalProject =
    type === t("screen:project_browse.personal_section");
  const isCommunity = type === t("screen:project_browse.community_section");
  const toJSONProject: ProjectJSON = {
    project_type: project.name,
    project_label: project.name,
    id: project.id,
    description: project.description,
    language: project.language ?? undefined,
    tags: project.tags ?? undefined,
    categories: project.categories,
  };

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
          onToggleProject={onToggleProject}
          isExpanded={expanded}
          onExpand={() => toggleExpand()}
          color={projectColor}
          isEnabled={selected}
          subtitle={
            project.categories
              ? t("component:project_item.categories_counter", {
                  count: project.categories.length,
                })
              : undefined
          }
        />
        {project.tags?.length ? (
          <View style={{ padding: 8 }}>
            <MetadataBadges tags={project.tags} color={projectColor} />
          </View>
        ) : (
          <></>
        )}
        {expanded && project.categories && (
          <FlatList
            data={project.categories}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={{ padding: 8 }}>
                <Item
                  title={item.name}
                  subtitle={t("component:project_item.constraints_counter", {
                    count: item.options.length,
                  })}
                  description={item.description}
                  color={projectColor}
                />
              </View>
            )}
          />
        )}
      </View>
      <Crud actions={actions} color={projectColor} />
    </View>
  );
}
