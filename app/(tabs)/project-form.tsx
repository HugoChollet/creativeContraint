import { AddButton } from "@/components/generic/add-button";
import ColorPicker from "@/components/generic/color-picker";
import Description from "@/components/generic/description";
import { Header } from "@/components/generic/header";
import { Spacer } from "@/components/generic/spacer";
import CategoryHeader from "@/components/specific/category/category-header";
import { getProjectColor } from "@/constants/theme";
import { useProjectDraft } from "@/contexts/project-draft-context";
import { useCollection } from "@/hooks/use-collection";
import { useStyles } from "@/hooks/use-styles";
import { Category } from "@/types/category";
import { Project, ProjectCategoryRelation } from "@/types/projects";
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
  const {
    addRecord,
    updateRecord,
    loading: isSaving,
  } = useCollection<Project>("projects");
  const {
    fetchCollection: fetchProjectCategoryRelations,
    addRecords: addProjectCategoryRelations,
    deleteRecords: deleteProjectCategoryRelations,
  } = useCollection<ProjectCategoryRelation>("project_category_relations");

  const router = useRouter();
  const {
    id,
    name,
    setName,
    description,
    setDescription,
    projectColor,
    setProjectColor,
    selectedCategories,
    resetProjectDraft,
  } = useProjectDraft();

  const [isLoading] = useState(false);
  const projectColorSoft = getProjectColor({
    color: projectColor,
    opacity: 0.2,
    theme,
  });
  const sortedCategories = [...selectedCategories].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

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
    if (!isFormValid || isSaving) return;

    const projectDraft = {
      name,
      description,
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
        await syncProjectCategories(
          result.id,
          selectedCategories.map((category) => category.id),
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
    !isLoading;

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
                  editable={!isLoading}
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
                isLoading={isLoading}
              />
            </View>

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
                    type: "new",
                    selectionMode: "project-form",
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
                {t("screen:project_form.submit_button")}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
