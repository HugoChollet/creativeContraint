import { useStyles } from "@/hooks/use-styles";
import { Project, ProjectSectionData } from "@/types/projects";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LayoutAnimation, Text, View } from "react-native";
import ProjectItem from "./project-item";

interface ProjectSectionProps {
  onDelete: (id: string) => void;
  onEdit: (project: Project) => void;
  onFork: (project: Project) => void;
  onPublish: (cat: Project) => void;
  section: ProjectSectionData;
}

export default function ProjectSection({
  onDelete,
  onEdit,
  onFork,
  onPublish,
  section,
}: ProjectSectionProps) {
  const { globalStyles, colors } = useStyles();
  const { t } = useTranslation();
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  const handleToggleExpand = (projectName: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedProject((prev) => (prev === projectName ? null : projectName));
  };

  const isProjectSelected = (id: string) => {
    return section.selected.includes(id);
  };

  return (
    <View style={{ marginBottom: 24 }}>
      <Text
        style={[
          globalStyles.subtitle,
          { color: colors.text, marginBottom: 12 },
        ]}
      >
        {section.title}
      </Text>
      {section.data.length > 0 ? (
        section.data.map((project) => (
          <ProjectItem
            key={project.id}
            onDelete={() => onDelete(project.id)}
            onEdit={() => onEdit(project)}
            onFork={() => onFork(project)}
            onPublish={() => onPublish(project)}
            projectColor={project.color ?? colors.tint}
            project={project}
            selected={isProjectSelected(project.id.toString())}
            expanded={expandedProject === project.name}
            toggleExpand={() => handleToggleExpand(project.name)}
            type={section.title}
          />
        ))
      ) : (
        <Text style={{ color: colors.placeholder }}>
          {t("screen:project_browse.no_projects")}
        </Text>
      )}
    </View>
  );
}
