import { AddButton } from "@/components/generic/add-button";
import ColorPicker from "@/components/generic/color-picker";
import { ConfirmCancelButton } from "@/components/generic/confirm-cancel-buttons";
import Description from "@/components/generic/description";
import { Header } from "@/components/generic/header";
import LanguageSelector from "@/components/generic/language-selector";
import { Spacer } from "@/components/generic/spacer";
import TagSelector, {
  TagSelectorOption,
} from "@/components/generic/tag-selector";
import CategoryHeader from "@/components/specific/category/category-header";
import ProjectJsonImporter, {
  getImportedCategoryDbName,
  isImportedDraftCategory,
} from "@/components/specific/project/project-json-importer";
import {
  getCategoryTagsFromProject,
  normalizeProjectTags,
  PROJECT_TAGS,
  ProjectLanguage,
  ProjectTag,
  toggleProjectTag,
} from "@/constants/project-metadata";
import { getProjectColor } from "@/constants/theme";
import { useProjectDraft } from "@/contexts/project-draft-context";
import { useCollection } from "@/hooks/use-collection";
import { useStyles } from "@/hooks/use-styles";
import { Category } from "@/types/category";
import { Option } from "@/types/constraints";
import { Project, ProjectCategoryRelation } from "@/types/projects";
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

const CategoryRequire = { MIN_OPTIONS: 2, NAME_LENGTH_MIN: 2 };
const PROJECT_TAG_LIMIT = 4;

const normalizeCategoryName = (value: string) => value.trim().toLowerCase();

export default function ProjectFormScreen() {
  const { type: projectLabel } = useLocalSearchParams<{
    type: string;
  }>();

  const { globalStyles, colors, theme } = useStyles();
  const { t } = useTranslation();

  const headerHeight = useHeaderHeight();
  const {
    addRecord,
    updateRecord,
    loading: isSavingProject,
  } = useCollection<Project>("projects");
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
    fetchCollection: fetchProjectCategoryRelations,
    addRecords: addProjectCategoryRelations,
    deleteRecords: deleteProjectCategoryRelations,
    loading: isSavingRelation,
  } = useCollection<ProjectCategoryRelation>("project_category_relations");

  const router = useRouter();
  const {
    id,
    name,
    setName,
    description,
    setDescription,
    language,
    setLanguage,
    tags,
    setTags,
    projectColor,
    setProjectColor,
    selectedCategories,
    setSelectedCategories,
    resetProjectDraft,
  } = useProjectDraft();

  const [isLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const projectColorSoft = getProjectColor({
    color: projectColor,
    opacity: 0.2,
    theme,
  });
  const sortedCategories = [...selectedCategories].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const isBusy = isLoading || isImporting;
  const tagOptions = useMemo<TagSelectorOption[]>(
    () =>
      PROJECT_TAGS.map((value) => ({
        value,
        label: t(`component:metadata.tag_values.${value}`),
      })),
    [t],
  );

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
      language: ProjectLanguage;
      tags: ProjectTag[];
      is_public: boolean;
      favorited_counter: number;
    }[] = [];
    const pendingCategoryNames = new Set<string>();

    selectedCategories.forEach((category) => {
      if (!isImportedDraftCategory(category)) {
        return;
      }

      const importedCategoryDbName = getImportedCategoryDbName(
        name,
        category.name,
      );
      const originalNameKey = normalizeCategoryName(category.name);
      const importedNameKey = normalizeCategoryName(importedCategoryDbName);

      if (
        categoryLookup.has(originalNameKey) ||
        categoryLookup.has(importedNameKey) ||
        pendingCategoryNames.has(importedNameKey)
      ) {
        return;
      }

      pendingCategoryNames.add(importedNameKey);
      categoriesToInsert.push({
        name: importedCategoryDbName,
        description: category.description,
        options: category.options,
        language,
        // Imported categories inherit the project's metadata while
        // keeping the tighter category tag limit.
        tags: getCategoryTagsFromProject(tags),
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
          categoryLookup.get(
            normalizeCategoryName(
              getImportedCategoryDbName(name, category.name),
            ),
          ))
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

  const syncProjectCategories = async (
    projectId: string,
    categoryIds: string[],
  ) => {
    const existingRelations = await fetchProjectCategoryRelations({
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
        await deleteProjectCategoryRelations(relationIdsToDelete);
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
        await addProjectCategoryRelations(relationsToInsert);
      if (insertedRelations.length !== relationsToInsert.length) {
        throw new Error("Failed to insert project relations");
      }
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid || isSavingProject || isImporting) return;

    const normalizedTags = normalizeProjectTags(tags);
    const projectDraft = {
      name,
      description,
      language,
      tags: normalizedTags,
      is_public: false, // Defaulting to private for now
      favorited_counter: 0,
      color: projectColor,
    };

    console.log("submitting with id :", id);

    const result =
      id === ""
        ? await addRecord(projectDraft)
        : await updateRecord(id, projectDraft);

    if (result) {
      try {
        const resolvedCategories = await resolveSelectedCategories();
        await syncProjectCategories(
          result.id,
          resolvedCategories.map((category) => category.id),
        );
      } catch (error) {
        console.error("Failed to sync project categories", error);
        return;
      }

      resetProjectDraft();
      router.push({
        pathname: "/project-browse",
        params: { id: 1 },
      });
    } else {
      // You might want to show an Alert here if result is null
      console.error("Failed to save project");
    }
  };

  const isFormValid =
    name.length > CategoryRequire.NAME_LENGTH_MIN &&
    //categories.length >= CategoryRequire.MIN_OPTIONS &&
    !isBusy;

  return (
    <>
      <Header
        title={t("screen:project_form.title", { type: projectLabel })}
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
                  editable={!isBusy}
                />
              </View>

              <View style={{ marginTop: 24 }}>
                <ColorPicker
                  defaultValue={projectColor}
                  setColor={setProjectColor}
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
                projectColor={projectColor}
                isLoading={isBusy}
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
                    PROJECT_TAG_LIMIT,
                  ),
                );
              }}
              helperText={t("component:metadata.tags_limit", {
                count: tags.length,
                max: PROJECT_TAG_LIMIT,
              })}
              color={projectColor}
              maxSelections={PROJECT_TAG_LIMIT}
              alwaysEnabledValues={["all"]}
            />

            <ProjectJsonImporter
              projectColor={projectColor}
              fallbackProjectName={name}
              onImportingChange={setIsImporting}
              onImported={(draft) => {
                if (draft.name) {
                  setName(draft.name);
                }
                setDescription(draft.description);
                setLanguage(draft.language);
                setTags(draft.tags);
                setSelectedCategories(draft.categories);
              }}
            />

            <Text style={globalStyles.label}>
              {t("screen:project_form.category_list_label", {
                min: CategoryRequire.MIN_OPTIONS,
              })}
            </Text>
            <AddButton
              projectColor={projectColor}
              label={t("screen:lab.add-button.label-category")}
              onClick={() =>
                router.push({
                  pathname: "/category-browse",
                  params: {
                    selectionMode: "creation",
                  },
                })
              }
            />
            <View>
              {sortedCategories.map((category: Category) => {
                return (
                  <View key={category.id}>
                    <CategoryHeader
                      category={category}
                      isExpanded={false}
                      onExpand={() => () => {}}
                      color={projectColor}
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
          labelConfirm={t("screen:project_form.submit_button")}
          isActive={isFormValid}
          isLoading={
            isBusy || isSavingProject || isSavingRelation || isSavingCategories
          }
          onClickConfirm={handleSubmit}
          onClickCancel={() =>
            router.navigate({
              pathname: "/project-browse",
              params: { type: projectLabel },
            })
          }
        />
      </View>
    </>
  );
}
