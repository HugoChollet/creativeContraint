import { getContrastingColor } from "@/constants/theme";
import {
  isProjectLanguage,
  ProjectLanguage,
} from "@/constants/project-metadata";
import { useStyles } from "@/hooks/use-styles";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ConfirmButton } from "./confirm-button";
import LanguageSelector from "./language-selector";
import MetadataBadges from "./metadata-badges";
import { ModalGeneric } from "./modal-generic";

interface ProjectLanguageFilterProps {
  label: string;
  selectedLanguage?: string | null;
  onChange: (language: ProjectLanguage | null) => void;
  color?: string;
}

export default function ProjectLanguageFilter({
  label,
  selectedLanguage,
  onChange,
  color,
}: ProjectLanguageFilterProps) {
  const { t } = useTranslation();
  const { globalStyles, colors } = useStyles();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const activeColor = color ?? colors.tint;

  return (
    <>
      <View style={styles.container}>
        <Text style={globalStyles.label}>{label}</Text>
        <MetadataBadges
          language={selectedLanguage}
          color={activeColor}
          onRemoveBadge={(badge) => {
            if (badge.type === "language") {
              onChange(null);
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
                name="language"
                size={16}
                color={getContrastingColor(activeColor, "primary")}
              />
            </Pressable>
          }
        />
      </View>

      <ModalGeneric visible={isModalVisible} setVisible={setIsModalVisible}>
        <LanguageSelector
          label={label}
          selectedLanguage={
            isProjectLanguage(selectedLanguage) ? selectedLanguage : null
          }
          onChange={(nextLanguage) => onChange(nextLanguage)}
          color={activeColor}
        />
        <ConfirmButton
          projectColor={activeColor}
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
