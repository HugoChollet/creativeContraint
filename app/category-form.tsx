import Description from "@/components/generic/description";
import { Header } from "@/components/generic/header";
import { Spacer } from "@/components/generic/spacer";
import ConstraintCrud from "@/components/specific/constraint-crud";
import ConstraintForm from "@/components/specific/constraint-form";
import { getProjectColor } from "@/constants/theme";
import { useStyles } from "@/hooks/use-styles";
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

const ConstraintRequire = { MIN_OPTIONS: 2, NAME_LENGTH_MIN: 6 };

export default function CategoryFormScreen() {
  const { type: projectLabel } = useLocalSearchParams<{
    type: string;
  }>();

  const { globalStyles, colors } = useStyles();
  const { t } = useTranslation();
  const headerHeight = useHeaderHeight();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [isLoading] = useState(false);

  const [options, setOptions] = useState<Option[]>([]);

  const projectColor = getProjectColor(projectLabel);
  const projectColorSoft = getProjectColor(projectLabel, 0.2);

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
              }}
              projectColor={projectColor}
            />
            <View>
              {options
                .sort((a, b) => a.value.localeCompare(b.value))
                .map((opt: Option) => {
                  return (
                    <View key={opt.id}>
                      <ConstraintCrud
                        option={opt}
                        onDelete={() => {}}
                        onEdit={() => {}}
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
            onPress={() => {}}
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
