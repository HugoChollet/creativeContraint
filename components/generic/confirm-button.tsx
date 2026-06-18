import { getContrastingColor } from "@/constants/theme";
import { useStyles } from "@/hooks/use-styles";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

interface ConfirmButtonProps {
  generatorColor: string;
  label: string;
  isActive?: boolean;
  isLoading?: boolean;
  onClick: () => void;
}

export const ConfirmButton = ({
  generatorColor,
  label,
  isActive = true,
  isLoading = false,
  onClick,
}: ConfirmButtonProps) => {
  const { globalStyles, colors } = useStyles();
  const backgroundColor = isActive ? generatorColor : colors.disable;
  const foregroundColor = getContrastingColor(backgroundColor, "primary");

  return (
    <TouchableOpacity
      style={[
        globalStyles.secondaryButton,
        {
          backgroundColor,
        },
      ]}
      onPress={onClick}
      disabled={!isActive}
    >
      {isLoading ? (
        <ActivityIndicator color={foregroundColor} />
      ) : (
        <Text style={[globalStyles.primaryButtonText, { color: foregroundColor }]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};
