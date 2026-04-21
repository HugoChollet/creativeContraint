import { useStyles } from "@/hooks/use-styles";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

interface ConfirmButtonProps {
  projectColor: string;
  label: string;
  isActive?: boolean;
  isLoading?: boolean;
  onClick: () => void;
}

export const ConfirmButton = ({
  projectColor,
  label,
  isActive = true,
  isLoading = false,
  onClick,
}: ConfirmButtonProps) => {
  const { globalStyles, colors } = useStyles();

  return (
    <TouchableOpacity
      style={[
        globalStyles.secondaryButton,
        {
          backgroundColor: isActive ? projectColor : colors.disable,
        },
      ]}
      onPress={onClick}
      disabled={!isActive}
    >
      {isLoading ? (
        <ActivityIndicator color={colors.invertedText} />
      ) : (
        <Text style={globalStyles.primaryButtonText}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};
