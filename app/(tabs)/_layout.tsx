import { Tabs } from "expo-router";
import React, { useEffect } from "react";

import { HapticTab } from "@/components/haptic-tab";
import { HomeGeneratorsProvider } from "@/contexts/home-generators-context";
import { useProfile } from "@/hooks/use-profile";
import { useStyles } from "@/hooks/use-styles";
import {
  getStoredAppLanguage,
  getStoredThemeMode,
  isSupportedAppLanguage,
  isSupportedThemeMode,
} from "@/lib/app-preferences";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

export default function TabLayout() {
  const { colors, setThemeMode } = useStyles();
  const { t, i18n } = useTranslation();

  const { data } = useProfile("profiles", {
    language: "",
    theme: "",
  });

  useEffect(() => {
    const applyProfilePreferences = async () => {
      const [storedLanguage, storedTheme] = await Promise.all([
        getStoredAppLanguage(),
        getStoredThemeMode(),
      ]);

      if (
        !storedLanguage &&
        isSupportedAppLanguage(data.language) &&
        data.language !== i18n.language
      ) {
        await i18n.changeLanguage(data.language);
      }

      if (!storedTheme && isSupportedThemeMode(data.theme)) {
        setThemeMode(data.theme);
      }
    };

    applyProfilePreferences();
  }, [data, i18n, setThemeMode]);

  return (
    <HomeGeneratorsProvider>
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopWidth: 1,
          },
          tabBarActiveTintColor: colors.tint,
          headerShown: false,
          tabBarButton: HapticTab,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t("screen:layout.Generators"),
            tabBarIcon: ({ color }) => (
              <Ionicons size={28} name="flask" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="constraint-set/constraint-sets"
          options={{
            title: t("screen:layout.constraint_sets"),
            tabBarIcon: ({ color }) => (
              <Ionicons size={28} name="folder-open" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="publication/publications"
          options={{
            title: t("screen:layout.Publication_Feed"),
            tabBarIcon: ({ color }) => (
              <Ionicons size={28} name="newspaper-outline" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: t("screen:layout.Settings"),
            tabBarIcon: ({ color }) => (
              <Ionicons size={28} name="cog" color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="generators"
          options={{
            href: null,
            title: "Generators",
          }}
        />
        <Tabs.Screen
          name="publication/publication-form"
          options={{
            href: null,
            title: "Submit Publication",
          }}
        />
        <Tabs.Screen
          name="publication/publication-detail"
          options={{
            href: null,
            title: "Publication Detail",
          }}
        />
        <Tabs.Screen
          name="constraint-set/constraint-set-detail"
          options={{
            href: null,
            title: "Constraint Set Detail",
          }}
        />

        <Tabs.Screen
          name="generator-browse"
          options={{
            href: null,
            title: "Browse Generators",
          }}
        />
        <Tabs.Screen
          name="generator-form"
          options={{
            href: null,
            title: "New Generator",
          }}
        />
        <Tabs.Screen
          name="category-browse"
          options={{
            href: null,
            title: "Browse Categories",
          }}
        />
        <Tabs.Screen
          name="category-form"
          options={{
            href: null,
            title: "New Category",
          }}
        />
      </Tabs>
    </HomeGeneratorsProvider>
  );
}
