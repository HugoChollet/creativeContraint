import {
  MediaPicker,
  MediaPickerResult,
} from "@/components/specific/media-pickers";
import { getProjectColor } from "@/constants/theme";
import { useStyles } from "@/hooks/use-styles";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SubmitFormScreen() {
  const { type: projectLabel } = useLocalSearchParams<{
    id: string;
    type: string;
  }>();

  const { globalStyles, colors } = useStyles();
  const { t } = useTranslation();

  const projectColor = getProjectColor(projectLabel);
  const projectColorSoft = getProjectColor(projectLabel, 0.2);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState<MediaPickerResult>({
    type: null,
    value: null,
    isValid: false,
  });

  const isFormValid = title.length > 2 && media.isValid;

  const handlePublish = async () => {
    if (!isFormValid) return;

    // C'est ici qu'on appellera nos fonctions Supabase
    console.log("Publishing:", { title, description, media });
  };

  return (
    <ScrollView
      style={globalStyles.screenContainer}
      contentContainerStyle={{ paddingVertical: 20 }}
    >
      <Text style={[globalStyles.title, { color: projectColor }]}>
        {t("screen:submit.publish") + projectLabel}
      </Text>

      <View style={{ marginBottom: 20 }}>
        <Text style={globalStyles.label}>{t("screen:submit.title_label")}</Text>
        <TextInput
          style={[globalStyles.input, { borderColor: projectColorSoft }]}
          placeholder={t("screen:submit.title_placeholder")}
          placeholderTextColor={colors.placeholder}
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={globalStyles.label}>
          {t("screen:submit.description_label")}
        </Text>
        <TextInput
          style={[
            globalStyles.input,
            {
              height: 120,
              textAlignVertical: "top",
              paddingTop: 12,
              borderColor: projectColorSoft,
            },
          ]}
          placeholder={t("screen:submit.description_placeholder")}
          placeholderTextColor={colors.placeholder}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />
      </View>

      <MediaPicker
        projectLabel={projectLabel}
        projectColor={projectColor}
        onChange={setMedia}
      />
      <TouchableOpacity
        style={[
          globalStyles.secondaryButton,
          { backgroundColor: projectColor },
        ]}
        onPress={() => {}}
      >
        <Text style={globalStyles.secondaryButtonText}>
          {t("screen:submit.publish_button")}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
