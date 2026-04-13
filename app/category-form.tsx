import Description from "@/components/generic/description";
import { Header } from "@/components/generic/header";
import ConstraintCrud from "@/components/specific/constraint-crud";
import ConstraintForm from "@/components/specific/constraint-form";
import { getProjectColor } from "@/constants/theme";
import { useStyles } from "@/hooks/use-styles";
import { Option } from "@/types/constraints";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ConstraintRequire = { MIN_OPTIONS: 2, NAME_LENGTH_MIN: 6 };

export default function CategoryFormScreen() {
  const { id: categoryId, type: projectLabel } = useLocalSearchParams<{
    id: string;
    type: string;
  }>();

  const { globalStyles, colors } = useStyles();
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

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
      <ScrollView
        style={globalStyles.screenContainer}
        contentContainerStyle={{ paddingVertical: 20 }}
        keyboardShouldPersistTaps="handled"
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
        <ScrollView nestedScrollEnabled={true}>
          {options
            .sort((a, b) => a.value.localeCompare(b.value))
            .map((opt: Option) => {
              return (
                <ConstraintCrud
                  key={opt.id}
                  option={opt}
                  onDelete={() => {}}
                  onEdit={() => {}}
                  projectColor={projectColor}
                />
              );
            })}
        </ScrollView>

        <ConstraintForm
          submit={(option: Option) => {
            setOptions([...options, option]);
            setModalVisible(false);
          }}
          projectColor={projectColor}
        />
      </ScrollView>
      <TouchableOpacity
        style={[
          globalStyles.secondaryButton,
          {
            backgroundColor: isFormValid ? projectColor : colors.disable,
            bottom: 10,
            marginHorizontal: 20,
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
    </>
  );
}

const styles = StyleSheet.create({});
