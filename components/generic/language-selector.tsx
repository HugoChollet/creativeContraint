import { getContrastingColor } from "@/constants/theme";
import {
  getProjectLanguageFlag,
  PROJECT_LANGUAGES,
  ProjectLanguage,
} from "@/constants/project-metadata";
import { useStyles } from "@/hooks/use-styles";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface LanguageSelectorProps {
  label: string;
  selectedLanguage: ProjectLanguage;
  onChange: (language: ProjectLanguage) => void;
  color?: string;
}

export default function LanguageSelector({
  label,
  selectedLanguage,
  onChange,
  color,
}: LanguageSelectorProps) {
  const { t } = useTranslation();
  const { globalStyles, colors } = useStyles();
  const activeColor = color ?? colors.tint;

  return (
    <View style={styles.container}>
      <Text style={globalStyles.label}>{label}</Text>

      <View style={styles.optionsRow}>
        {PROJECT_LANGUAGES.map((language) => {
          const isSelected = language === selectedLanguage;

          return (
            <Pressable
              key={language}
              onPress={() => onChange(language)}
              style={[
                styles.option,
                {
                  borderColor: isSelected ? activeColor : colors.borderColor,
                  backgroundColor: isSelected ? activeColor : "transparent",
                },
              ]}
            >
              <Text style={styles.flag}>{getProjectLanguageFlag(language)}</Text>
              <Text
                style={[
                  globalStyles.text,
                  styles.optionLabel,
                  {
                    color: isSelected
                      ? getContrastingColor(activeColor, "primary")
                      : colors.text,
                  },
                ]}
              >
                {t(`component:metadata.languages.${language}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  option: {
    flex: 1,
    minWidth: 140,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  flag: {
    fontSize: 22,
  },
  optionLabel: {
    fontSize: 15,
  },
});
