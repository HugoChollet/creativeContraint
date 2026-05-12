import { StyleSheet, TextStyle, ViewStyle } from "react-native";
import { AppThemeColors, Colors } from "./theme";

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
  rowBetween: ViewStyle;
  wrapRow: ViewStyle;

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
      backgroundColor: themes.hardContainer,
      borderStyle: "dashed",
      borderWidth: 2,
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
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.7)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
  });
};
