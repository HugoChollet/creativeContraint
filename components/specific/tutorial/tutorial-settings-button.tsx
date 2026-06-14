import { useTutorial } from "@/contexts/tutorial-context";
import { useStyles } from "@/hooks/use-styles";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";

export function TutorialSettingsButton() {
  const { replayTutorial } = useTutorial();
  const { colors, globalStyles } = useStyles();
  const { t } = useTranslation();

  return (
    <View style={globalStyles.shadeContainer}>
      <Text style={globalStyles.subtitle}>
        {t("tutorial:settings_title")}
      </Text>
      <TouchableOpacity
        onPress={replayTutorial}
        style={[
          globalStyles.borderButton,
          {
            borderColor: colors.tint,
            flexDirection: "row",
            gap: 8,
          },
        ]}
      >
        <Ionicons name="help-circle-outline" size={20} color={colors.tint} />
        <Text style={[globalStyles.borderButtonText, { color: colors.tint }]}>
          {t("tutorial:replay_button")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
