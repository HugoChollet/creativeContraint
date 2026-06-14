import { TutorialCarousel } from "@/components/specific/tutorial/tutorial-carousel";
import { AuthProvider } from "@/contexts/auth-context";
import { ProjectDraftProvider } from "@/contexts/project-draft-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { TutorialProvider } from "@/contexts/tutorial-context";
import { useStyles } from "@/hooks/use-styles";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
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
  const { colors } = useStyles();

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
        <ProjectDraftProvider>
          <TutorialProvider>
            <SafeAreaProvider>
              <AppLayout />
              <TutorialCarousel />
            </SafeAreaProvider>
          </TutorialProvider>
        </ProjectDraftProvider>
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
