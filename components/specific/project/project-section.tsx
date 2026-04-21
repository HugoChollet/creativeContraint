import { useStyles } from "@/hooks/use-styles";
import { Project, ProjectSectionData } from "@/types/projects";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LayoutAnimation, Text, View } from "react-native";
import ProjectItem from "./project-item";

interface ProjectSectionProps {
  onDelete?: () => void;
  onEdit?: () => void;
  onFork?: () => void;
  onPublish?: (cat: Project) => void;
  projectColor: string;
  section: ProjectSectionData;
}

export default function ProjectSection({
  onDelete,
  onEdit,
  onFork,
  onPublish,
  projectColor,
  section,
}: ProjectSectionProps) {
  const { globalStyles, colors } = useStyles();
  const { t } = useTranslation();
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  const handleToggleExpand = (projectName: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedProject((prev) => (prev === projectName ? null : projectName));
    console.log("toggle ", projectName);
  };

  console.log(section.selected);

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
        section.data.map((cat) => (
          <ProjectItem
            key={cat.id}
            onDelete={onDelete}
            onEdit={onEdit}
            onFork={onFork}
            onPublish={() => {
              console.log("publish ", cat.name);
              if (onPublish) onPublish(cat);
            }}
            projectColor={projectColor}
            project={cat}
            selected={section.selected.includes(cat.id)}
            expanded={expandedProject === cat.name}
            toggleExpand={() => handleToggleExpand(cat.name)}
            type={section.title}
          />
        ))
      ) : (
        <Text style={{ color: colors.placeholder }}>
          {t("screen:project_browse.no_categories")}
        </Text>
      )}
    </View>
  );
}
