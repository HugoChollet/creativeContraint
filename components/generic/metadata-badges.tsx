import {
  getGeneratorLanguageFlag,
  isGeneratorLanguage,
  normalizeGeneratorTags,
} from "@/constants/generator-metadata";
import { TagSize } from "@/constants/styles";
import { useStyles } from "@/hooks/use-styles";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";

type MetadataBadgeType = "language" | "supportedFile" | "tag";

interface MetadataBadge {
  key: string;
  label: string;
  type: MetadataBadgeType;
  value: string;
}

interface MetadataBadgesProps {
  language?: string | null;
  supportedFile?: string | null;
  tags?: readonly string[] | null;
  size?: TagSize;
  color?: string;
  textColor?: string;
  backgroundColor?: string;
  onRemoveBadge?: (badge: MetadataBadge) => void;
  trailingContent?: React.ReactNode;
}

const formatFallbackLabel = (value: string) =>
  value
    .split(/[_-]/)
    .map((part) =>
      part.length > 0 ? part[0].toUpperCase() + part.slice(1) : part,
    )
    .join(" ");

export default function MetadataBadges({
  language,
  supportedFile,
  tags,
  size = "medium",
  color,
  textColor,
  backgroundColor,
  onRemoveBadge,
  trailingContent,
}: MetadataBadgesProps) {
  const { t } = useTranslation();
  const { globalStyles, colors } = useStyles();
  const normalizedTags = normalizeGeneratorTags(tags);
  const badgeLabels: MetadataBadge[] = [
    ...(isGeneratorLanguage(language)
      ? [
          {
            key: `language-${language}`,
            label: `${getGeneratorLanguageFlag(language)} ${t(
              `component:metadata.languages.${language}`,
              {
                defaultValue: language.toUpperCase(),
              },
            )}`,
            type: "language" as const,
            value: language,
          },
        ]
      : []),
    ...(supportedFile
      ? [
          {
            key: `supported-file-${supportedFile}`,
            label: t(`component:metadata.supported_files.${supportedFile}`, {
              defaultValue: formatFallbackLabel(supportedFile),
            }),
            type: "supportedFile" as const,
            value: supportedFile,
          },
        ]
      : []),
    ...normalizedTags.map((tag) => ({
      key: `tag-${tag}`,
      label: t(`component:metadata.tag_values.${tag}`, {
        defaultValue: formatFallbackLabel(tag),
      }),
      type: "tag" as const,
      value: tag,
    })),
  ];

  if (badgeLabels.length === 0 && !trailingContent) {
    return null;
  }

  const sizeStyles = {
    small: {
      container: globalStyles.tagSmall,
      text: globalStyles.tagTextSmall,
    },
    medium: {
      container: globalStyles.tagMedium,
      text: globalStyles.tagTextMedium,
    },
    big: {
      container: globalStyles.tagBig,
      text: globalStyles.tagTextBig,
    },
  }[size];

  return (
    <View style={styles.badgesRow}>
      {badgeLabels.map((badge) => (
        <Pressable
          key={badge.key}
          disabled={!onRemoveBadge}
          onPress={() => onRemoveBadge?.(badge)}
          style={[
            globalStyles.tag,
            globalStyles.elementAndDescriptorContainer,
            sizeStyles.container,
            {
              gap: onRemoveBadge ? 6 : 0,
              borderColor: color ?? colors.borderColor,
              backgroundColor:
                backgroundColor ?? globalStyles.tag.backgroundColor,
            },
          ]}
        >
          <Text
            style={[
              globalStyles.discreetText,
              sizeStyles.text,
              { color: textColor ?? colors.textDiscreet },
            ]}
          >
            {badge.label}
          </Text>
          {onRemoveBadge ? (
            <Ionicons
              name="close"
              size={14}
              color={textColor ?? colors.textDiscreet}
            />
          ) : null}
        </Pressable>
      ))}
      {trailingContent}
    </View>
  );
}

const styles = StyleSheet.create({
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});
