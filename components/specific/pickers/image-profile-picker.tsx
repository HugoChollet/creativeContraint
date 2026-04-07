import { Colors } from "@/constants/theme";
import { useStyles } from "@/hooks/use-styles";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Image, StyleSheet, TouchableOpacity, View } from "react-native";

interface ProfileImagePickerProps {
  initialImage?: string | null;
  onImageSelected: (uri: string | null) => void;
}

// A default placeholder URI or a local asset
const DEFAULT_AVATAR = require("@/assets/images/blank-avatar.jpg");
export const ProfileImagePicker = ({
  initialImage,
  onImageSelected,
}: ProfileImagePickerProps) => {
  const { globalStyles, colors } = useStyles();
  const [image, setImage] = useState<string | null>();
  const { t } = useTranslation();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        t("component:image-picker.permission_error_title"),
        t("component:image-picker.permission_error_content"),
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio for profile pictures
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);
      onImageSelected(uri);
    }
  };

  useEffect(() => {
    console.log(initialImage);
    if (initialImage) setImage(initialImage); // Initialize with prop value, fallback to null
  }, [initialImage]);

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrapper}>
        <Image
          source={image ? { uri: image } : DEFAULT_AVATAR}
          style={[styles.avatar, { borderColor: colors.tint, borderWidth: 2 }]}
        />

        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: colors.tint }]}
          onPress={pickImage}
          activeOpacity={0.8}
        >
          <Ionicons name="camera" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  avatarWrapper: {
    position: "relative",
    width: 120,
    height: 120,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60, // Circular profile pic
    backgroundColor: "#E1E1E1",
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.white, // Standard white border to "pop" against the image
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});
