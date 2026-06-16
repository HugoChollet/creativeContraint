import { ConfirmButton } from "@/components/generic/confirm-button";
import { useTutorial } from "@/contexts/tutorial-context";
import { getContrastingColor } from "@/constants/theme";
import { useStyles } from "@/hooks/use-styles";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TutorialSlideKey =
  | "inspiration"
  | "generator"
  | "constraints"
  | "publish"
  | "customize";

const tutorialSlideKeys: TutorialSlideKey[] = [
  "inspiration",
  "generator",
  "constraints",
  "publish",
  "customize",
];

const tutorialSlideIcons: Record<
  TutorialSlideKey,
  React.ComponentProps<typeof Ionicons>["name"]
> = {
  inspiration: "bulb-outline",
  generator: "albums-outline",
  constraints: "options-outline",
  publish: "rocket-outline",
  customize: "construct-outline",
};

export function TutorialCarousel() {
  const {
    completeTutorial,
    dismissTutorial,
    hasCompletedTutorial,
    isTutorialVisible,
  } = useTutorial();
  const { colors, globalStyles } = useStyles();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [slideIndex, setSlideIndex] = useState(0);

  const cardWidth = Math.min(width - 32, 520);
  const currentSlideKey = tutorialSlideKeys[slideIndex];
  const isFirstSlide = slideIndex === 0;
  const isLastSlide = slideIndex === tutorialSlideKeys.length - 1;
  const iconBackgroundColor = colors.tint;
  const iconColor = getContrastingColor(iconBackgroundColor, "primary");

  const slideContent = useMemo(
    () =>
      tutorialSlideKeys.map((key) => ({
        key,
        icon: tutorialSlideIcons[key],
        title: t(`tutorial:slides.${key}.title`),
        description: t(`tutorial:slides.${key}.description`),
      })),
    [t],
  );

  useEffect(() => {
    if (isTutorialVisible) {
      setSlideIndex(0);
    }
  }, [isTutorialVisible]);

  const closeTutorial = () => {
    if (hasCompletedTutorial) {
      dismissTutorial();
      return;
    }

    completeTutorial();
  };

  const goToPreviousSlide = () => {
    setSlideIndex((current) => Math.max(0, current - 1));
  };

  const goToNextSlide = () => {
    if (isLastSlide) {
      completeTutorial();
      return;
    }

    setSlideIndex((current) =>
      Math.min(tutorialSlideKeys.length - 1, current + 1),
    );
  };

  return (
    <Modal
      transparent
      visible={isTutorialVisible}
      animationType="fade"
      onRequestClose={closeTutorial}
    >
      <View
        style={[
          styles.overlay,
          {
            paddingTop: Math.max(insets.top, 20),
            paddingBottom: Math.max(insets.bottom, 20),
          },
        ]}
      >
        <View
          style={[
            styles.card,
            {
              width: cardWidth,
              backgroundColor: colors.background,
            },
          ]}
        >
          <TouchableOpacity
            accessibilityLabel={t("tutorial:close")}
            onPress={closeTutorial}
            style={[
              styles.closeButton,
              {
                backgroundColor: colors.shadeContainer,
              },
            ]}
          >
            <Ionicons name="close" size={22} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.slideArea}>
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor: iconBackgroundColor,
                },
              ]}
            >
              <Ionicons
                name={slideContent[slideIndex].icon}
                size={42}
                color={iconColor}
              />
            </View>

            <Text style={[globalStyles.title, styles.title]}>
              {slideContent[slideIndex].title}
            </Text>
            <Text
              style={[
                globalStyles.text,
                styles.description,
                {
                  color: colors.textDiscreet,
                },
              ]}
            >
              {slideContent[slideIndex].description}
            </Text>
          </View>

          <View style={styles.dotsRow} accessibilityRole="tablist">
            {tutorialSlideKeys.map((key, index) => (
              <Pressable
                accessibilityLabel={t("tutorial:go_to_slide", {
                  number: index + 1,
                })}
                accessibilityRole="tab"
                key={key}
                onPress={() => setSlideIndex(index)}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      key === currentSlideKey ? colors.tint : colors.disable,
                  },
                ]}
              />
            ))}
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              accessibilityLabel={t("tutorial:previous")}
              disabled={isFirstSlide}
              onPress={goToPreviousSlide}
              style={[
                globalStyles.borderButton,
                styles.iconButton,
                {
                  borderColor: isFirstSlide ? colors.disable : colors.tint,
                  opacity: isFirstSlide ? 0.45 : 1,
                },
              ]}
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color={isFirstSlide ? colors.disable : colors.tint}
              />
            </TouchableOpacity>

            <View style={styles.mainAction}>
              <ConfirmButton
                generatorColor={colors.tint}
                label={
                  isLastSlide
                    ? t("tutorial:finish")
                    : t("tutorial:next")
                }
                onClick={goToNextSlide}
              />
            </View>
          </View>

          <TouchableOpacity onPress={closeTutorial} style={styles.skipButton}>
            <Text style={[globalStyles.text, { color: colors.textDiscreet }]}>
              {t("tutorial:skip")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "rgba(0,0,0,0.72)",
  },
  card: {
    borderRadius: 20,
    padding: 20,
    minHeight: 440,
  },
  closeButton: {
    alignSelf: "flex-end",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  slideArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 16,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginTop: 8,
    marginBottom: 0,
  },
  description: {
    textAlign: "center",
    maxWidth: 360,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  iconButton: {
    width: 56,
    minWidth: 56,
  },
  mainAction: {
    flex: 1,
  },
  skipButton: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 2,
  },
});
