import { AddButton } from "@/components/generic/add-button";
import { ConfirmCancelButton } from "@/components/generic/confirm-cancel-buttons";
import { Header } from "@/components/generic/header";
import MetadataBadges from "@/components/generic/metadata-badges";
import CategorySection from "@/components/specific/category/category-section";
import {
  isProjectLanguage,
  matchesProjectLanguage,
  matchesProjectTags,
  normalizeProjectTags,
} from "@/constants/project-metadata";
import { getProjectColor } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useHomeProjects } from "@/contexts/home-projects-context";
import { useProjectDraft } from "@/contexts/project-draft-context";
import { useCollection } from "@/hooks/use-collection";
import { useStyles } from "@/hooks/use-styles";
import { getProjectTitle } from "@/lib/project-data";
import { Category, CategorySectionData } from "@/types/category";
import {
  Project,
  ProjectCategoryRelation,
  UserProjectSelection,
} from "@/types/projects";
import { useHeaderHeight } from "@react-navigation/elements";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

export default function CategoryBrowseScreen() {
  const { mode, selectionMode, type } = useLocalSearchParams<{
    mode?: string;
    selectionMode?: string;
    type?: string;
  }>();
  const { globalStyles, theme, colors } = useStyles();
  const { session } = useAuth();
  const {
    activeProject,
    loading: loadingHomeProjects,
    refreshProjects,
    setActiveProjectId,
  } = useHomeProjects();
  const { t } = useTranslation();
  const headerHeight = useHeaderHeight();

  const userId = session?.user?.id;
  const browseMode = mode ?? selectionMode;
  const isCreation = browseMode === "creation";
  const {
    name,
    selectedCategories,
    toggleSelectedCategory,
    projectColor: draftProjectColor,
    language,
    tags,
  } = useProjectDraft();
  // Edition mode batches checkbox changes locally until the user confirms.
  const [editionSelectedCategoryIds, setEditionSelectedCategoryIds] = useState<
    string[]
  >([]);
  const activeProjectTitle = activeProject
    ? getProjectTitle(activeProject.dataSource)
    : undefined;
  const activeProjectColor = activeProject?.color
    ? getProjectColor({
        color: activeProject.color,
        theme,
      })
    : getProjectColor({
        label: activeProject?.routeType,
        theme,
      });
  const screenProjectTitle =
    (isCreation ? name : activeProjectTitle) ?? activeProjectTitle ?? "Project";
  const screenProjectColor = isCreation
    ? draftProjectColor
    : activeProjectColor;
  // Creation mode reads from the draft project, edition mode reads from the active home project.
  const currentProjectLanguage = isCreation
    ? language
    : activeProject?.language;
  const currentProjectTags = useMemo(
    () =>
      normalizeProjectTags(
        isCreation ? tags : (activeProject?.tags ?? undefined),
      ),
    [activeProject?.tags, isCreation, tags],
  );
  const [browseLanguageFilter, setBrowseLanguageFilter] = useState<
    string | null
  >(isProjectLanguage(currentProjectLanguage) ? currentProjectLanguage : null);
  const [browseTagFilters, setBrowseTagFilters] =
    useState<string[]>(currentProjectTags);

  const hasActiveFilters =
    isProjectLanguage(browseLanguageFilter) || browseTagFilters.length > 0;

  useEffect(() => {
    setBrowseLanguageFilter(
      isProjectLanguage(currentProjectLanguage) ? currentProjectLanguage : null,
    );
  }, [currentProjectLanguage]);

  useEffect(() => {
    setBrowseTagFilters(currentProjectTags);
  }, [currentProjectTags]);

  useEffect(() => {
    // Reset the local edition selection whenever we switch to another active project.
    if (!isCreation) {
      setEditionSelectedCategoryIds(activeProject?.selected_category_ids ?? []);
    }
  }, [activeProject?.id, activeProject?.selected_category_ids, isCreation]);

  // Creation mode reads from the draft, edition mode reads from the local checkbox buffer.
  const selectedCategoryIds = useMemo(
    () =>
      isCreation
        ? selectedCategories.map((category) => category.id)
        : editionSelectedCategoryIds,
    [editionSelectedCategoryIds, isCreation, selectedCategories],
  );
  const { data, updateRecord, refresh, loading } =
    useCollection<Category>("categories");
  const {
    data: userProjectSelections,
    updateRecord: updateProjectSelection,
    refresh: refreshProjectSelections,
    loading: loadingProjectSelections,
  } = useCollection<UserProjectSelection>("user_project_selections", {
    filterColumn: "owner_id",
    filterValue: userId ?? "__guest__",
  });
  const {
    fetchCollection: fetchProjectCategoryRelations,
    addRecords: addProjectCategoryRelations,
    loading: loadingProjectCategoryRelations,
  } = useCollection<ProjectCategoryRelation>("project_category_relations");
  const {
    addRecord: addProjectRecord,
    deleteRecord: deleteProjectRecord,
    loading: loadingProjectFork,
  } = useCollection<Project>("projects");

  useFocusEffect(
    useCallback(() => {
      // Category browse keeps its own collection state, so refetch after coming back from the form.
      refresh();
      refreshProjectSelections();
    }, [refresh, refreshProjectSelections]),
  );

  // This row represents "which project this user is currently using" plus its selected categories.
  const activeProjectSelection = useMemo(
    () =>
      userProjectSelections.find(
        (selection) => selection.project_id === activeProject?.id,
      ) ?? null,
    [activeProject?.id, userProjectSelections],
  );

  const filteredCategories = useMemo(
    () =>
      // Keep the tag/language rule in one place so the same OR logic applies everywhere.
      data.filter((item) => {
        return (
          matchesProjectLanguage(item.language, browseLanguageFilter) &&
          matchesProjectTags(item.tags, browseTagFilters)
        );
      }),
    [browseLanguageFilter, browseTagFilters, data],
  );

  const personalCategories = useMemo(
    () => filteredCategories.filter((item) => item.owner_id === userId),
    [filteredCategories, userId],
  );

  const officialCategories = useMemo(
    () => filteredCategories.filter((item) => item.source === "official"),
    [filteredCategories],
  );

  const communityCategories = useMemo(
    () =>
      filteredCategories.filter(
        (item) => item.source === "community" && item.owner_id !== userId,
      ),
    [filteredCategories, userId],
  );

  const sections: CategorySectionData[] = [
    {
      title: t("screen:category_browse.personal_section"),
      data: personalCategories,
      selected: selectedCategoryIds,
    },
    {
      title: t("screen:category_browse.official_section"),
      data: officialCategories,
      selected: selectedCategoryIds,
    },
    {
      title: t("screen:category_browse.community_section"),
      data: communityCategories,
      selected: selectedCategoryIds,
    },
  ];

  const toggleEditionSelectedCategory = useCallback((category: Category) => {
    setEditionSelectedCategoryIds((prev) =>
      prev.includes(category.id)
        ? prev.filter((id) => id !== category.id)
        : [...prev, category.id],
    );
  }, []);

  const persistProjectSelection = useCallback(
    async ({
      projectId,
      selectionId,
      selectedCategoryIds,
      nextProjectId,
    }: {
      projectId: string;
      selectionId: string;
      selectedCategoryIds: string[];
      nextProjectId?: string;
    }) => {
      // The selection row can only point at categories that are actually linked to the project.
      const uniqueSelectedCategoryIds = Array.from(new Set(selectedCategoryIds));
      const existingRelations = await fetchProjectCategoryRelations({
        filterColumn: "project_id",
        filterValue: projectId,
      });
      const existingCategoryIds = new Set(
        (existingRelations ?? []).map((relation) => relation.category_id),
      );
      const relationsToInsert = uniqueSelectedCategoryIds
        .filter((categoryId) => !existingCategoryIds.has(categoryId))
        .map((categoryId) => ({
          project_id: projectId,
          category_id: categoryId,
        }));

      if (relationsToInsert.length > 0) {
        const insertedRelations =
          await addProjectCategoryRelations(relationsToInsert);

        if (insertedRelations.length !== relationsToInsert.length) {
          console.error("Failed to insert project category relations");
          return false;
        }
      }

      const updatedSelection = await updateProjectSelection(selectionId, {
        ...(nextProjectId ? { project_id: nextProjectId } : {}),
        selected_category_ids: uniqueSelectedCategoryIds,
      });

      if (!updatedSelection) {
        console.error("Failed to update project category selection");
        return false;
      }

      return true;
    },
    [addProjectCategoryRelations, fetchProjectCategoryRelations, updateProjectSelection],
  );

  const persistEditionSelection = useCallback(async () => {
    if (!activeProject || !activeProjectSelection) {
      console.error("Missing active project selection");
      return false;
    }

    // Private projects can be updated in place for the current user selection.
    if (!activeProject.is_public) {
      const didPersist = await persistProjectSelection({
        projectId: activeProject.id,
        selectionId: activeProjectSelection.id,
        selectedCategoryIds: editionSelectedCategoryIds,
      });

      if (!didPersist) {
        return false;
      }

      await refreshProjects();
      return activeProject.id;
    }

    // Public projects stay immutable here: fork first, then move the user's selection to the fork.
    const forkedProject = await addProjectRecord({
      name: activeProject.name,
      description: activeProject.description,
      language: activeProject.language ?? undefined,
      tags: normalizeProjectTags(activeProject.tags),
      is_public: false,
      favorited_counter: 0,
      color: activeProject.color,
    });

    if (!forkedProject) {
      console.error("Failed to fork public project");
      return false;
    }

    const didPersistFork = await persistProjectSelection({
      projectId: forkedProject.id,
      selectionId: activeProjectSelection.id,
      selectedCategoryIds: editionSelectedCategoryIds,
      nextProjectId: forkedProject.id,
    });

    if (!didPersistFork) {
      await deleteProjectRecord(forkedProject.id);
      return false;
    }

    setActiveProjectId(forkedProject.id);
    await refreshProjects();
    return forkedProject.id;
  }, [
    activeProject,
    activeProjectSelection,
    addProjectRecord,
    deleteProjectRecord,
    editionSelectedCategoryIds,
    persistProjectSelection,
    refreshProjects,
    setActiveProjectId,
  ]);

  if (!isCreation && loadingHomeProjects && !activeProject) {
    return (
      <View
        style={[globalStyles.screenContainer, { justifyContent: "center" }]}
      >
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  return (
    <View style={globalStyles.screenContainer}>
      <Header
        title={t("screen:category_browse.title", { type: screenProjectTitle })}
      />
      {hasActiveFilters && (
        <View style={{ marginTop: 16, marginBottom: 8 }}>
          <Text style={globalStyles.label}>
            {t("screen:category_browse.filters_label")}
          </Text>
          <MetadataBadges
            language={browseLanguageFilter}
            tags={browseTagFilters}
            color={screenProjectColor}
            onRemoveBadge={(badge) => {
              if (badge.type === "language") {
                setBrowseLanguageFilter(null);
                return;
              }

              if (badge.type === "tag") {
                setBrowseTagFilters((prev) =>
                  prev.filter((tag) => tag !== badge.value),
                );
              }
            }}
          />
        </View>
      )}
      {loading ? (
        <View
          style={[globalStyles.screenContainer, { justifyContent: "center" }]}
        >
          <ActivityIndicator size="large" color={screenProjectColor} />
        </View>
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(item) => item.title}
          renderItem={({ item: section }) => (
            <CategorySection
              key={section.title}
              section={section}
              projectColor={screenProjectColor}
              onDelete={() => {}}
              onEdit={() => {}}
              onFork={() => {}}
              onToggleCategory={
                isCreation ? toggleSelectedCategory : toggleEditionSelectedCategory
              }
              onPublish={(cat) => {
                console.log("publish ", cat);
                updateRecord(cat.id, { is_public: cat.is_public });
              }}
            />
          )}
          contentContainerStyle={{
            paddingBottom: headerHeight + 20,
          }}
        />
      )}
      {!isCreation && activeProject && (
        <AddButton
          projectColor={screenProjectColor}
          label={t("screen:category_browse.add_button")}
          onClick={() =>
            router.push({
              pathname: "/category-form",
              params: {
                id: 1,
              },
            })
          }
        />
      )}

      <ConfirmCancelButton
        color={screenProjectColor}
        labelConfirm={t("screen:category_browse.confirm_button")}
        isLoading={
          loadingProjectSelections ||
          loadingProjectCategoryRelations ||
          loadingProjectFork
        }
        onClickConfirm={async () => {
          if (isCreation) {
            router.navigate({
              pathname: "/project-form",
              params: {
                type, // TODO refacto to prevent to have send param back to the original screen
              },
            });
            return;
          }

          if (activeProject) {
            const nextProjectId = await persistEditionSelection();

            if (!nextProjectId) {
              return;
            }

            router.navigate({
              pathname: "/lab",
              params: {
                id: nextProjectId,
                type: screenProjectTitle,
              },
            });
            return;
          }

          router.back();
        }}
        onClickCancel={() =>
          isCreation
            ? router.navigate({
                pathname: "/project-form",
                params: {
                  type,
                },
              })
            : activeProject
              ? (() => {
                  setEditionSelectedCategoryIds(
                    activeProject.selected_category_ids ?? [],
                  );

                  router.navigate({
                    pathname: "/lab",
                    params: {
                      id: activeProject.id,
                      type: screenProjectTitle,
                    },
                  });
                })()
              : router.back()
        }
      />
    </View>
  );
}
