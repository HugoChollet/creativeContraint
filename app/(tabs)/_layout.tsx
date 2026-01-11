import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useStyles } from '@/hooks/use-styles';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
  const { colors } = useStyles();
  const { t, i18n } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.container,
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: colors.tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('common:layout.Home'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('common:layout.Settings'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="lab"
        options={{
          href: null, // This hides the tab button from the bottom bar!
          title: 'Lab',
        }}
      />
    </Tabs>
  );
}
