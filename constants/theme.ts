const tintColorLight = "#0A84FF";
const tintColorDark = "#0761bbff";
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
    textDiscreet: "#8E8E93",
    background: "#fff",
    shadeContainer: shadeContainerLight,
    hardContainer: hardContainerLight,
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    placeholder: "#979797ff",
    borderColor: shadeContainerLight,
    disable: "#ccc",
    custom: tintColorLight,

    book: "#7e2cb4ff",
    music: "#17B8A6",
    photography: "#B81680",
    videoFiction: "#FFC100",
    videoInternet: "#82C868",
    cooking: "#FF725E",

    easy: "#34C759",
    easyMedium: "#8aa829ff",
    medium: "#e9d418ff",
    aboveMedium: "#ee9f17ff",
    hardMedium: "#e36415ff",
    hard: "#e31d13ff",
    veryHard: "#a22c24ff",
    impossible: "#381668ff",
  },
  dark: {
    text: textWhite,
    textActive: tintColorDark,
    invertedText: textDark,
    textDiscreet: "#bbb",
    background: "#151718",
    shadeContainer: shadeContainerDark,
    hardContainer: hardContainerDark,
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    placeholder: "#555555ff",
    borderColor: shadeContainerDark,
    disable: "#6d6c6cff",
    custom: "#007AFF",

    book: "#7e2cb4ff",
    music: "#17B8A6",
    photography: "#B81680",
    videoFiction: "#FFC100",
    videoInternet: "#82C868",
    cooking: "#FF725E",

    easy: "#34C759",
    easyMedium: "#d1ff3bff",
    medium: "#FFEB3B",
    aboveMedium: "#ffb73bff",
    hardMedium: "#ff863bff",
    hard: "#FF3B30",
    veryHard: "#a22c24ff",
    impossible: "#1c025bff",
  },
} as const;

export const Colors = {
  alert: "#ff4444",
  white: textWhite,
  black: textDark,
  grey: "#8E8E93",
};

// Types for your theme
export type AppTheme = keyof typeof Themes; // 'light' | 'dark'
export type AppThemeColors = typeof Themes.light | typeof Themes.dark; // The structure of the color object
