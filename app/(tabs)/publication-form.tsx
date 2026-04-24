import { Header } from "@/components/generic/header";
import {
  MediaPicker,
  MediaPickerResult,
} from "@/components/specific/pickers/media-pickers";
import { getProjectColor } from "@/constants/theme";
import { useStyles } from "@/hooks/use-styles";
import { supabase } from "@/lib/supabase";
import { publicationService } from "@/services/publication.service";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function PublicationFormScreen() {
  const { id: constraintId, type: projectLabel } = useLocalSearchParams<{
    id: string;
    type: string;
  }>();

  const router = useRouter();
  const { globalStyles, colors, theme } = useStyles();
  const { t } = useTranslation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState<MediaPickerResult>({
    type: null,
    value: null,
    isValid: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  const projectColor = getProjectColor({ label: projectLabel, theme });
  const projectColorSoft = getProjectColor({
    label: projectLabel,
    opacity: 0.2,
    theme,
  });

  const isFormValid = title.length > 2 && media.isValid && !isLoading;

  const handlePublish = async () => {
    if (!isFormValid) return;

    try {
      setIsLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert(t("common:error"), t("screen:submit.errors.no_user"));
        return;
      }

      const result = await publicationService.createPublication({
        userId: user.id,
        title,
        description,
        projectType: projectLabel,
        media: media,
        constraintId: constraintId,
      });

      if (result.success) {
        Alert.alert(
          t("screen:submit.success_title"),
          t("screen:submit.success_msg"),
          [{ text: "OK", onPress: () => router.replace("/constraint-sets") }],
        );
      }
    } catch (error) {
      console.error("Publishing error:", error);
      Alert.alert(t("common:error"), t("screen:submit.errors.publish_failed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header
        title={t("screen:submit.publish") + " " + projectLabel}
        color={projectColor}
      />
      <ScrollView
        style={globalStyles.screenContainer}
        contentContainerStyle={{ paddingVertical: 20 }}
        keyboardShouldPersistTaps="handled" // Améliore l'UX avec le clavier
      >
        <View style={{ marginBottom: 20 }}>
          <Text style={globalStyles.label}>
            {t("screen:submit.title_label")}
          </Text>
          <TextInput
            style={[globalStyles.input, { borderColor: projectColorSoft }]}
            placeholder={t("screen:submit.title_placeholder")}
            placeholderTextColor={colors.placeholder}
            value={title}
            onChangeText={setTitle}
            editable={!isLoading}
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
            editable={!isLoading}
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
            {
              backgroundColor: isFormValid ? projectColor : colors.disable,
              marginTop: 10,
            },
          ]}
          onPress={handlePublish}
          disabled={!isFormValid}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.invertedText} />
          ) : (
            <Text style={globalStyles.secondaryButtonText}>
              {t("screen:submit.publish_button")}
            </Text>
          )}
        </TouchableOpacity>

        {/* Petit padding en bas pour éviter que le clavier cache le bouton */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}
