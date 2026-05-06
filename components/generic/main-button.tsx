import MetadataBadges from "@/components/generic/metadata-badges";
import { useStyles } from "@/hooks/use-styles";
import React from "react";
import {
  Dimensions,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Tooltip from "./tooltip";

interface MainButtonProps {
  title: string;
  color: string;
  image?: ImageSourcePropType;
  subtitle?: string;
  description?: string;
  tags?: readonly string[] | null;
  onPress: () => void;
}

const { width } = Dimensions.get("window");

export const MainButton = ({
  title,
  color,
  image,
  subtitle,
  description,
  tags,
  onPress,
}: MainButtonProps) => {
  const { globalStyles, colors } = useStyles();
  const hasExtraContent = Boolean(subtitle || description || tags?.length);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.container,
        hasExtraContent ? styles.containerExpanded : null,
        { backgroundColor: color },
      ]}
    >
      <View style={styles.circleDecorator} />

      <View style={styles.content}>
        <View style={styles.textColumn}>
          <View style={styles.titleRow}>
            <Text style={[globalStyles.primaryButtonText, styles.title]}>
              {title}
            </Text>
            {description ? (
              <Tooltip title={title} description={description} color={color} />
            ) : null}
          </View>
          {subtitle ? (
            <Text style={[globalStyles.primaryButtonText, styles.subtitle]}>
              {subtitle}
            </Text>
          ) : null}
          {tags?.length ? (
            <View style={styles.badgesWrapper}>
              <MetadataBadges
                tags={tags}
                color={colors.text}
                textColor={colors.text}
                backgroundColor={colors.shadeContainer}
              />
            </View>
          ) : null}
        </View>
        {image ? (
          <Image source={image} style={styles.image} resizeMode="contain" />
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width * 0.9,
    minHeight: 100,
    borderRadius: 20,
    marginVertical: 10,
    padding: 20,
    overflow: "hidden",
    elevation: 8,
  },
  containerExpanded: {
    minHeight: 150,
  },
  circleDecorator: {
    position: "absolute",
    right: -40,
    top: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
    gap: 16,
  },
  textColumn: {
    flex: 1,
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
  },
  subtitle: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 12,
    marginTop: 6,
  },
  badgesWrapper: {
    marginTop: 10,
  },
  image: {
    width: 104,
    height: 104,
  },
});

export default MainButton;
