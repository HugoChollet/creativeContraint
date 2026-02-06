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
      <View
        style={[
          globalStyles.hardContainer,
          { borderColor: projectColor, borderWidth: 0.5 },
        ]}
      >
        <Text style={[globalStyles.subtitle, { marginTop: 0 }]}>Contenu</Text>
        {/* Ici viendra le sélecteur de fichier spécifique */}
        <View
          style={{
            height: 100,
            borderStyle: "dashed",
            borderWidth: 1,
            borderColor: colors.textDiscreet,
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={globalStyles.discreetText}>
            Espace pour le futur sélecteur de média
          </Text>
        </View>
      </View>

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
