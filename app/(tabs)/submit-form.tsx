import { ImageMediaPicker } from "@/components/specific/image-picker";
import { MusicMediaPicker } from "@/components/specific/music-picker";
import { YoutubeLinkPicker } from "@/components/specific/youtube-picker";
import { getProjectColor } from "@/constants/theme";
import { useStyles } from "@/hooks/use-styles";
import * as DocumentPicker from "expo-document-picker";
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

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [audioFile, setAudioFile] =
    useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isUrlValid, setIsUrlValid] = useState(false);

  return (
    <ScrollView
      style={globalStyles.screenContainer}
      contentContainerStyle={{ paddingVertical: 20 }}
    >
      <Text style={[globalStyles.title, { color: projectColor }]}>
        {t("screen:submit.publish") + projectLabel}
      </Text>

      {/* CHAMP TITRE */}
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

      {/* CHAMP DESCRIPTION */}
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

      {/* SECTION MÉDIA (On la remplira dynamiquement après) */}
      {/* Ici viendra le sélecteur de fichier spécifique */}
      {["Photography", "Cooking", "Board Game"].includes(projectLabel) && (
        <ImageMediaPicker
          projectColor={projectColor}
          onImageSelected={setSelectedImage}
        />
      )}
      {projectLabel === "Music" && (
        <MusicMediaPicker
          projectColor={projectColor}
          onFileSelected={setAudioFile}
        />
      )}
      {(projectLabel === "Video Fiction" ||
        projectLabel === "Internet Video") && (
        <YoutubeLinkPicker
          projectColor={projectColor}
          onUrlChange={(url, valid) => {
            setYoutubeUrl(url);
            setIsUrlValid(valid);
          }}
        />
      )}
      {/* BOUTON PUBLIER */}
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
