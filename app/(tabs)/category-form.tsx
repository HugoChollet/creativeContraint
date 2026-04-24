import Description from "@/components/generic/description";
import { Header } from "@/components/generic/header";
import { Spacer } from "@/components/generic/spacer";
import ConstraintCrud from "@/components/specific/constraint/constraint-crud";
import ConstraintForm from "@/components/specific/constraint/constraint-form";
import { getProjectColor } from "@/constants/theme";
import { useCollection } from "@/hooks/use-collection";
import { useStyles } from "@/hooks/use-styles";
import { Category } from "@/types/category";
import { Option } from "@/types/constraints";
import { useHeaderHeight } from "@react-navigation/elements";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ConstraintRequire = { MIN_OPTIONS: 2, NAME_LENGTH_MIN: 2 };

export default function CategoryFormScreen() {
  const { type: projectLabel } = useLocalSearchParams<{
    type: string;
  }>();

  const { globalStyles, colors, theme } = useStyles();
  const { t } = useTranslation();
  const headerHeight = useHeaderHeight();
  const { addRecord, loading: isSaving } =
    useCollection<Category>("categories");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editedOption, setEditedOption] = useState<Option | undefined>();

  const [isLoading] = useState(false);

  const [options, setOptions] = useState<Option[]>([]);

  const projectColor = getProjectColor({ label: projectLabel, theme });
  const projectColorSoft = getProjectColor({
    label: projectLabel,
    opacity: 0.2,
    theme,
  });

  const handleSubmit = async () => {
    if (!isFormValid || isSaving) return;

    const newCategory = {
      name,
      description,
      options, // This will be saved as JSONB in Supabase
      project_type_id: projectLabel, // 'cooking', 'music', etc.
      is_public: false, // Defaulting to private for now
      favorited_counter: 0,
    };

    const result = await addRecord(newCategory);

    if (result) {
      // Success! Go back to the previous screen
      console.log("success");
    } else {
      // You might want to show an Alert here if result is null
      console.error("Failed to save category");
    }
  };

  const isFormValid =
    name.length > ConstraintRequire.NAME_LENGTH_MIN &&
    options.length >= ConstraintRequire.MIN_OPTIONS &&
    !isLoading;

  return (
    <>
      <Header
        title={t("screen:category_form.title", { type: projectLabel })}
        color={projectColor}
      />
      <View style={globalStyles.screenContainer}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : 0}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={
              Platform.OS === "ios" ? "interactive" : "on-drag"
            }
            contentContainerStyle={{ paddingVertical: 20, paddingBottom: 120 }}
          >
            <View style={{ marginBottom: 20 }}>
              <Text style={globalStyles.label}>
                {t("screen:category_form.name_label") + " *"}
              </Text>
              <TextInput
                style={[globalStyles.input, { borderColor: projectColorSoft }]}
                placeholder={t("screen:category_form.name_placeholder")}
                placeholderTextColor={colors.placeholder}
                value={name}
                onChangeText={setName}
                editable={!isLoading}
              />
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={globalStyles.label}>
                {t("screen:category_form.description_label")}
              </Text>
              <Description
                description={description}
                setDescription={setDescription}
                placeholder={t("screen:category_form.description_placeholder")}
                projectColor={projectColor}
                isLoading={isLoading}
              />
            </View>

            <Text style={globalStyles.label}>
              {t("screen:category_form.constraint_list_label", {
                min: ConstraintRequire.MIN_OPTIONS,
              })}
            </Text>
            <ConstraintForm
              submit={(option: Option) => {
                setOptions([...options, option]);
                setEditedOption(undefined);
              }}
              projectColor={projectColor}
              editedOption={editedOption}
            />
            <View>
              {options
                .sort((a, b) => a.value.localeCompare(b.value))
                .map((opt: Option) => {
                  return (
                    <View key={opt.id}>
                      <ConstraintCrud
                        option={opt}
                        onDelete={() =>
                          setOptions(options.filter((o) => o.id !== opt.id))
                        }
                        onEdit={() => {
                          setEditedOption(opt);
                          setOptions(options.filter((o) => o.id !== opt.id));
                        }}
                        projectColor={projectColor}
                      />
                      {opt.id !== options[options.length - 1].id && (
                        <>
                          <Spacer divider={true} color={projectColorSoft} />
                          <Spacer height={8} />
                        </>
                      )}
                    </View>
                  );
                })}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <View style={{ paddingTop: 12, paddingBottom: 20 }}>
          <TouchableOpacity
            style={[
              globalStyles.secondaryButton,
              {
                backgroundColor: isFormValid ? projectColor : colors.disable,
              },
            ]}
            onPress={() => handleSubmit()}
            disabled={!isFormValid}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.invertedText} />
            ) : (
              <Text style={globalStyles.secondaryButtonText}>
                {t("screen:category_form.submit_button")}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
