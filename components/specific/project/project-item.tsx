import ExpandableHeader from "@/components/generic/expandable-header";
import { Item } from "@/components/generic/item";
import { useStyles } from "@/hooks/use-styles";
import { Project } from "@/types/projects";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Crud, { Action, CrudActionItem } from "../../generic/crud";

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
  ];

  return (
    <View
      style={{
        flexDirection: "row",
        gap: 12,
      }}
    >
      <View style={[globalStyles.card, { width: "100%" }]}>
        <ExpandableHeader
          title={project.name}
          description={project.description}
          tags={project.tags}
          onToggle={onToggleProject}
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
        {expanded && (
          <>
            <Crud actions={actions} color={projectColor} />
            <View>
              {project.categories
                ? project.categories.map((item) => (
                    <View key={item.id.toString()} style={{ padding: 8 }}>
                      <Item
                        title={item.name}
                        subtitle={t(
                          "component:project_item.constraints_counter",
                          {
                            count: item.options.length,
                          },
                        )}
                        description={item.description}
                        color={projectColor}
                      />
                    </View>
                  ))
                : null}
            </View>
          </>
        )}
      </View>
    </View>
  );
}
