import { ConfirmCancelButton } from "@/components/generic/confirm-cancel-buttons";
import Description from "@/components/generic/description";
import { Header } from "@/components/generic/header";
import LanguageSelector from "@/components/generic/language-selector";
import { Spacer } from "@/components/generic/spacer";
import TagSelector, {
  TagSelectorOption,
} from "@/components/generic/tag-selector";
import ConstraintCrud from "@/components/specific/constraint/constraint-crud";
import ConstraintForm from "@/components/specific/constraint/constraint-form";
import {
  getDefaultProjectLanguage,
  normalizeProjectTags,
  PROJECT_TAGS,
  ProjectLanguage,
  ProjectTag,
  toggleProjectTag,
} from "@/constants/project-metadata";
import { getProjectColor } from "@/constants/theme";
import { useHomeProjects } from "@/contexts/home-projects-context";
import { useCollection } from "@/hooks/use-collection";
import { useStyles } from "@/hooks/use-styles";
import { getProjectTitle } from "@/lib/project-data";
import { Category } from "@/types/category";
import { Option } from "@/types/constraints";
import { useHeaderHeight } from "@react-navigation/elements";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

const ConstraintRequire = { MIN_OPTIONS: 2, NAME_LENGTH_MIN: 2 };
const CATEGORY_TAG_LIMIT = 2;

export default function CategoryFormScreen() {
  const { globalStyles, colors, theme } = useStyles();
  const { t, i18n } = useTranslation();
  const headerHeight = useHeaderHeight();
  const { activeProject, loading: loadingHomeProjects } = useHomeProjects();
  const { addRecord, loading: isSaving } =
    useCollection<Category>("categories");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState<ProjectLanguage>(
    getDefaultProjectLanguage(i18n.language),
  );
  const [tags, setTags] = useState<ProjectTag[]>([]);
  const [editedOption, setEditedOption] = useState<Option | undefined>();

  const [isLoading] = useState(false);

  const [options, setOptions] = useState<Option[]>([]);

  const projectTitle = activeProject
    ? getProjectTitle(activeProject.dataSource)
    : "Project";
  const projectColor = activeProject?.color
    ? getProjectColor({
        color: activeProject.color,
        theme,
      })
    : getProjectColor({
        label: activeProject?.routeType,
        theme,
      });
  const projectColorSoft = getProjectColor({
    ...(activeProject?.color
      ? { color: activeProject.color }
      : { label: activeProject?.routeType }),
    opacity: 0.2,
    theme,
  });
  const tagOptions = useMemo<TagSelectorOption[]>(
    () =>
      PROJECT_TAGS.map((value) => ({
        value,
        label: t(`component:metadata.tag_values.${value}`),
      })),
    [t],
  );

  const handleSubmit = async () => {
    if (!isFormValid || isSaving) return;

    const normalizedTags = normalizeProjectTags(tags);
    const newCategory = {
      name,
      description,
      options, // This will be saved as JSONB in Supabase
      language,
      tags: normalizedTags,
      is_public: false, // Defaulting to private for now
      favorited_counter: 0,
    };

    const result = await addRecord(newCategory);

    if (result) {
      // Success! Go back to the previous screen
      console.log("success");
      router.push({
        pathname: "/category-browse",
        params: {
          mode: "edition",
        },
      });
    } else {
      // You might want to show an Alert here if result is null
      console.error("Failed to save category");
    }
  };

  const isFormValid =
    name.length > ConstraintRequire.NAME_LENGTH_MIN &&
    options.length >= ConstraintRequire.MIN_OPTIONS &&
    !isLoading;

  if (loadingHomeProjects && !activeProject) {
    return (
      <View
        style={[globalStyles.screenContainer, { justifyContent: "center" }]}
      >
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  return (
    <>
      <Header
        title={t("screen:category_form.title", { type: projectTitle })}
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

            <LanguageSelector
              label={t("component:metadata.language_label")}
              selectedLanguage={language}
              onChange={setLanguage}
              color={projectColor}
            />

            <TagSelector
              label={t("component:metadata.tags_label")}
              options={tagOptions}
              selectedValues={tags}
              onChange={(values) => {
                const latestValue = values.find(
                  (value): value is ProjectTag =>
                    PROJECT_TAGS.includes(value as ProjectTag) &&
                    !tags.includes(value as ProjectTag),
                );

                if (!latestValue) {
                  setTags(normalizeProjectTags(values));
                  return;
                }

                setTags(
                  toggleProjectTag(
                    tags,
                    latestValue as ProjectTag,
                    CATEGORY_TAG_LIMIT,
                  ),
                );
              }}
              helperText={t("component:metadata.tags_limit", {
                count: tags.length,
                max: CATEGORY_TAG_LIMIT,
              })}
              color={projectColor}
              maxSelections={CATEGORY_TAG_LIMIT}
              alwaysEnabledValues={["all"]}
            />

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

        <ConfirmCancelButton
          color={projectColor}
          labelConfirm={t("screen:category_form.submit_button")}
          isActive={isFormValid}
          isLoading={isSaving || isLoading}
          onClickConfirm={handleSubmit}
          onClickCancel={() =>
            router.navigate({
              pathname: "/category-browse",
              params: {
                mode: "edition",
              },
            })
          }
        />
      </View>
    </>
  );
}
