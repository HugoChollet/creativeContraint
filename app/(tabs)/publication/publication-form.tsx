import { Header } from "@/components/generic/header";
import {
  MediaPicker,
  MediaPickerResult,
} from "@/components/specific/pickers/media-pickers";
import { getContrastingColor, getGeneratorColor } from "@/constants/theme";
import { useCollection } from "@/hooks/use-collection";
import { useStyles } from "@/hooks/use-styles";
import {
  CONSTRAINT_SET_SELECT,
  getConstraintSetGeneratorColor,
  getConstraintSetGeneratorLabel,
  getConstraintSetGeneratorSupportedFile,
} from "@/lib/constraint-set-data";
import { supabase } from "@/lib/supabase";
import { publicationService } from "@/services/publication.service";
import { SavedConstraintSet } from "@/types/constraints";
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
  const { id: constraintId } = useLocalSearchParams<{ id?: string }>();
  const routeConstraintId = Array.isArray(constraintId)
    ? constraintId[0]
    : constraintId;

  const router = useRouter();
  const { globalStyles, colors, theme } = useStyles();
  const { t } = useTranslation();
  const { data: constraintSets, loading: loadingConstraintSet } =
    useCollection<SavedConstraintSet>("constraint_sets", {
      select: CONSTRAINT_SET_SELECT,
      filterColumn: "id",
      filterValue: routeConstraintId ?? "__missing_constraint_set__",
    });
  const constraintSet = constraintSets[0] ?? null;
  const projectLabel = constraintSet
    ? getConstraintSetGeneratorLabel(constraintSet)
    : "Generator";
  const generatorColor = constraintSet
    ? getConstraintSetGeneratorColor({
        constraintSet,
        theme,
      })
    : colors.tint;
  const generatorColorSoft = constraintSet?.color
    ? getGeneratorColor({
        color: constraintSet.color,
        opacity: 0.2,
        theme,
      })
    : colors.borderColor;
  const supportedFileType = constraintSet
    ? getConstraintSetGeneratorSupportedFile(constraintSet)
    : null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState<MediaPickerResult>({
    type: null,
    value: null,
    isValid: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const isFormValid = title.length > 2 && media.isValid && !isLoading;
  const submitButtonColor = isFormValid ? generatorColor : colors.disable;
  const submitButtonTextColor = getContrastingColor(
    submitButtonColor,
    "primary",
  );

  if (loadingConstraintSet && !constraintSet && routeConstraintId) {
    return (
      <View
        style={[globalStyles.screenContainer, { justifyContent: "center" }]}
      >
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  if (!routeConstraintId || !constraintSet) {
    return (
      <View style={globalStyles.screenContainer}>
        <Header title={t("screen:submit.publish")} color={generatorColor} />
        <Text style={globalStyles.subtitle}>
          {t("screen:submit.errors.publish_failed")}
        </Text>
      </View>
    );
  }

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
        projectLabel,
        media: media,
        constraintId: routeConstraintId,
      });

      if (result.success) {
        Alert.alert(
          t("screen:submit.success_title"),
          t("screen:submit.success_msg"),
          [
            {
              text: "OK",
              onPress: () =>
                router.replace("/(tabs)/constraint-set/constraint-sets"),
            },
          ],
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
        color={generatorColor}
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
            style={[globalStyles.input, { borderColor: generatorColorSoft }]}
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
                borderColor: generatorColorSoft,
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
          supportedFileType={supportedFileType}
          generatorColor={generatorColor}
          onChange={setMedia}
        />
        <TouchableOpacity
          style={[
            globalStyles.secondaryButton,
            {
              backgroundColor: submitButtonColor,
              marginTop: 10,
            },
          ]}
          onPress={handlePublish}
          disabled={!isFormValid}
        >
          {isLoading ? (
            <ActivityIndicator color={submitButtonTextColor} />
          ) : (
            <Text
              style={[
                globalStyles.secondaryButtonText,
                { color: submitButtonTextColor },
              ]}
            >
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
