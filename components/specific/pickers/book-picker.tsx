import { getContrastingColor } from "@/constants/theme";
import { useStyles } from "@/hooks/use-styles";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

interface BookMediaPickerProps {
  generatorColor: string;
  onContentChange: (data: {
    type: "text" | "file";
    value: string | DocumentPicker.DocumentPickerResult | null;
  }) => void;
}

export const BookMediaPicker = ({
  generatorColor,
  onContentChange,
}: BookMediaPickerProps) => {
  const { t } = useTranslation();
  const { globalStyles, colors } = useStyles();

  const [mode, setMode] = useState<"text" | "file">("text");
  const [textContent, setTextContent] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      copyToCacheDirectory: true,
    });

    if (!result.canceled) {
      setFileName(result.assets[0].name);
      onContentChange({ type: "file", value: result });
    }
  };

  return (
    <View style={{ marginTop: 12 }}>
      <Text style={globalStyles.label}>{t("component:book-picker.label")}</Text>

      {/* TABS SELECTOR */}
      <View style={[globalStyles.tabContainer, { marginBottom: 12 }]}>
        <TouchableOpacity
          onPress={() => setMode("text")}
          style={[
            globalStyles.tabSegment,
            mode === "text" && { backgroundColor: generatorColor },
          ]}
        >
          <Text
            style={[
              globalStyles.tabText,
              {
                color:
                  mode === "text"
                    ? getContrastingColor(generatorColor, "primary")
                    : colors.textDiscreet,
              },
            ]}
          >
            {t("component:book-picker.tab_write")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setMode("file")}
          style={[
            globalStyles.tabSegment,
            mode === "file" && { backgroundColor: generatorColor },
          ]}
        >
          <Text
            style={[
              globalStyles.tabText,
              {
                color:
                  mode === "file"
                    ? getContrastingColor(generatorColor, "primary")
                    : colors.textDiscreet,
              },
            ]}
          >
            {t("component:book-picker.tab_upload")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* INPUTS DYNAMIQUE */}
      {mode === "text" ? (
        <TextInput
          style={[
            globalStyles.input,
            {
              height: 200,
              textAlignVertical: "top",
              paddingTop: 12,
              borderColor: generatorColor,
            },
          ]}
          placeholder={t("component:book-picker.input_placeholder")}
          placeholderTextColor={colors.placeholder}
          multiline
          value={textContent}
          onChangeText={(txt) => {
            setTextContent(txt);
            onContentChange({ type: "text", value: txt });
          }}
        />
      ) : (
        <TouchableOpacity
          style={[
            globalStyles.mediaIntegrationContainer,
            {
              borderColor: generatorColor,
            },
          ]}
          onPress={pickDocument}
        >
          <Ionicons
            name={fileName ? "document-text" : "document-attach-outline"}
            size={32}
            color={generatorColor}
          />
          <Text
            style={[globalStyles.text, { color: generatorColor, marginTop: 8 }]}
          >
            {fileName ? fileName : t("component:book-picker.file_placeholder")}
          </Text>
          <Text style={globalStyles.discreetText}>
            {t("component:book-picker.file_hint")}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
