import { Colors } from "@/constants/theme";
import { useStyles } from "@/hooks/use-styles";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, TextInput, View } from "react-native";

interface YoutubeLinkPickerProps {
  projectColor: string;
  onUrlChange: (url: string, isValid: boolean) => void;
}

export const YoutubeLinkPicker = ({
  projectColor,
  onUrlChange,
}: YoutubeLinkPickerProps) => {
  const { globalStyles, colors } = useStyles();
  const { t } = useTranslation();

  const [url, setUrl] = useState("");
  const [isValid, setIsValid] = useState(true);

  // Regex simple pour valider les formats youtube (standard, short, youtu.be)
  const validateYoutubeUrl = (link: string) => {
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return regex.test(link) || link === "";
  };

  const handleChange = (text: string) => {
    setUrl(text);
    const valid = validateYoutubeUrl(text);
    setIsValid(valid);
    onUrlChange(text, valid);
  };

  return (
    <View style={{ marginTop: 12 }}>
      <Text style={globalStyles.label}>
        {t("component:youtube-picker.label")}
      </Text>

      <View
        style={[
          globalStyles.hardContainer,
          {
            borderColor: isValid ? projectColor : Colors.alert, // Orange/Rouge si invalide
            borderWidth: 1,
            padding: 16,
          },
        ]}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Ionicons
            name="logo-youtube"
            size={24}
            color={projectColor}
            style={{ marginRight: 10 }}
          />
          <Text style={globalStyles.text}>
            {t("component:youtube-picker.title")}
          </Text>
        </View>

        <TextInput
          style={[
            globalStyles.input,
            {
              backgroundColor: colors.background,
              borderColor: isValid ? colors.borderColor : Colors.alert,
            },
          ]}
          placeholder={t("component:youtube-picker.placeholder")}
          placeholderTextColor={colors.placeholder}
          value={url}
          onChangeText={handleChange}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />

        {!isValid && (
          <Text
            style={[
              globalStyles.discreetText,
              { color: Colors.alert, marginTop: 8 },
            ]}
          >
            {t("component:youtube-picker.invalid_error")}
          </Text>
        )}

        <Text style={[globalStyles.discreetText, { marginTop: 12 }]}>
          {t("component:youtube-picker.note")}
        </Text>
      </View>
    </View>
  );
};
