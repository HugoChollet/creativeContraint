import { useStyles } from "@/hooks/use-styles";
import { Generator, GeneratorSectionData } from "@/types/generators";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LayoutAnimation, Text, View } from "react-native";
import GeneratorItem from "./generator-item";

interface GeneratorSectionProps {
  onDelete: (id: string) => void;
  onEdit: (project: Generator) => void;
  onFork: (project: Generator) => void;
  onPublish: (cat: Generator) => void;
  onToggleGenerator: (id: string) => void;
  section: GeneratorSectionData;
}

export default function GeneratorSection({
  onDelete,
  onEdit,
  onFork,
  onPublish,
  onToggleGenerator,
  section,
}: GeneratorSectionProps) {
  const { globalStyles, colors } = useStyles();
  const { t } = useTranslation();
  const [expandedGenerator, setExpandedGenerator] = useState<string | null>(
    null,
  );

  const handleToggleExpand = (generatorId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedGenerator((prev) =>
      prev === generatorId ? null : generatorId,
    );
  };

  const isGeneratorSelected = (id: string) => {
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
        section.data.map((generator) => (
          <GeneratorItem
            key={generator.id}
            onDelete={() => onDelete(generator.id)}
            onEdit={() => onEdit(generator)}
            onFork={() => onFork(generator)}
            onPublish={() => onPublish(generator)}
            generatorColor={generator.color ?? colors.tint}
            generator={generator}
            selected={isGeneratorSelected(generator.id.toString())}
            expanded={expandedGenerator === generator.id}
            toggleExpand={() => handleToggleExpand(generator.id)}
            onToggleGenerator={() => onToggleGenerator(generator.id)}
            type={section.title}
          />
        ))
      ) : (
        <Text style={{ color: colors.placeholder }}>
          {t("screen:generator_browse.no_projects")}
        </Text>
      )}
    </View>
  );
}
