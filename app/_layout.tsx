import { TutorialCarousel } from "@/components/specific/tutorial/tutorial-carousel";
import { AuthProvider } from "@/contexts/auth-context";
import { GeneratorDraftProvider } from "@/contexts/generator-draft-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { TutorialProvider } from "@/contexts/tutorial-context";
import { useStyles } from "@/hooks/use-styles";
import {
  getStoredAppLanguage,
  getStoredThemeMode,
} from "@/lib/app-preferences";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet, View } from "react-native";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

if (__DEV__) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("expo-dev-client");
}

export const unstable_settings = {
  anchor: "(tabs)",
};

function AppLayout() {
  const { colors, setThemeMode } = useStyles();
  const { i18n } = useTranslation();

  useEffect(() => {
    const loadAppPreferences = async () => {
      try {
        const [storedLanguage, storedTheme] = await Promise.all([
          getStoredAppLanguage(),
          getStoredThemeMode(),
        ]);

        if (storedLanguage && storedLanguage !== i18n.language) {
          await i18n.changeLanguage(storedLanguage);
        }

        if (storedTheme) {
          setThemeMode(storedTheme);
        }
      } catch (error) {
        console.error("Could not load app preferences:", error);
      }
    };

    loadAppPreferences();
  }, [i18n, setThemeMode]);

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="dark" />
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GeneratorDraftProvider>
          <TutorialProvider>
            <SafeAreaProvider>
              <AppLayout />
              <TutorialCarousel />
            </SafeAreaProvider>
          </TutorialProvider>
        </GeneratorDraftProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: Platform.OS === "web" ? 0 : 48, // TODO Use SafeAreaView
  },
});
