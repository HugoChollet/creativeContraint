import { useStyles } from "@/hooks/use-styles";
import { IoniconsName } from "@/types/Icons";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import { ConfirmButton } from "./confirm-button";

interface ConfirmButtonProps {
  color: string;
  labelConfirm?: string;
  labelCancel?: string;
  accessibilityLabelCancel?: string;
  iconCancel?: IoniconsName;
  isActive?: boolean;
  isCancelActive?: boolean;
  isLoading?: boolean;
  onClickConfirm: () => void;
  onClickCancel: () => void;
}

export const ConfirmCancelButton = ({
  color,
  labelConfirm,
  labelCancel,
  accessibilityLabelCancel,
  iconCancel,
  isActive = true,
  isCancelActive = true,
  isLoading = false,
  onClickConfirm,
  onClickCancel,
}: ConfirmButtonProps) => {
  const { globalStyles, colors } = useStyles();
  const { t } = useTranslation();
  const cancelColor = isCancelActive ? color : colors.disable;
  const defaultCancelLabel = iconCancel
    ? undefined
    : t("component:confirm-cancel.cancel");
  const cancelLabel = labelCancel ?? defaultCancelLabel;

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
            borderColor: cancelColor,
            flex: cancelLabel ? 1 : undefined,
            minWidth: 56,
            flexDirection: "row",
            gap: 8,
            opacity: isCancelActive ? 1 : 0.7,
          },
        ]}
        onPress={onClickCancel}
        disabled={!isCancelActive}
        accessibilityLabel={
          accessibilityLabelCancel ??
          cancelLabel ??
          t("component:confirm-cancel.cancel")
        }
      >
        {iconCancel ? (
          <Ionicons name={iconCancel} size={20} color={cancelColor} />
        ) : null}
        {cancelLabel ? (
          <Text style={{ color: cancelColor }}>{cancelLabel}</Text>
        ) : null}
      </TouchableOpacity>
    </View>
  );
};
