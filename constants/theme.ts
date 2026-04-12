const tintColorLight = "#0A84FF";
const tintColorDark = "#0761bbff";
const softContainerLight = "rgba(225, 225, 225, 1)";
const hardContainerLight = "rgba(205, 205, 205, 1)";
const shadeContainerLight = "rgba(205, 205, 205, 0.3)";
const softContainerDark = "rgba(30, 30, 30, 1)";
const hardContainerDark = "rgba(47, 47, 47, 1)";
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
    softContainer: softContainerLight,
    hardContainer: hardContainerLight,
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    placeholder: "#979797ff",
    borderColor: shadeContainerLight,
    disable: "#ccc",
    custom: tintColorLight,

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
    softContainer: softContainerDark,
    hardContainer: hardContainerDark,
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    placeholder: "#555555ff",
    borderColor: shadeContainerDark,
    disable: "#6d6c6cff",
    custom: "#007AFF",

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

export const ProjectsColors = {
  book: "rgba(27, 23, 208, 1)",
  music: "rgba(23, 184, 166, 1)",
  photography: "rgba(184, 22, 128, 1)",
  videoFiction: "rgba(255, 193, 0, 1)",
  cooking: "rgba(255, 114, 94, 1)",
  videoInternet: "rgba(130, 200, 104, 1)",
  boardgame: "rgba(197, 63, 63, 1)",
  videogame: "rgba(84, 35, 147, 1)",
} as const;

export type ProjectKey = keyof typeof ProjectsColors;

export const getProjectColor = (label: string, opacity: number = 1): string => {
  const map: Record<string, ProjectKey> = {
    Book: "book",
    Music: "music",
    Photography: "photography",
    "Video Fiction": "videoFiction",
    Cooking: "cooking",
    "Internet Video": "videoInternet",
    "Board Game": "boardgame",
    "Video Game": "videogame",
  };

  const key = map[label] || "book";
  const baseColor = ProjectsColors[key];

  return baseColor.replace(/[\d.]+\)$/g, `${opacity})`);
};

export const Colors = {
  alert: "#ff4444",
  white: textWhite,
  black: textDark,
  grey: "#8E8E93",
};

export type AppTheme = keyof typeof Themes; // 'light' | 'dark'
export type AppThemeColors = typeof Themes.light | typeof Themes.dark; // The structure of the color object
