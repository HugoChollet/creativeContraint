import { AddButton } from "@/components/generic/add-button";
import ColorPicker from "@/components/generic/color-picker";
import Description from "@/components/generic/description";
import { Header } from "@/components/generic/header";
import { Spacer } from "@/components/generic/spacer";
import CategoryHeader from "@/components/specific/category/category-header";
import { getProjectColor } from "@/constants/theme";
import { useCollection } from "@/hooks/use-collection";
import { useStyles } from "@/hooks/use-styles";
import { Category } from "@/types/category";
import { Project } from "@/types/projects";
import { useHeaderHeight } from "@react-navigation/elements";
import { useLocalSearchParams, useRouter } from "expo-router";
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

const CategoryRequire = { MIN_OPTIONS: 2, NAME_LENGTH_MIN: 2 };

export default function ProjectFormScreen() {
  const { type: projectLabel } = useLocalSearchParams<{
    type: string;
  }>();

  const { globalStyles, colors, theme } = useStyles();
  const { t } = useTranslation();

  const headerHeight = useHeaderHeight();
  const { addRecord, loading: isSaving } = useCollection<Project>("projects");
  const router = useRouter();

  const [name, setName] = useState("New");
  const [description, setDescription] = useState("");

  const [isLoading] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);

  const [projectHexColor, setProjectHexColor] = useState("#ffff");
  const projectColorSoft = getProjectColor({
    color: projectHexColor,
    opacity: 0.2,
    theme,
  });

  const handleSubmit = async () => {
    if (!isFormValid || isSaving) return;

    const newProject = {
      name,
      description,
      is_public: false, // Defaulting to private for now
      favorited_counter: 0,
    };

    const result = await addRecord(newProject);

    if (result) {
      // Success! Go back to the previous screen
      console.log("success");
    } else {
      // You might want to show an Alert here if result is null
      console.error("Failed to save project");
    }
  };

  const isFormValid =
    name.length > CategoryRequire.NAME_LENGTH_MIN &&
    //categories.length >= CategoryRequire.MIN_OPTIONS &&
    !isLoading;

  return (
    <>
      <Header
        title={t("screen:project_form.title", { type: projectLabel })}
        color={projectHexColor}
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
            <View
              style={{
                marginBottom: 20,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View>
                <Text style={globalStyles.label}>
                  {t("screen:project_form.name_label") + " *"}
                </Text>
                <TextInput
                  style={[
                    globalStyles.input,
                    { borderColor: projectColorSoft },
                  ]}
                  placeholder={t("screen:project_form.name_placeholder")}
                  placeholderTextColor={colors.placeholder}
                  value={name}
                  onChangeText={setName}
                  editable={!isLoading}
                />
              </View>

              <View style={{ marginTop: 24 }}>
                <ColorPicker
                  defaultValue={projectHexColor}
                  setColor={setProjectHexColor}
                  toggleOpen={() => {}}
                />
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={globalStyles.label}>
                {t("screen:project_form.description_label")}
              </Text>
              <Description
                description={description}
                setDescription={setDescription}
                placeholder={t("screen:project_form.description_placeholder")}
                projectColor={projectHexColor}
                isLoading={isLoading}
              />
            </View>

            <Text style={globalStyles.label}>
              {t("screen:project_form.category_list_label", {
                min: CategoryRequire.MIN_OPTIONS,
              })}
            </Text>
            <AddButton
              projectColor={projectHexColor}
              label={t("screen:lab.add-button.label-category")}
              onClick={() =>
                router.push({
                  pathname: "/category-browse",
                  params: { type: "new" },
                })
              }
            />
            <View>
              {categories
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((category: Category) => {
                  return (
                    <View key={category.id}>
                      <CategoryHeader
                        category={category}
                        isExpanded={false}
                        onExpand={() => () => {}}
                        color={projectHexColor}
                        isEnabled={true}
                        subtitle={
                          category.options
                            ? t("component:category_item.possibilities", {
                                count: category.options.length,
                              })
                            : undefined
                        }
                      />
                      {category.id !== categories[categories.length - 1].id && (
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
                backgroundColor: isFormValid ? projectHexColor : colors.disable,
              },
            ]}
            onPress={() => handleSubmit()}
            disabled={!isFormValid}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.invertedText} />
            ) : (
              <Text style={globalStyles.secondaryButtonText}>
                {t("screen:project_form.submit_button")}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
