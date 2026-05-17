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
    invertedBackground: softContainerDark,
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
    invertedBackground: softContainerLight,
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
  light: {
    book: "rgba(27, 23, 208, 1)",
    music: "rgba(23, 184, 166, 1)",
    photography: "rgba(184, 22, 128, 1)",
    videoFiction: "rgba(255, 193, 0, 1)",
    cooking: "rgba(255, 114, 94, 1)",
    videoInternet: "rgba(130, 200, 104, 1)",
    boardgame: "rgba(197, 63, 63, 1)",
    videogame: "rgba(84, 35, 147, 1)",
  },
  dark: {
    book: "rgba(120, 133, 255, 1)",
    music: "rgba(72, 221, 199, 1)",
    photography: "rgba(240, 95, 183, 1)",
    videoFiction: "rgba(255, 214, 92, 1)",
    cooking: "rgba(255, 146, 116, 1)",
    videoInternet: "rgba(173, 231, 110, 1)",
    boardgame: "rgba(246, 116, 116, 1)",
    videogame: "rgba(154, 101, 231, 1)",
  },
} as const;

export type ProjectKey = keyof typeof ProjectsColors.light;
export type ProjectLabel = ProjectKey | string;
export type ProjectColorValue = string;
interface GetProjectColorParams {
  label?: ProjectLabel;
  color?: ProjectColorValue;
  opacity?: number;
  theme?: AppTheme;
}

const projectKeyMap: Record<string, ProjectKey> = {
  book: "book",
  music: "music",
  photography: "photography",
  "video fiction": "videoFiction",
  videofiction: "videoFiction",
  cooking: "cooking",
  "internet video": "videoInternet",
  videointernet: "videoInternet",
  "board game": "boardgame",
  boardgame: "boardgame",
  "video game": "videogame",
  videogame: "videogame",
};

export const getProjectColor = ({
  label,
  color,
  opacity = 1,
  theme = "light",
}: GetProjectColorParams = {}): string => {
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

  if (label) {
    const normalizedLabel = label.trim().toLowerCase();
    const key = map[label] || projectKeyMap[normalizedLabel] || "book";
    const baseColor = ProjectsColors[theme][key];
    return withOpacity(baseColor, opacity);
  }

  if (color) {
    return withOpacity(color, opacity);
  }

  return withOpacity(Colors.grey, opacity);
};

export const Colors = {
  alert: "#ff4444",
  white: textWhite,
  black: textDark,
  grey: "#8E8E93",
};

const clampChannel = (value: number) => Math.min(255, Math.max(0, value));

const parseHexColor = (value: string) => {
  const hex = value.replace("#", "").trim();

  if (hex.length === 3 || hex.length === 4) {
    return {
      r: parseInt(hex[0] + hex[0], 16),
      g: parseInt(hex[1] + hex[1], 16),
      b: parseInt(hex[2] + hex[2], 16),
    };
  }

  if (hex.length === 6 || hex.length === 8) {
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }

  return null;
};

const parseRgbColor = (value: string) => {
  const match = value.match(/rgba?\(([^)]+)\)/i);

  if (!match) {
    return null;
  }

  const [r, g, b] = match[1]
    .split(",")
    .slice(0, 3)
    .map((channel) => clampChannel(Number.parseFloat(channel.trim())));

  if ([r, g, b].some((channel) => Number.isNaN(channel))) {
    return null;
  }

  return { r, g, b };
};

const parseColorToRgb = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();

  if (trimmedValue.startsWith("#")) {
    return parseHexColor(trimmedValue);
  }

  if (trimmedValue.startsWith("rgb")) {
    return parseRgbColor(trimmedValue);
  }

  return null;
};

const withOpacity = (value: string, opacity = 1) => {
  const parsedColor = parseColorToRgb(value);

  if (!parsedColor) {
    return value;
  }

  const normalizedOpacity = Math.min(1, Math.max(0, opacity));

  return `rgba(${parsedColor.r}, ${parsedColor.g}, ${parsedColor.b}, ${normalizedOpacity})`;
};

const getRelativeLuminance = (value?: string | null) => {
  const parsedColor = parseColorToRgb(value);

  if (!parsedColor) {
    return null;
  }

  const toLinearChannel = (channel: number) => {
    const normalized = channel / 255;

    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  };

  const r = toLinearChannel(parsedColor.r);
  const g = toLinearChannel(parsedColor.g);
  const b = toLinearChannel(parsedColor.b);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// This matches the current "white text vs black text" crossover point.
export const DEFAULT_DARK_COLOR_LUMINANCE_PIVOT = 0.4;

export const isColorDark = (
  value?: string | null,
  luminancePivot = DEFAULT_DARK_COLOR_LUMINANCE_PIVOT,
) => {
  const luminance = getRelativeLuminance(value);

  if (luminance === null) {
    return true;
  }

  return luminance <= luminancePivot;
};

export type ContrastColorVariant = "primary" | "secondary" | "background";

const contrastPalette = {
  darkBackground: {
    primary: Colors.white,
    secondary: "rgba(255,255,255,0.82)",
    background: "rgba(255,255,255,0.18)",
  },
  lightBackground: {
    primary: Colors.black,
    secondary: "rgba(17,24,28,0.72)",
    background: "rgba(0,0,0,0.08)",
  },
} as const;

export const getContrastingColor = (
  // TODO add similar function for colored text on background
  backgroundColor?: string | null,
  variant: ContrastColorVariant = "primary",
  luminancePivot = DEFAULT_DARK_COLOR_LUMINANCE_PIVOT,
) =>
  (isColorDark(backgroundColor, luminancePivot)
    ? contrastPalette.darkBackground
    : contrastPalette.lightBackground)[variant];

export type AppTheme = keyof typeof Themes; // 'light' | 'dark'
export type AppThemeColors = typeof Themes.light | typeof Themes.dark; // The structure of the color object
