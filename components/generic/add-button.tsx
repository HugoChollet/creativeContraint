import { useStyles } from "@/hooks/use-styles";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";

interface AddButtonProps {
  projectColor: string;
  label: string;
  onClick: () => void;
}

export const AddButton = ({ projectColor, label, onClick }: AddButtonProps) => {
  const { globalStyles } = useStyles();
  const { t } = useTranslation();

  return (
    <View style={{ marginTop: 12 }}>
      <TouchableOpacity
        style={[
          globalStyles.mediaIntegrationContainer,
          {
            borderColor: projectColor,
          },
        ]}
        onPress={onClick}
      >
        <Ionicons name="add" size={32} color={projectColor} />
        <Text style={[globalStyles.text, { color: projectColor }]}>
          {label}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
