import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useStyles } from "@/hooks/use-styles";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

export default function TabLayout() {
  const { colors } = useStyles();
  const { t, i18n } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.hardContainer,
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: colors.tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("screen:layout.Home"),
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("screen:layout.Settings"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="lab"
        options={{
          href: null, // This hides the tab button from the bottom bar!
          title: "Lab",
        }}
      />
    </Tabs>
  );
}
