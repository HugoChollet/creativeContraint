import {
  getProjectLanguageFlag,
  isProjectLanguage,
  normalizeProjectTags,
} from "@/constants/project-metadata";
import { useStyles } from "@/hooks/use-styles";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

interface MetadataBadgesProps {
  language?: string | null;
  tags?: readonly string[] | null;
  color?: string;
  textColor?: string;
  backgroundColor?: string;
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
  tags,
  color,
  textColor,
  backgroundColor,
}: MetadataBadgesProps) {
  const { t } = useTranslation();
  const { globalStyles, colors } = useStyles();
  const normalizedTags = normalizeProjectTags(tags);
  const badgeLabels = [
    ...(isProjectLanguage(language)
      ? [
          {
            key: `language-${language}`,
            label: `${getProjectLanguageFlag(language)} ${t(
              `component:metadata.languages.${language}`,
              {
                defaultValue: language.toUpperCase(),
              },
            )}`,
          },
        ]
      : []),
    ...normalizedTags.map((tag) => ({
      key: `tag-${tag}`,
      label: t(`component:metadata.tag_values.${tag}`, {
        defaultValue: formatFallbackLabel(tag),
      }),
    })),
  ];

  if (badgeLabels.length === 0) {
    return null;
  }

  return (
    <View style={styles.badgesRow}>
      {badgeLabels.map((badge) => (
        <View
          key={badge.key}
          style={[
            globalStyles.tag,
            styles.badge,
            {
              borderColor: color ?? colors.borderColor,
              backgroundColor:
                backgroundColor ?? globalStyles.tag.backgroundColor,
            },
          ]}
        >
          <Text
            style={[
              globalStyles.discreetText,
              styles.badgeText,
              { color: textColor ?? colors.textDiscreet },
            ]}
          >
            {badge.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    minHeight: 28,
    justifyContent: "center",
  },
  badgeText: {
    marginRight: 0,
    fontSize: 11,
  },
});
