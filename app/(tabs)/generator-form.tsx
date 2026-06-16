import { AddButton } from "@/components/generic/add-button";
import { ConfirmCancelButton } from "@/components/generic/confirm-cancel-buttons";
import Description from "@/components/generic/description";
import ExpandableHeader from "@/components/generic/expandable-header";
import { Header } from "@/components/generic/header";
import LanguageSelector from "@/components/generic/language-selector";
import { MainButton } from "@/components/generic/main-button";
import { Spacer } from "@/components/generic/spacer";
import TagSelector, {
  TagSelectorOption,
} from "@/components/generic/tag-selector";
import GeneratorJsonImporter, {
  isImportedDraftCategory,
} from "@/components/specific/generator/generator-json-importer";
import {
  getCategoryTagsFromGenerator,
  getDefaultGeneratorSupportedFileType,
  getDefaultGeneratorTags,
  getPrimaryGeneratorTag,
  normalizeGeneratorTags,
  prioritizeGeneratorTag,
  GENERATOR_SUPPORTED_FILE_TYPES,
  GENERATOR_TAGS,
  GeneratorLanguage,
  GeneratorTag,
  toggleGeneratorTag,
} from "@/constants/generator-metadata";
import { getHomeGeneratorImageFromTag } from "@/constants/home-generators";
import { getGeneratorColor } from "@/constants/theme";
import { useGeneratorDraft } from "@/contexts/generator-draft-context";
import { useCollection } from "@/hooks/use-collection";
import { useStyles } from "@/hooks/use-styles";
import { Category } from "@/types/category";
import { Option } from "@/types/constraints";
import { Generator, GeneratorCategoryRelation } from "@/types/generators";
import { useHeaderHeight } from "@react-navigation/elements";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

const GeneratorFormRequirements = {
  MIN_CATEGORIES: 2,
  NAME_LENGTH_MIN: 2,
  GENERATOR_TAGS_MIN: 1,
  PROJECT_FILE_MIN: 1,
};
const PROJECT_TAG_LIMIT = 4;

const normalizeCategoryName = (value: string) => value.trim().toLowerCase();

export default function GeneratorFormScreen() {
  const { type: projectLabel } = useLocalSearchParams<{
    type: string;
  }>();

  const { globalStyles, colors, theme } = useStyles();
  const { t } = useTranslation();

  const headerHeight = useHeaderHeight();
  const {
    addRecord,
    updateRecord,
    loading: isSavingGenerator,
  } = useCollection<Generator>("projects");
  const {
    data: existingCategories,
    fetchCollection: fetchCategories,
    addRecords: addCategories,
    loading: isSavingCategories,
  } = useCollection<Category>("categories", {
    orderBy: "name",
    ascending: true,
  });
  const {
    fetchCollection: fetchGeneratorCategoryRelations,
    addRecords: addGeneratorCategoryRelations,
    deleteRecords: deleteGeneratorCategoryRelations,
    loading: isSavingRelation,
  } = useCollection<GeneratorCategoryRelation>("project_category_relations");

  const router = useRouter();
  const {
    id,
    name,
    setName,
    description,
    setDescription,
    language,
    setLanguage,
    supportedFileType,
    setSupportedFileType,
    tags,
    setTags,
    generatorColor,
    selectedCategories,
    setSelectedCategories,
    resetGeneratorDraft,
  } = useGeneratorDraft();

  const [isLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const generatorColorSoft = getGeneratorColor({
    color: generatorColor,
    opacity: 0.2,
    theme,
  });
  const sortedCategories = [...selectedCategories].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const isBusy = isLoading || isImporting;
  const normalizedTags = normalizeGeneratorTags(tags);
  const selectedSupportedFileTypes = supportedFileType
    ? [supportedFileType]
    : [];
  const trimmedName = name.trim();
  const tagOptions = useMemo<TagSelectorOption[]>(
    () =>
      GENERATOR_TAGS.map((value) => ({
        value,
        label: t(`component:metadata.tag_values.${value}`),
      })),
    [t],
  );
  const supportedFileTypeOptions = useMemo<TagSelectorOption[]>(
    () =>
      GENERATOR_SUPPORTED_FILE_TYPES.map((value) => ({
        value,
        label: t(`component:metadata.supported_files.${value}`),
      })),
    [t],
  );
  const visualTag = getPrimaryGeneratorTag(normalizedTags);
  const visualTagOptions = useMemo<TagSelectorOption[]>(
    () =>
      normalizedTags.map((value) => ({
        value,
        label: t(`component:metadata.tag_values.${value}`),
      })),
    [normalizedTags, t],
  );
  const previewImage = getHomeGeneratorImageFromTag(visualTag);
  const previewTitle = trimmedName || t("screen:generator_form.name_placeholder");

  const resolveSelectedCategories = async () => {
    const fetchedCategories = await fetchCategories({
      orderBy: "name",
      ascending: true,
    });
    const categoryLookup = new Map<string, Category>();

    [...existingCategories, ...(fetchedCategories ?? [])].forEach(
      (category) => {
        const key = normalizeCategoryName(category.name);
        if (!categoryLookup.has(key)) {
          categoryLookup.set(key, category);
        }
      },
    );

    const categoriesToInsert: {
      name: string;
      description: string;
      options: Option[];
      language: GeneratorLanguage;
      tags: GeneratorTag[];
      is_public: boolean;
      favorited_counter: number;
    }[] = [];
    const pendingCategoryNames = new Set<string>();

    selectedCategories.forEach((category) => {
      if (!isImportedDraftCategory(category)) {
        return;
      }

      const originalNameKey = normalizeCategoryName(category.name);
      const importedNameKey = normalizeCategoryName(category.name);

      if (
        categoryLookup.has(originalNameKey) ||
        categoryLookup.has(importedNameKey) ||
        pendingCategoryNames.has(importedNameKey)
      ) {
        return;
      }

      pendingCategoryNames.add(importedNameKey);
      categoriesToInsert.push({
        name: category.name,
        description: category.description,
        options: category.options,
        language,
        // Imported categories inherit the project's metadata while
        // keeping the tighter category tag limit.
        tags: getCategoryTagsFromGenerator(tags),
        is_public: false,
        favorited_counter: 0,
      });
    });

    if (categoriesToInsert.length > 0) {
      const insertedCategories = await addCategories(categoriesToInsert);

      if (insertedCategories.length !== categoriesToInsert.length) {
        throw new Error("Failed to insert imported categories");
      }

      insertedCategories.forEach((category) => {
        const key = normalizeCategoryName(category.name);
        if (!categoryLookup.has(key)) {
          categoryLookup.set(key, category);
        }
      });
    }

    const resolvedCategories: Category[] = [];
    const resolvedCategoryIds = new Set<string>();

    selectedCategories.forEach((category) => {
      const resolvedCategory = isImportedDraftCategory(category)
        ? (categoryLookup.get(normalizeCategoryName(category.name)) ??
          categoryLookup.get(normalizeCategoryName(category.name)))
        : category;

      if (!resolvedCategory) {
        throw new Error(`Missing category ${category.name}`);
      }

      if (resolvedCategoryIds.has(resolvedCategory.id)) {
        return;
      }

      resolvedCategoryIds.add(resolvedCategory.id);
      resolvedCategories.push(resolvedCategory);
    });

    return resolvedCategories;
  };

  const syncGeneratorCategories = async (
    projectId: string,
    categoryIds: string[],
  ) => {
    const existingRelations = await fetchGeneratorCategoryRelations({
      filterColumn: "project_id",
      filterValue: projectId,
    });

    const existingCategoryIds = new Set(
      (existingRelations ?? []).map((relation) => relation.category_id),
    );
    const nextCategoryIds = new Set(categoryIds);

    const relationIdsToDelete = (existingRelations ?? [])
      .filter((relation) => !nextCategoryIds.has(relation.category_id))
      .map((relation) => relation.id);

    if (relationIdsToDelete.length > 0) {
      const didDelete =
        await deleteGeneratorCategoryRelations(relationIdsToDelete);
      if (!didDelete) throw new Error("Failed to delete project relations");
    }

    const relationsToInsert = categoryIds
      .filter((categoryId) => !existingCategoryIds.has(categoryId))
      .map((categoryId) => ({
        project_id: projectId,
        category_id: categoryId,
      }));

    if (relationsToInsert.length > 0) {
      console.log(relationsToInsert);

      const insertedRelations =
        await addGeneratorCategoryRelations(relationsToInsert);
      if (insertedRelations.length !== relationsToInsert.length) {
        throw new Error("Failed to insert project relations");
      }
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid || isSavingGenerator || isImporting) return;

    const projectDraft = {
      name: trimmedName,
      description,
      language,
      supported_files: supportedFileType,
      tags: normalizedTags,
      is_public: false, // Defaulting to private for now
      color: generatorColor,
    };

    const result =
      id === ""
        ? await addRecord(projectDraft)
        : await updateRecord(id, projectDraft);

    if (result) {
      try {
        const resolvedCategories = await resolveSelectedCategories();
        await syncGeneratorCategories(
          result.id,
          resolvedCategories.map((category) => category.id),
        );
      } catch (error) {
        console.error("Failed to sync project categories", error);
        return;
      }

      resetGeneratorDraft();
      router.push({
        pathname: "/generator-browse",
        params: { id: 1 },
      });
    } else {
      // You might want to show an Alert here if result is null
      console.error("Failed to save project");
    }
  };

  const isFormValid =
    trimmedName.length >= GeneratorFormRequirements.NAME_LENGTH_MIN &&
    normalizedTags.length >= GeneratorFormRequirements.GENERATOR_TAGS_MIN &&
    selectedSupportedFileTypes.length >=
      GeneratorFormRequirements.PROJECT_FILE_MIN &&
    selectedCategories.length >= GeneratorFormRequirements.MIN_CATEGORIES &&
    !isBusy;

  return (
    <>
      <Header
        title={t("screen:generator_form.title", { type: projectLabel })}
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
            <View
              style={{
                marginBottom: 20,
              }}
            >
              <Text style={globalStyles.label}>
                {t("screen:generator_form.name_label") + " *"}
              </Text>
              <TextInput
                style={[
                  globalStyles.input,
                  { borderColor: generatorColorSoft },
                ]}
                placeholder={t("screen:generator_form.name_placeholder")}
                placeholderTextColor={colors.placeholder}
                value={name}
                onChangeText={setName}
                editable={!isBusy}
              />
            </View>

            <View>
              <Text style={globalStyles.label}>
                {t("screen:generator_form.description_label")}
              </Text>
              <Description
                description={description}
                setDescription={setDescription}
                placeholder={t("screen:generator_form.description_placeholder")}
                generatorColor={generatorColor}
                isLoading={isBusy}
              />
            </View>

            <Spacer height={16} />

            <LanguageSelector
              label={t("component:metadata.language_label")}
              selectedLanguage={language}
              onChange={setLanguage}
              color={generatorColor}
            />

            <TagSelector
              label={t("component:metadata.supported_files_label")}
              options={supportedFileTypeOptions}
              selectedValues={selectedSupportedFileTypes}
              onChange={(values) =>
                setSupportedFileType(
                  getDefaultGeneratorSupportedFileType(values[0]),
                )
              }
              helperText={t("component:metadata.selection_min", {
                count: selectedSupportedFileTypes.length,
                min: GeneratorFormRequirements.PROJECT_FILE_MIN,
              })}
              color={generatorColor}
              singleSelect={true}
              maxVisibleRows={2}
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
                    PROJECT_TAG_LIMIT,
                  ),
                );
              }}
              helperText={t("component:metadata.tags_range", {
                count: normalizedTags.length,
                min: GeneratorFormRequirements.GENERATOR_TAGS_MIN,
                max: PROJECT_TAG_LIMIT,
              })}
              color={generatorColor}
              maxSelections={PROJECT_TAG_LIMIT}
              alwaysEnabledValues={["all"]}
            />

            <TagSelector
              label={t("component:metadata.visual_tag_label")}
              options={visualTagOptions}
              selectedValues={[visualTag]}
              onChange={(values) => {
                const nextVisualTag = values[0];

                if (!nextVisualTag) {
                  return;
                }

                setTags(
                  prioritizeGeneratorTag(
                    normalizedTags,
                    nextVisualTag as GeneratorTag,
                  ),
                );
              }}
              helperText={t("component:metadata.visual_tag_helper")}
              color={generatorColor}
              singleSelect={true}
              maxVisibleRows={2}
            />

            <View style={{ marginBottom: 20 }}>
              <Text style={globalStyles.label}>
                {t("screen:generator_form.preview_label")}
              </Text>
              <MainButton
                title={previewTitle}
                subtitle={t(`component:metadata.tag_values.${visualTag}`)}
                description={description || undefined}
                tags={normalizedTags}
                color={generatorColor}
                image={previewImage}
                onPress={() => {}}
              />
            </View>

            <Text style={globalStyles.label}>
              {t("screen:generator_form.category_list_label", {
                min: GeneratorFormRequirements.MIN_CATEGORIES,
              })}
            </Text>
            <Text style={[globalStyles.discreetText, { marginBottom: 8 }]}>
              {t("component:metadata.selection_min", {
                count: selectedCategories.length,
                min: GeneratorFormRequirements.MIN_CATEGORIES,
              })}
            </Text>
            <AddButton
              generatorColor={generatorColor}
              label={t("screen:generators.add-button.label-category")}
              onClick={() =>
                router.push({
                  pathname: "/category-browse",
                  params: {
                    mode: "creation",
                    type: projectLabel,
                  },
                })
              }
            />
            <View style={{ marginTop: 12 }}>
              {sortedCategories.map((category: Category) => {
                return (
                  <View key={category.id}>
                    <ExpandableHeader
                      title={category.name}
                      description={category.description}
                      tags={category.tags}
                      isExpanded={false}
                      color={generatorColor}
                      isEnabled={true}
                      subtitle={
                        category.options
                          ? t("component:category_item.possibilities", {
                              count: category.options.length,
                            })
                          : undefined
                      }
                    />
                    {category.id !==
                      sortedCategories[sortedCategories.length - 1].id && (
                      <>
                        <Spacer divider={true} color={generatorColorSoft} />
                        <Spacer height={8} />
                      </>
                    )}
                  </View>
                );
              })}
            </View>

            <Spacer height={16} />

            <GeneratorJsonImporter
              generatorColor={generatorColor}
              fallbackProjectName={name}
              onImportingChange={setIsImporting}
              onImported={(draft) => {
                if (draft.name) {
                  setName(draft.name);
                }
                setDescription(draft.description);
                setLanguage(draft.language);
                setSupportedFileType(draft.supportedFileType);
                setTags(getDefaultGeneratorTags(draft.tags));
                setSelectedCategories(draft.categories);
              }}
            />
          </ScrollView>
        </KeyboardAvoidingView>

        <ConfirmCancelButton
          color={generatorColor}
          labelConfirm={t("screen:generator_form.submit_button")}
          isActive={isFormValid}
          isLoading={
            isBusy || isSavingGenerator || isSavingRelation || isSavingCategories
          }
          onClickConfirm={handleSubmit}
          onClickCancel={() =>
            router.navigate({
              pathname: "/generator-browse",
              params: { type: projectLabel },
            })
          }
        />
      </View>
    </>
  );
}
