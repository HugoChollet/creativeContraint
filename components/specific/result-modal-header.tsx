import { ConfirmButton } from "@/components/generic/confirm-button";
import { DifficultyIndicator } from "@/components/specific/difficulty-indicator";
import { useStyles } from "@/hooks/use-styles";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ResultModalHeaderProps {
  difficultyIndicator?: number;
  color: string;
  titleType: string;
  historyCount: number;
  currentHistoryIndex: number;
  canGenerateAnother?: boolean;
  onGenerateAnother: () => void;
  onNavigatePrevious: () => void;
  onNavigateNext: () => void;
  canNavigatePrevious: boolean;
  canNavigateNext: boolean;
  isBusy?: boolean;
}

export default function ResultModalHeader({
  difficultyIndicator,
  color,
  titleType,
  historyCount,
  currentHistoryIndex,
  canGenerateAnother = true,
  onGenerateAnother,
  onNavigatePrevious,
  onNavigateNext,
  canNavigatePrevious,
  canNavigateNext,
  isBusy = false,
}: ResultModalHeaderProps) {
  const { globalStyles, colors } = useStyles();
  const { t } = useTranslation();
  const previousButtonColor =
    canNavigatePrevious && !isBusy ? color : colors.disable;
  const nextButtonColor = canNavigateNext && !isBusy ? color : colors.disable;

  return (
    <>
      <View style={styles.handle} />
      <View style={styles.headerContainer}>
        <View style={styles.titleBlock}>
          <Text style={[globalStyles.discreetText, styles.counterText]}>
            {t("component:result-modal-header.history_counter", {
              current: currentHistoryIndex + 1,
              total: historyCount,
            })}
          </Text>
          <Text style={globalStyles.title}>
            {t("component:result-modal-header.title", {
              type: titleType,
            })}
          </Text>
        </View>
        <DifficultyIndicator difficultyIndicator={difficultyIndicator} />
      </View>
      <View style={styles.navigationRow}>
        <TouchableOpacity
          style={[
            globalStyles.borderButton,
            styles.navigationButton,
            {
              borderColor: previousButtonColor,
              opacity: canNavigatePrevious && !isBusy ? 1 : 0.7,
            },
          ]}
          onPress={onNavigatePrevious}
          disabled={!canNavigatePrevious || isBusy}
          accessibilityLabel={t("component:result-modal-header.previous_button")}
        >
          <Ionicons name="chevron-back" size={24} color={previousButtonColor} />
        </TouchableOpacity>
        <View style={styles.generateButtonWrapper}>
          <ConfirmButton
            projectColor={color}
            label={t("component:result-modal-header.generate_again_button")}
            isActive={canGenerateAnother && !isBusy}
            onClick={onGenerateAnother}
          />
        </View>
        <TouchableOpacity
          style={[
            globalStyles.borderButton,
            styles.navigationButton,
            {
              borderColor: nextButtonColor,
              opacity: canNavigateNext && !isBusy ? 1 : 0.7,
            },
          ]}
          onPress={onNavigateNext}
          disabled={!canNavigateNext || isBusy}
          accessibilityLabel={t("component:result-modal-header.next_button")}
        >
          <Ionicons name="chevron-forward" size={24} color={nextButtonColor} />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#444",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 16,
    gap: 12,
  },
  titleBlock: {
    flex: 1,
  },
  counterText: {
    marginBottom: 4,
  },
  navigationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  navigationButton: {
    width: 56,
    paddingHorizontal: 0,
  },
  generateButtonWrapper: {
    flex: 1,
  },
});
