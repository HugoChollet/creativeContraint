import { useStyles } from "@/hooks/use-styles";
import { Stack } from "expo-router";

export function Header({ title, color }: { title: string; color: string }) {
  const { globalStyles, colors } = useStyles();

  return (
    <Stack.Screen
      options={{
        headerShown: true,
        title: title,
        headerTintColor: color,
        headerTitleStyle: {
          ...globalStyles.title,
          color: color,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerShadowVisible: false,
      }}
    />
  );
}
