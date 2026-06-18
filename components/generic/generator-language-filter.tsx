import { getContrastingColor } from "@/constants/theme";
import {
  isGeneratorLanguage,
  normalizeGeneratorTags,
  GENERATOR_TAGS,
  GeneratorLanguage,
  GeneratorTag,
} from "@/constants/generator-metadata";
import { useStyles } from "@/hooks/use-styles";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ConfirmButton } from "./confirm-button";
import LanguageSelector from "./language-selector";
import MetadataBadges from "./metadata-badges";
import { ModalGeneric } from "./modal-generic";
import TagSelector, { TagSelectorOption } from "./tag-selector";

interface GeneratorLanguageFilterProps {
  label: string;
  selectedLanguage?: string | null;
  onChange: (language: GeneratorLanguage | null) => void;
  selectedTags?: readonly string[] | null;
  onTagsChange?: (tags: GeneratorTag[]) => void;
  languageLabel?: string;
  tagsLabel?: string;
  color?: string;
}

export default function GeneratorLanguageFilter({
  label,
  selectedLanguage,
  onChange,
  selectedTags,
  onTagsChange,
  languageLabel,
  tagsLabel,
  color,
}: GeneratorLanguageFilterProps) {
  const { t } = useTranslation();
  const { globalStyles, colors } = useStyles();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const activeColor = color ?? colors.tint;
  const hasTagFilter = Boolean(onTagsChange);
  const tagOptions = useMemo<TagSelectorOption[]>(
    () =>
      GENERATOR_TAGS.map((value) => ({
        value,
        label: t(`component:metadata.tag_values.${value}`),
      })),
    [t],
  );

  return (
    <>
      <View style={styles.container}>
        <Text style={globalStyles.label}>{label}</Text>
        <MetadataBadges
          language={selectedLanguage}
          tags={selectedTags}
          color={activeColor}
          onRemoveBadge={(badge) => {
            if (badge.type === "language") {
              onChange(null);
              return;
            }

            if (badge.type === "tag") {
              onTagsChange?.(
                normalizeGeneratorTags(
                  (selectedTags ?? []).filter((tag) => tag !== badge.value),
                ),
              );
            }
          }}
          trailingContent={
            <Pressable
              onPress={() => setIsModalVisible(true)}
              style={[
                globalStyles.tag,
                globalStyles.tagMedium,
                globalStyles.elementAndDescriptorContainer,
                styles.addFilterButton,
                {
                  borderColor: activeColor,
                  backgroundColor: activeColor,
                },
              ]}
              accessibilityLabel={label}
              accessibilityRole="button"
            >
              <Ionicons
                name={hasTagFilter ? "options-outline" : "language"}
                size={16}
                color={getContrastingColor(activeColor, "primary")}
              />
            </Pressable>
          }
        />
      </View>

      <ModalGeneric visible={isModalVisible} setVisible={setIsModalVisible}>
        <LanguageSelector
          label={languageLabel ?? label}
          selectedLanguage={
            isGeneratorLanguage(selectedLanguage) ? selectedLanguage : null
          }
          onChange={(nextLanguage) => onChange(nextLanguage)}
          color={activeColor}
        />
        {onTagsChange ? (
          <TagSelector
            label={tagsLabel ?? t("component:metadata.tags_label")}
            options={tagOptions}
            selectedValues={selectedTags ?? []}
            onChange={(values) =>
              onTagsChange(normalizeGeneratorTags(values) as GeneratorTag[])
            }
            color={activeColor}
            maxVisibleRows={3}
          />
        ) : null}
        <ConfirmButton
          generatorColor={activeColor}
          label={t("component:confirm-cancel.confirm")}
          onClick={() => setIsModalVisible(false)}
        />
      </ModalGeneric>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 8,
  },
  addFilterButton: {
    minWidth: 40,
    justifyContent: "center",
  },
});
