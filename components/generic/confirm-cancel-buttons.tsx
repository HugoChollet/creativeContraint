import { useStyles } from "@/hooks/use-styles";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import { ConfirmButton } from "./confirm-button";

interface ConfirmButtonProps {
  color: string;
  labelConfirm?: string;
  labelCancel?: string;
  isActive?: boolean;
  isLoading?: boolean;
  onClickConfirm: () => void;
  onClickCancel: () => void;
}

export const ConfirmCancelButton = ({
  color,
  labelConfirm,
  labelCancel,
  isActive = true,
  isLoading = false,
  onClickConfirm,
  onClickCancel,
}: ConfirmButtonProps) => {
  const { globalStyles } = useStyles();
  const { t } = useTranslation();

  return (
    <View
      style={{
        paddingTop: 12,
        paddingBottom: 20,
        gap: 8,
        flexDirection: "row",
      }}
    >
      <View style={{ flex: 2 }}>
        <ConfirmButton
          projectColor={color}
          label={labelConfirm ?? t("component:confirm-cancel.confirm")}
          isActive={isActive}
          isLoading={isLoading}
          onClick={onClickConfirm}
        />
      </View>
      <TouchableOpacity
        style={[
          globalStyles.borderButton,
          {
            borderColor: color,
            flex: 1,
          },
        ]}
        onPress={onClickCancel}
      >
        <Text style={{ color: color }}>
          {labelCancel ?? t("component:confirm-cancel.cancel")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
