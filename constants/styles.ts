import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from "react-native";
import { AppThemeColors, Colors } from "./theme";

export type TagSize = "small" | "medium" | "big";

// Define an interface for your shared styles
interface GlobalStyles {
  noColorContainer: ViewStyle;
  shadeContainer: ViewStyle;
  hardContainer: ViewStyle;
  backgroundContainer: ViewStyle;
  shadeScroll: ViewStyle;
  tabContainer: ViewStyle;
  screenContainer: ViewStyle;
  elementAndDescriptorContainer: ViewStyle;
  mediaIntegrationContainer: ViewStyle;
  root: ViewStyle;
  centered: ViewStyle;
  rowBetween: ViewStyle;
  wrapRow: ViewStyle;
  rowCenter: ViewStyle;
  rowStart: ViewStyle;
  rowBetweenCenter: ViewStyle;
  rowEndCenter: ViewStyle;
  scrollContent: ViewStyle;
  compactIconStatButton: ViewStyle;
  contentHeader: ViewStyle;
  contentHeaderCard: ViewStyle;
  contentHeaderDetail: ViewStyle;
  backButtonSmall: ViewStyle;
  avatarColumn: ViewStyle;
  titleBlockCenter: ViewStyle;
  centeredWrapRow: ViewStyle;
  compactActions: ViewStyle;
  iconButtonSmall: ViewStyle;
  circularIconButton: ViewStyle;
  avatarSmall: ImageStyle;
  avatarMedium: ImageStyle;
  avatarLarge: ImageStyle;
  pill: ViewStyle;
  roundedBubble: ViewStyle;
  sectionBlock: ViewStyle;
  inlineLink: ViewStyle;

  text: TextStyle;
  label: TextStyle;
  title: TextStyle;
  subtitle: TextStyle;
  discreetText: TextStyle;
  tabText: TextStyle;
  primaryButtonText: TextStyle;
  secondaryButtonText: TextStyle;
  borderButtonText: TextStyle;
  alertText: TextStyle;
  contentHeaderTitle: TextStyle;
  contentHeaderDetailTitle: TextStyle;
  contentHeaderMetaText: TextStyle;
  contentHeaderUsername: TextStyle;
  contentHeaderDetailUsername: TextStyle;
  compactStatText: TextStyle;
  sectionTitle: TextStyle;
  inlineLinkText: TextStyle;
  pillText: TextStyle;

  input: ViewStyle & TextStyle;
  secondaryButton: ViewStyle;
  borderButton: ViewStyle;
  transparentButton: ViewStyle;
  dropdownButton: ViewStyle;
  alertButton: ViewStyle;
  shadeButton: ViewStyle;

  backgroundColor: ViewStyle;
  headerRow: ViewStyle;
  titleArea: ViewStyle;
  optionItem: ViewStyle;
  activeOption: ViewStyle;
  activeOptionText: TextStyle;
  card: ViewStyle;
  tabSegment: ViewStyle;
  tag: ViewStyle;
  tagSmall: ViewStyle;
  tagMedium: ViewStyle;
  tagBig: ViewStyle;
  tagTextSmall: TextStyle;
  tagTextMedium: TextStyle;
  tagTextBig: TextStyle;
  modalOverlay: ViewStyle;
}

export const getGlobalStyles = (themes: AppThemeColors): GlobalStyles => {
  const baseButton: ViewStyle = {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  };
  const baseText: TextStyle = {
    color: themes.text,
    fontSize: 14,
    fontWeight: "600",
  };
  const baseContainer: ViewStyle = {
    justifyContent: "center",
    padding: 24,
  };

  return StyleSheet.create({
    // Containers
    noColorContainer: {
      ...baseContainer,
      borderRadius: 12,
    },
    shadeContainer: {
      ...baseContainer,
      borderRadius: 12,
      backgroundColor: themes.shadeContainer,
    },
    hardContainer: {
      ...baseContainer,
      borderRadius: 12,
      backgroundColor: themes.hardContainer,
    },
    backgroundContainer: {
      ...baseContainer,
      backgroundColor: themes.background,
    },
    shadeScroll: {
      backgroundColor: themes.shadeContainer,
    },
    tabContainer: {
      flexDirection: "row",
      backgroundColor: themes.shadeContainer,
      borderRadius: 10,
      padding: 4,
      gap: 4,
    },
    screenContainer: {
      backgroundColor: themes.background,
      flex: 1,
      paddingHorizontal: 24,
    },
    elementAndDescriptorContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    mediaIntegrationContainer: {
      ...baseContainer,
      borderRadius: 12,
      backgroundColor: themes.softContainer,
      borderStyle: "dashed",
      borderWidth: 2,
      alignItems: "center",
    },
    root: {
      flex: 1,
    },
    centered: {
      justifyContent: "center",
      alignItems: "center",
    },
    rowBetween: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      gap: 8,
    },
    wrapRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    rowCenter: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    rowStart: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },
    rowBetweenCenter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    rowEndCenter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 8,
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingBottom: 40,
    },
    compactIconStatButton: {
      minWidth: 36,
      height: 28,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 3,
    },
    contentHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 6,
    },
    contentHeaderCard: {
      minHeight: 62,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    contentHeaderDetail: {
      minHeight: 64,
      paddingHorizontal: 8,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: themes.borderColor,
    },
    backButtonSmall: {
      width: 28,
      height: 34,
      alignItems: "flex-start",
      justifyContent: "center",
    },
    avatarColumn: {
      width: 46,
      alignItems: "center",
      gap: 2,
    },
    titleBlockCenter: {
      flex: 1,
      minWidth: 0,
      alignItems: "center",
    },
    centeredWrapRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      maxWidth: "100%",
      flexWrap: "wrap",
    },
    compactActions: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      minWidth: 82,
      gap: 1,
    },
    iconButtonSmall: {
      width: 24,
      height: 28,
      alignItems: "center",
      justifyContent: "center",
    },
    circularIconButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarSmall: {
      width: 22,
      height: 22,
      borderRadius: 11,
    },
    avatarMedium: {
      width: 28,
      height: 28,
      borderRadius: 14,
    },
    avatarLarge: {
      width: 30,
      height: 30,
      borderRadius: 15,
    },
    pill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
      borderRadius: 999,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    roundedBubble: {
      flex: 1,
      borderRadius: 12,
      padding: 12,
      gap: 6,
    },
    sectionBlock: {
      gap: 14,
      paddingTop: 18,
    },
    inlineLink: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },

    // Texts
    text: {
      ...baseText,
    },
    label: {
      ...baseText,
      marginBottom: 8,
      color: themes.textDiscreet,
    },
    title: {
      ...baseText,
      fontSize: 20,
      marginBottom: 8,
      marginTop: 8,
      fontWeight: "700",
      textTransform: "uppercase",
      textAlign: "center",
    },
    subtitle: {
      ...baseText,
      fontSize: 18,
      marginBottom: 8,
      marginTop: 8,
    },
    discreetText: {
      ...baseText,
      fontSize: 10,
      color: themes.textDiscreet,
      fontWeight: "700",
      marginRight: 8,
    },
    tabText: {
      fontSize: 11,
      fontWeight: "700",
      textTransform: "uppercase",
    },
    primaryButtonText: {
      ...baseText,
      color: themes.invertedText,
    },
    secondaryButtonText: {
      ...baseText,
      color: Colors.white,
    },
    borderButtonText: {
      ...baseText,
      color: themes.text,
    },
    alertText: {
      ...baseText,
      color: Colors.alert,
    },
    contentHeaderTitle: {
      ...baseText,
      fontSize: 15,
      fontWeight: "700",
    },
    contentHeaderDetailTitle: {
      ...baseText,
      fontSize: 16,
      fontWeight: "700",
      textAlign: "center",
    },
    contentHeaderMetaText: {
      ...baseText,
      fontSize: 11,
      color: themes.textDiscreet,
      fontWeight: "600",
    },
    contentHeaderUsername: {
      ...baseText,
      maxWidth: 46,
      fontSize: 9,
      fontWeight: "600",
    },
    contentHeaderDetailUsername: {
      ...baseText,
      maxWidth: 46,
      fontSize: 10,
      fontWeight: "600",
    },
    compactStatText: {
      ...baseText,
      fontSize: 12,
      fontWeight: "700",
    },
    sectionTitle: {
      ...baseText,
      fontSize: 20,
      fontWeight: "700",
    },
    inlineLinkText: {
      ...baseText,
      fontSize: 14,
      fontWeight: "700",
      textDecorationLine: "underline",
    },
    pillText: {
      ...baseText,
      fontSize: 10,
      fontWeight: "700",
    },

    // Buttons
    input: {
      backgroundColor: themes.background === "#fff" ? "#F0F0F0" : "#1A1A1A",
      height: 56,
      borderRadius: 12,
      paddingHorizontal: 16,
      fontSize: 16,
      borderWidth: 1,
      borderColor: themes.borderColor,
      color: themes.text,
    },
    secondaryButton: {
      ...baseButton,
      backgroundColor: themes.tint,
    },
    borderButton: {
      ...baseButton,
      borderWidth: 1,
      borderColor: themes.tint,
      backgroundColor: "transparent",
    },
    transparentButton: {
      ...baseButton,
      backgroundColor: "transparent",
    },
    dropdownButton: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
    },
    alertButton: {
      ...baseButton,
      borderWidth: 1,
      borderColor: Colors.alert,
      backgroundColor: "transparent",
    },
    shadeButton: {
      position: "absolute",
      top: 8,
      right: 8,
      backgroundColor: "rgba(0,0,0,0.6)",
      padding: 8,
      borderRadius: 20,
    },
    backgroundColor: {
      backgroundColor: themes.background,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      zIndex: 10,
      backgroundColor: themes.shadeContainer,
    },
    titleArea: {
      flex: 1,
      marginLeft: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    optionItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 16,
      borderRadius: 8,
    },
    activeOption: { backgroundColor: themes.tint },
    activeOptionText: {
      color: themes.invertedText,
      fontWeight: "bold",
    },

    card: {
      backgroundColor: themes.shadeContainer,
      borderRadius: 12,
      marginBottom: 12,
      overflow: "hidden",
    },
    tabSegment: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    tag: {
      backgroundColor: themes.shadeContainer,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: themes.borderColor,
      maxWidth: "100%",
    },
    tagSmall: {
      minHeight: 16,
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
      justifyContent: "center",
    },
    tagMedium: {
      minHeight: 24,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      justifyContent: "center",
    },
    tagBig: {
      minHeight: 34,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      justifyContent: "center",
    },
    tagTextSmall: {
      fontSize: 8,
      marginRight: 0,
    },
    tagTextMedium: {
      fontSize: 10,
      marginRight: 0,
    },
    tagTextBig: {
      fontSize: 13,
      marginRight: 0,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.7)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
  });
};
