import { View, type ViewProps } from "react-native";

import { useStyles } from "@/hooks/use-styles";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  const { colors } = useStyles();

  return (
    <View
      style={[{ backgroundColor: colors.background }, style]}
      {...otherProps}
    />
  );
}
