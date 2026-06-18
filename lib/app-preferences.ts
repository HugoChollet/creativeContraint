import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeMode } from "@/contexts/theme-context";

export const APP_LANGUAGES = [
  { label: "Français", value: "fr" },
  { label: "English", value: "en" },
] as const;

export type AppLanguage = (typeof APP_LANGUAGES)[number]["value"];

const APP_LANGUAGE_STORAGE_KEY = "app_language";
const APP_THEME_STORAGE_KEY = "app_theme";

export const isSupportedAppLanguage = (
  language?: string | null,
): language is AppLanguage =>
  APP_LANGUAGES.some((item) => item.value === language);

export const getSupportedAppLanguage = (
  language?: string | null,
): AppLanguage => (isSupportedAppLanguage(language) ? language : "en");

export const isSupportedThemeMode = (
  theme?: string | null,
): theme is ThemeMode =>
  theme === "light" || theme === "dark" || theme === "system";

export const getStoredAppLanguage = async () => {
  const language = await AsyncStorage.getItem(APP_LANGUAGE_STORAGE_KEY);
  return isSupportedAppLanguage(language) ? language : null;
};

export const setStoredAppLanguage = (language: AppLanguage) =>
  AsyncStorage.setItem(APP_LANGUAGE_STORAGE_KEY, language);

export const getStoredThemeMode = async () => {
  const theme = await AsyncStorage.getItem(APP_THEME_STORAGE_KEY);
  return isSupportedThemeMode(theme) ? theme : null;
};

export const setStoredThemeMode = (theme: ThemeMode) =>
  AsyncStorage.setItem(APP_THEME_STORAGE_KEY, theme);
