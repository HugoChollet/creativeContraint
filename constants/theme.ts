const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";
const hardContainerLight = "rgba(205, 205, 205, 1)";
const shadeContainerLight = "rgba(205, 205, 205, 0.3)";
const hardContainerDark = "#2C2C2E";
const shadeContainerDark = "rgba(105, 105, 105, 0.3)";
const textWhite = "#ECEDEE";
const textDark = "#11181C";

export const Themes = {
  light: {
    text: textDark,
    textActive: tintColorLight,
    invertedText: textWhite,
    background: "#fff",
    shadeContainer: shadeContainerLight,
    hardContainer: hardContainerLight,
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    placeholder: "#979797ff",
    borderColor: shadeContainerLight,
  },
  dark: {
    text: textWhite,
    textActive: tintColorDark,
    invertedText: textDark,
    background: "#151718",
    shadeContainer: shadeContainerDark,
    hardContainer: hardContainerDark,
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    placeholder: "#555555ff",
    borderColor: shadeContainerDark,
  },
} as const;
export const Colors = {
  alert: "#ff4444",
};

// Types for your theme
export type AppTheme = keyof typeof Themes; // 'light' | 'dark'
export type AppThemeColors = typeof Themes.light | typeof Themes.dark; // The structure of the color object
