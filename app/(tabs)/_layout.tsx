import { Tabs } from "expo-router";
import React, { useEffect } from "react";

import { HapticTab } from "@/components/haptic-tab";
import { ThemeMode } from "@/contexts/theme-context";
import { useProfile } from "@/hooks/use-profile";
import { useStyles } from "@/hooks/use-styles";
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
    // Update language based on saved user preference
    i18n.changeLanguage(data.language ?? "en");
    setThemeMode((data.theme as ThemeMode) || "light");
  }, [data]);

  return (
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
          title: t("screen:layout.Lab"),
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="flask" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="constraint-sets"
        options={{
          title: t("screen:layout.constraint_sets"),
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="folder-open" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="publications"
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
        name="lab"
        options={{
          href: null,
          title: "Lab",
        }}
      />
      <Tabs.Screen
        name="publication-form"
        options={{
          href: null,
          title: "Submit",
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
  );
}
