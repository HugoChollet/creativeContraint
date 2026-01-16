import { StyleSheet, TextStyle, ViewStyle } from "react-native";
import { AppThemeColors, Colors } from "./theme";

// Define an interface for your shared styles
interface GlobalStyles {
  shadeContainer: ViewStyle;
  hardContainer: ViewStyle;
  shadeScroll: ViewStyle;
  tabContainer: ViewStyle;

  text: TextStyle;
  label: TextStyle;
  title: TextStyle;
  discreetText: TextStyle;

  input: ViewStyle & TextStyle;
  secondaryButton: ViewStyle;
  secondaryButtonText: TextStyle;
  transparentButton: ViewStyle;
  transparentButtonText: TextStyle;
  dropdownButton: ViewStyle;
  alertButton: ViewStyle;
  alertText: TextStyle;

  backgroundColor: ViewStyle;
  headerRow: ViewStyle;
  optionItem: ViewStyle;
  activeOption: ViewStyle;
  activeOptionText: TextStyle;
  card: ViewStyle;
}

export const getGlobalStyles = (themes: AppThemeColors): GlobalStyles => {
  const baseButton: ViewStyle = {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  };
  const baseText: TextStyle = {
    color: themes.text,
    fontSize: 14,
    fontWeight: "600",
  };
  const baseContainer: ViewStyle = {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    borderRadius: 12,
  };

  return StyleSheet.create({
    // Containers
    shadeContainer: {
      ...baseContainer,
      backgroundColor: themes.shadeContainer,
    },
    hardContainer: {
      ...baseContainer,
      backgroundColor: themes.hardContainer,
    },
    shadeScroll: {
      flex: 1,
      backgroundColor: themes.shadeContainer,
    },
    tabContainer: {
      flexDirection: "row",
      backgroundColor: themes.shadeContainer,
      borderRadius: 10,
      padding: 4,
      gap: 4,
      marginTop: 10,
    },

    // Texts
    text: {
      ...baseText,
    },
    label: {
      ...baseText,
      marginBottom: 8,
      marginLeft: 4,
    },
    title: {
      ...baseText,
      fontSize: 16,
      marginBottom: 8,
      marginTop: 8,
      textTransform: "uppercase",
    },
    discreetText: {
      ...baseText,
      fontSize: 11,
      color: "#8E8E93",
      fontWeight: "700",
      marginRight: 8,
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
    secondaryButtonText: {
      ...baseText,
      color: Colors.white,
    },
    transparentButton: {
      ...baseButton,
      borderWidth: 1,
      borderColor: themes.tint,
      backgroundColor: "transparent",
    },
    transparentButtonText: {
      ...baseText,
      color: themes.text,
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
    alertText: {
      ...baseText,
      color: Colors.alert,
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
  });
};
