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
  getCategoryTagsFromGenerator,
  getDefaultGeneratorLanguage,
  normalizeGeneratorTags,
  GENERATOR_TAGS,
  GeneratorLanguage,
  GeneratorTag,
  toggleGeneratorTag,
} from "@/constants/generator-metadata";
import { getGeneratorColor } from "@/constants/theme";
import { useHomeGenerators } from "@/contexts/home-generators-context";
import { useCollection } from "@/hooks/use-collection";
import { useStyles } from "@/hooks/use-styles";
import { getGeneratorTitle } from "@/lib/generator-data";
import { Category } from "@/types/category";
import { Option } from "@/types/constraints";
import { useHeaderHeight } from "@react-navigation/elements";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
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

const cleanCategoryOptions = (values: Option[]) =>
  values
    .map((option) => ({
      ...option,
      value: option.value.trim(),
      description: option.description?.trim() || undefined,
    }))
    .filter((option) => option.value.length > 0);

const cleanCategoryDraft = ({
  name,
  description,
  options,
  language,
  tags,
}: {
  name: string;
  description: string;
  options: Option[];
  language: GeneratorLanguage;
  tags: readonly string[];
}) => ({
  name: name.trim(),
  description: description.trim(),
  options: cleanCategoryOptions(options),
  language: getDefaultGeneratorLanguage(language),
  tags: normalizeGeneratorTags(tags),
});

export default function CategoryFormScreen() {
  const {
    categoryId,
    categoryAction,
  } = useLocalSearchParams<{
    categoryId?: string;
    categoryAction?: string;
  }>();
  const { globalStyles, colors, theme } = useStyles();
  const { t, i18n } = useTranslation();
  const headerHeight = useHeaderHeight();
  const { activeGenerator, loading: loadingHomeGenerators } = useHomeGenerators();
  const {
    addRecord,
    updateRecord,
    fetchCollection,
    loading: isSaving,
  } = useCollection<Category>("categories");
  const initialGeneratorLanguage = getDefaultGeneratorLanguage(
    activeGenerator?.language ?? i18n.language,
  );
  const initialGeneratorTags = getCategoryTagsFromGenerator(activeGenerator?.tags);
  const isEditMode = categoryAction === "edit";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState<GeneratorLanguage>(
    initialGeneratorLanguage,
  );
  const [tags, setTags] = useState<GeneratorTag[]>(initialGeneratorTags);
  const [editedOption, setEditedOption] = useState<Option | undefined>();
  const [options, setOptions] = useState<Option[]>([]);
  const [isHydratingCategory, setIsHydratingCategory] = useState(
    Boolean(categoryId),
  );

  const generatorTitle = activeGenerator
    ? getGeneratorTitle(activeGenerator.dataSource)
    : "Generator";
  const generatorColor = activeGenerator?.color
    ? getGeneratorColor({
        color: activeGenerator.color,
        theme,
      })
    : getGeneratorColor({
        label: activeGenerator?.routeType,
        theme,
      });
  const generatorColorSoft = getGeneratorColor({
    ...(activeGenerator?.color
      ? { color: activeGenerator.color }
      : { label: activeGenerator?.routeType }),
    opacity: 0.2,
    theme,
  });
  const tagOptions = useMemo<TagSelectorOption[]>(
    () =>
      GENERATOR_TAGS.map((value) => ({
        value,
        label: t(`component:metadata.tag_values.${value}`),
      })),
    [t],
  );
  const cleanedDraft = useMemo(
    () =>
      cleanCategoryDraft({
        name,
        description,
        options,
        language,
        tags,
      }),
    [description, language, name, options, tags],
  );

  useEffect(() => {
    if (categoryId) {
      return;
    }

    setLanguage(initialGeneratorLanguage);
    setTags(initialGeneratorTags);
  }, [categoryId, initialGeneratorLanguage, initialGeneratorTags]);

  useEffect(() => {
    let isActive = true;

    if (!categoryId) {
      setIsHydratingCategory(false);
      return;
    }

    const loadCategory = async () => {
      setIsHydratingCategory(true);
      const result = await fetchCollection({
        filterColumn: "id",
        filterValue: categoryId,
      });

      if (!isActive) {
        return;
      }

      const category = result[0];

      if (!category) {
        console.error("Failed to load category");
        setIsHydratingCategory(false);
        router.back();
        return;
      }

      setName(category.name);
      setDescription(category.description);
      setLanguage(
        getDefaultGeneratorLanguage(category.language ?? activeGenerator?.language),
      );
      setTags(getCategoryTagsFromGenerator(category.tags ?? activeGenerator?.tags));
      setOptions(category.options ?? []);
      setEditedOption(undefined);
      setIsHydratingCategory(false);
    };

    void loadCategory();

    return () => {
      isActive = false;
    };
  }, [
    activeGenerator?.language,
    activeGenerator?.tags,
    categoryId,
    fetchCollection,
  ]);

  const handleSubmit = async () => {
    if (!isFormValid || isSaving || isHydratingCategory) return;

    const categoryDraft = {
      name: cleanedDraft.name,
      description: cleanedDraft.description,
      options: cleanedDraft.options,
      language: cleanedDraft.language,
      tags: cleanedDraft.tags,
    };

    const result =
      isEditMode && categoryId
        ? await updateRecord(categoryId, categoryDraft)
        : await addRecord({
            ...categoryDraft,
            is_public: false,
            favorited_counter: 0,
          });

    if (result) {
      router.back();
    } else {
      console.error("Failed to save category");
    }
  };

  const isFormValid =
    cleanedDraft.name.length > ConstraintRequire.NAME_LENGTH_MIN &&
    cleanedDraft.options.length >= ConstraintRequire.MIN_OPTIONS &&
    !isHydratingCategory;

  if (loadingHomeGenerators && !activeGenerator) {
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
        title={t("screen:category_form.title", { type: generatorTitle })}
        color={generatorColor}
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
                style={[globalStyles.input, { borderColor: generatorColorSoft }]}
                placeholder={t("screen:category_form.name_placeholder")}
                placeholderTextColor={colors.placeholder}
                value={name}
                onChangeText={setName}
                editable={!isHydratingCategory}
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
                generatorColor={generatorColor}
                isLoading={isHydratingCategory}
              />
            </View>

            <LanguageSelector
              label={t("component:metadata.language_label")}
              selectedLanguage={language}
              onChange={setLanguage}
              color={generatorColor}
            />

            <TagSelector
              label={t("component:metadata.tags_label")}
              options={tagOptions}
              selectedValues={tags}
              onChange={(values) => {
                const latestValue = values.find(
                  (value): value is GeneratorTag =>
                    GENERATOR_TAGS.includes(value as GeneratorTag) &&
                    !tags.includes(value as GeneratorTag),
                );

                if (!latestValue) {
                  setTags(normalizeGeneratorTags(values));
                  return;
                }

                setTags(
                  toggleGeneratorTag(
                    tags,
                    latestValue as GeneratorTag,
                    CATEGORY_TAG_LIMIT,
                  ),
                );
              }}
              helperText={t("component:metadata.tags_limit", {
                count: tags.length,
                max: CATEGORY_TAG_LIMIT,
              })}
              color={generatorColor}
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
              generatorColor={generatorColor}
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
                        generatorColor={generatorColor}
                      />
                      {opt.id !== options[options.length - 1].id && (
                        <>
                          <Spacer divider={true} color={generatorColorSoft} />
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
          color={generatorColor}
          labelConfirm={t("screen:category_form.submit_button")}
          isActive={isFormValid}
          isLoading={isSaving || isHydratingCategory}
          onClickConfirm={handleSubmit}
          onClickCancel={() => router.back()}
        />
      </View>
    </>
  );
}
