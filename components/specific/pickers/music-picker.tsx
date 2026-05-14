import { Colors } from "@/constants/theme";
import { useStyles } from "@/hooks/use-styles";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Text, TouchableOpacity, View } from "react-native";

interface MusicMediaPickerProps {
  projectColor: string;
  onFileSelected: (file: DocumentPicker.DocumentPickerResult | null) => void;
}

export const MusicMediaPicker = ({
  projectColor,
  onFileSelected,
}: MusicMediaPickerProps) => {
  const { globalStyles } = useStyles();
  const [fileName, setFileName] = useState<string | null>(null);
  const { t } = useTranslation();

  const pickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/mpeg", // On cible le MP3
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setFileName(result.assets[0].name);
        onFileSelected(result);
      }
    } catch {
      Alert.alert(
        t("component:music-picker.error"),
        t("component:music-picker.error_msg"),
      );
    }
  };

  const removeFile = () => {
    setFileName(null);
    onFileSelected(null);
  };

  return (
    <View style={{ marginTop: 12 }}>
      <Text style={globalStyles.label}>
        {t("component:music-picker.label")}
      </Text>

      {!fileName ? (
        <TouchableOpacity
          style={[
            globalStyles.mediaIntegrationContainer,
            {
              borderColor: projectColor,
            },
          ]}
          onPress={pickAudio}
        >
          <Ionicons
            name="musical-notes-outline"
            size={32}
            color={projectColor}
          />
          <Text
            style={[globalStyles.text, { color: projectColor, marginTop: 8 }]}
          >
            {t("component:music-picker.placeholder")}
          </Text>
          <Text style={globalStyles.discreetText}>
            {t("component:music-picker.hint")}
          </Text>
        </TouchableOpacity>
      ) : (
        <View
          style={[
            globalStyles.card,
            {
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              borderColor: projectColor,
              borderWidth: 1,
            },
          ]}
        >
          <Ionicons
            name="musical-note"
            size={24}
            color={projectColor}
            style={{ marginRight: 12 }}
          />

          <View style={{ flex: 1 }}>
            <Text style={globalStyles.text} numberOfLines={1}>
              {fileName}
            </Text>
            <Text style={globalStyles.discreetText}>
              {t("component:music-picker.ready")}
            </Text>
          </View>

          <TouchableOpacity onPress={removeFile}>
            <Ionicons name="trash-outline" size={20} color={Colors.alert} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
