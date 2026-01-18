import { StyleSheet, TextStyle, ViewStyle } from "react-native";
import { AppThemeColors, Colors } from "./theme";

// Define an interface for your shared styles
interface GlobalStyles {
  noColorContainer: ViewStyle;
  shadeContainer: ViewStyle;
  hardContainer: ViewStyle;
  shadeScroll: ViewStyle;
  tabContainer: ViewStyle;

  text: TextStyle;
  label: TextStyle;
  title: TextStyle;
  subtitle: TextStyle;
  discreetText: TextStyle;
  tabText: TextStyle;
  secondaryButtonText: TextStyle;
  borderButtonText: TextStyle;
  alertText: TextStyle;

  input: ViewStyle & TextStyle;
  secondaryButton: ViewStyle;
  borderButton: ViewStyle;
  transparentButton: ViewStyle;
  dropdownButton: ViewStyle;
  alertButton: ViewStyle;
  floatingButton: ViewStyle;

  backgroundColor: ViewStyle;
  headerRow: ViewStyle;
  optionItem: ViewStyle;
  activeOption: ViewStyle;
  activeOptionText: TextStyle;
  card: ViewStyle;
  tabSegment: ViewStyle;
}

export const getGlobalStyles = (themes: AppThemeColors): GlobalStyles => {
  const baseButton: ViewStyle = {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12, // Should probably be in the container and not the button itself
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
    noColorContainer: {
      ...baseContainer,
    },
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
    floatingButton: {
      position: "absolute",
      borderRadius: 32,
      shadowColor: themes.tint,
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
      overflow: "hidden",
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
    tabSegment: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
  });
};
