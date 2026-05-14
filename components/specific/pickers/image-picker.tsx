import { Colors } from "@/constants/theme";
import { useStyles } from "@/hooks/use-styles";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";

interface ImageMediaPickerProps {
  projectColor: string;
  onImageSelected: (uri: string | null) => void;
}

export const ImageMediaPicker = ({
  projectColor,
  onImageSelected,
}: ImageMediaPickerProps) => {
  const { globalStyles } = useStyles();
  const [image, setImage] = useState<string | null>(null);
  const { t } = useTranslation();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        t("component:image-picker.permission_error_title"),
        t("component:image-picker.permission_error_msg"),
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);
      onImageSelected(uri);
    }
  };

  const removeImage = () => {
    setImage(null);
    onImageSelected(null);
  };

  return (
    <View style={{ marginTop: 12 }}>
      <Text style={globalStyles.label}>
        {t("component:image-picker.label")}
      </Text>

      {!image ? (
        <TouchableOpacity
          style={[
            globalStyles.mediaIntegrationContainer,
            {
              borderColor: projectColor,
            },
          ]}
          onPress={pickImage}
        >
          <Ionicons name="camera-outline" size={32} color={projectColor} />
          <Text
            style={[globalStyles.text, { color: projectColor, marginTop: 8 }]}
          >
            {t("component:image-picker.placeholder")}
          </Text>
          <Text style={globalStyles.discreetText}>
            {t("component:image-picker.hint")}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={globalStyles.card}>
          <Image
            source={{ uri: image }}
            style={{ width: "100%", height: 200, borderRadius: 12 }}
          />

          <TouchableOpacity
            style={globalStyles.shadeButton}
            onPress={removeImage}
          >
            <Ionicons name="close" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
