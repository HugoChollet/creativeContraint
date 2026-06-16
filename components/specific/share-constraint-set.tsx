import { TranslatedRow } from "@/hooks/use-generator-translations";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { Alert, Share, TouchableOpacity } from "react-native";

interface ShareProps {
  projectLabel: string;
  constraints: TranslatedRow[];
  difficulty: number;
  color: string;
}

function ShareConstraintButton({
  projectLabel,
  constraints,
  difficulty,
  color,
}: ShareProps) {
  const { t } = useTranslation();

  const formatConstraints = () => {
    const constraintList = constraints
      .map((c) => `- ${c.label}: ${c.displayValue}`)
      .join("\n");

    return t("component:share.card", {
      type: projectLabel,
      difficulty,
      constraints: constraintList,
    });
  };

  const onShare = async () => {
    try {
      const message = formatConstraints();
      const result = await Share.share({
        message,
        // TODO add link to store/deeplink to constraint set
        title: `Contraintes pour ${projectLabel}`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log("Shared with", result.activityType);
        } else {
        }
      } else if (result.action === Share.dismissedAction) {
        console.log("Shared cancelled");
      }
    } catch (error: any) {
      Alert.alert(t("component:share.error_title"), t("component:share.error"));
      console.error(error);
    }
  };

  return (
    <TouchableOpacity onPress={onShare}>
      <Ionicons name="share-social-outline" size={24} color={color} />
    </TouchableOpacity>
  );
}

export default ShareConstraintButton;
