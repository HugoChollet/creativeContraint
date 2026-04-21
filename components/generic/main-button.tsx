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

interface MainButtonProps {
  title: string;
  color: string;
  image: ImageSourcePropType;
  onPress: () => void;
}

const { width } = Dimensions.get("window");

export const MainButton = ({
  title,
  color,
  image,
  onPress,
}: MainButtonProps) => {
  const { globalStyles } = useStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.container, { backgroundColor: color }]}
    >
      {/* Decorative background circle for flair */}
      <View style={styles.circleDecorator} />

      <View style={styles.content}>
        <Text style={[globalStyles.primaryButtonText, styles.title]}>
          {title}
        </Text>
        <Image source={image} style={styles.image} resizeMode="contain" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width * 0.9,
    height: 100,
    borderRadius: 20,
    marginVertical: 10,
    padding: 20,
    overflow: "hidden", // Keeps the decorator inside
    // Shadow for iOS
    // Elevation for Android
    elevation: 8,
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
    height: "100%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
  },
  image: {
    width: 120,
    height: 120,
  },
});

export default MainButton;
