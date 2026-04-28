import { useStyles } from "@/hooks/use-styles";
import { StyleSheet, Text, View } from "react-native";
import Tooltip from "./tooltip";

export function Item({
  title,
  subtitle,
  description,
  color,
}: {
  title: string;
  subtitle: string;
  description?: string;
  color?: string;
}) {
  const { colors } = useStyles();
  return (
    <View style={styles.itemContainer}>
      <View style={styles.textContainer}>
        <Text
          style={{
            color: colors.text,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            ...styles.rarityLabel,
            color: colors.textDiscreet,
          }}
        >
          {subtitle}
        </Text>
      </View>
      {description && (
        <Tooltip title={title} description={description} color={color} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: "row",
    gap: 8,
  },
  textContainer: { marginLeft: 12 },
  rarityLabel: { fontSize: 11, marginTop: 2 },
});
