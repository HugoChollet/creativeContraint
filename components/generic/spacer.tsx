import { useStyles } from "@/hooks/use-styles";
import { View } from "react-native";

export function Spacer({
  height,
  width,
  divider,
}: {
  height?: number;
  width?: number;
  divider?: boolean;
}) {
  const { colors } = useStyles();

  return (
    <View style={{ height, width }}>
      {divider && (
        <View
          style={{
            height: 1,
            backgroundColor: colors.disable,
          }}
        />
      )}
    </View>
  );
}
