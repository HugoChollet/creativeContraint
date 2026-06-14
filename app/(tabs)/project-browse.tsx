import { AddButton } from "@/components/generic/add-button";
import { ConfirmCancelButton } from "@/components/generic/confirm-cancel-buttons";
import { Header } from "@/components/generic/header";
import { ModalGeneric } from "@/components/generic/modal-generic";
import ProjectLanguageFilter from "@/components/generic/project-language-filter";
import Auth from "@/components/specific/auth";
import ProjectSection from "@/components/specific/project/project-section";
import {
  getDefaultProjectLanguage,
  getDefaultProjectSupportedFileType,
  getDefaultProjectTags,
  matchesProjectLanguage,
  ProjectLanguage,
} from "@/constants/project-metadata";
import { useAuth } from "@/contexts/auth-context";
import { useProjectDraft } from "@/contexts/project-draft-context";
import { useCollection } from "@/hooks/use-collection";
import { useStyles } from "@/hooks/use-styles";
import { Category } from "@/types/category";
import {
  Project,
  ProjectRelation,
  ProjectSectionData,
  UserProjectSelection,
} from "@/types/projects";
import { useHeaderHeight } from "@react-navigation/elements";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, View } from "react-native";

export default function ProjectBrowseScreen() {
  const { type: projectLabel } = useLocalSearchParams<{
    type: string;
  }>();
  const { globalStyles, colors } = useStyles();
  const { session } = useAuth();
  const { t, i18n } = useTranslation();
  const headerHeight = useHeaderHeight();
  const [languageFilter, setLanguageFilter] = useState<ProjectLanguage | null>(
    () => getDefaultProjectLanguage(i18n.language),
  );

  const userId = session?.user?.id;

  const {
    data,
    updateRecord,
    refresh,
    loading,
    deleteRecord: deleteProject,
  } = useCollection<ProjectRelation>("projects", {
    select: `
    *,
    project_category_relations (
      categories (
        id,
        name,
        description,
        options,
        language,
        tags,
        is_public,
        owner_id,
        source
      )
    )
  `,
  });
  const {
    data: selected,
    addRecord: addProjectSelection,
    deleteRecords: deleteProjectSelections,
    refresh: refreshSelectedProjects,
  } = useCollection<UserProjectSelection>("user_project_selections", {
    filterColumn: "owner_id",
    filterValue: userId,
  });
  const { updateRecord: updateCategoryRecord } =
    useCollection<Category>("categories");

  const parsedProjects = useMemo<Project[]>(
    () =>
      data.map(({ project_category_relations, ...project }) => ({
        ...project,
        categories: project_category_relations.flatMap((relation) =>
          relation.categories ? [relation.categories] : [],
        ),
      })),
    [data],
  );

  useFocusEffect(
    useCallback(() => {
      refresh();
      refreshSelectedProjects();
    }, [refresh, refreshSelectedProjects]),
  );

  const filteredProjects = useMemo(
    () =>
      parsedProjects.filter((project) =>
        matchesProjectLanguage(project.language, languageFilter),
      ),
    [languageFilter, parsedProjects],
  );

  const personalProjects = useMemo(
    () =>
      filteredProjects.filter(
        (item) => item.owner_id === userId && item.is_public === false,
      ),
    [filteredProjects, userId],
  );

  const publishedProjects = useMemo(
    () =>
      filteredProjects.filter(
        (item) => item.owner_id === userId && item.is_public === true,
      ),
    [filteredProjects, userId],
  );

  const officialProjects = useMemo(
    () => filteredProjects.filter((item) => item.source === "official"),
    [filteredProjects],
  );

  const communityProjects = useMemo(
    () =>
      filteredProjects.filter(
        (item) => item.source === "community" && item.owner_id !== userId,
      ),
    [filteredProjects, userId],
  );

  const persistedSelectedIds = useMemo(() => {
    if (!selected.length) return [];

    return Array.from(
      new Set(selected.map((selection) => selection.project_id.toString())),
    );
  }, [selected]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [visibleLogin, setVisibleLogin] = useState(false);

  useEffect(() => {
    setSelectedProjectIds(persistedSelectedIds);
  }, [persistedSelectedIds]);

  useEffect(() => {
    setLanguageFilter(getDefaultProjectLanguage(i18n.language));
  }, [i18n.language]);

  const hasSelectionChanges = useMemo(() => {
    if (selectedProjectIds.length !== persistedSelectedIds.length) {
      return true;
    }

    const persistedSelectionSet = new Set(persistedSelectedIds);

    return selectedProjectIds.some(
      (projectId) => !persistedSelectionSet.has(projectId),
    );
  }, [persistedSelectedIds, selectedProjectIds]);

  const sections: ProjectSectionData[] = [
    {
      title: t("screen:project_browse.personal_section"),
      data: personalProjects,
      selected: selectedProjectIds,
    },
    {
      title: t("screen:project_browse.published_section"),
      data: publishedProjects,
      selected: selectedProjectIds,
    },
    {
      title: t("screen:project_browse.official_section"),
      data: officialProjects,
      selected: selectedProjectIds,
    },
    {
      title: t("screen:project_browse.community_section"),
      data: communityProjects,
      selected: selectedProjectIds,
    },
  ];

  const {
    setId,
    setName,
    setDescription,
    setLanguage,
    setSupportedFileType,
    setTags,
    setSelectedCategories,
    resetProjectDraft,
  } = useProjectDraft();

  const openProjectForm = useCallback(() => {
    resetProjectDraft();
    router.push({
      pathname: "/project-form",
      params: { id: 1, type: projectLabel },
    });
  }, [projectLabel, resetProjectDraft]);

  const setupDraft = ({
    draft,
    isForked,
  }: {
    draft: Project;
    isForked: boolean;
  }) => {
    setName(draft.name);
    setDescription(draft.description);
    setLanguage(getDefaultProjectLanguage(draft.language ?? i18n.language));
    setSupportedFileType(
      getDefaultProjectSupportedFileType(draft.supported_files),
    );
    setTags(getDefaultProjectTags(draft.tags));
    setSelectedCategories(draft.categories);
    setId(isForked ? "" : draft.id);
  };

  const syncProjectVisibility = async (project: Project) => {
    const nextIsPublic = !project.is_public;
    const ownedCategories = project.categories.filter(
      (category) => category.owner_id === userId,
    );

    const updatedProject = await updateRecord(project.id, {
      is_public: nextIsPublic,
    });

    if (!updatedProject) {
      console.error("Failed to update project visibility");
      return;
    }

    const previousCategoryVisibility = new Map(
      ownedCategories.map((category) => [category.id, category.is_public]),
    );
    const updatedCategoryIds: string[] = [];

    for (const category of ownedCategories) {
      if (category.is_public === nextIsPublic) {
        continue;
      }

      const updatedCategory = await updateCategoryRecord(category.id, {
        is_public: nextIsPublic,
      });

      if (!updatedCategory) {
        console.error("Failed to update category visibility", category.id);

        await updateRecord(project.id, {
          is_public: project.is_public,
        });

        for (const updatedCategoryId of updatedCategoryIds) {
          const previousIsPublic =
            previousCategoryVisibility.get(updatedCategoryId);

          if (previousIsPublic === undefined) {
            continue;
          }

          await updateCategoryRecord(updatedCategoryId, {
            is_public: previousIsPublic,
          });
        }

        return;
      }

      updatedCategoryIds.push(category.id);
    }

    refresh();
  };

  useEffect(() => {
    if (!session?.user || !visibleLogin) {
      return;
    }

    setVisibleLogin(false);
    openProjectForm();
  }, [openProjectForm, session?.user, visibleLogin]);

  const handleConfirmSelection = async () => {
    const selectionIdsToDelete = selected.map((selection) => selection.id);

    if (selectionIdsToDelete.length > 0) {
      const didDelete = await deleteProjectSelections(selectionIdsToDelete);

      if (!didDelete) {
        console.error("Failed to delete old project selections");
        return;
      }
    }

    const nextSelections = parsedProjects
      .filter((project) => selectedProjectIds.includes(project.id))
      .map((project) => ({
        project_id: project.id,
        selected_category_ids: project.categories.map(
          (category) => category.id,
        ),
      }));

    if (nextSelections.length > 0) {
      const insertedSelections = await Promise.all(
        nextSelections.map((selection) => addProjectSelection(selection)),
      );

      if (insertedSelections.some((selection) => !selection)) {
        console.error("Failed to save project selections");
        return;
      }
    }

    router.navigate({
      pathname: "/",
      params: { type: projectLabel },
    });
  };

  return (
    <View style={globalStyles.screenContainer}>
      <Header
        title={t("screen:project_browse.title", { type: projectLabel })}
      />
      <View style={{ marginTop: 16, marginBottom: 8 }}>
        <ProjectLanguageFilter
          label={t("component:metadata.language_label")}
          selectedLanguage={languageFilter}
          onChange={setLanguageFilter}
          color={colors.tint}
        />
      </View>
      {loading ? (
        <View
          style={[globalStyles.screenContainer, { justifyContent: "center" }]}
        >
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(item) => item.title}
          renderItem={({ item: section }) => (
            <ProjectSection
              key={section.title}
              section={section}
              onDelete={(id) => {
                deleteProject(id);
              }}
              onEdit={(project) => {
                setupDraft({ draft: project, isForked: false });
                router.push({
                  pathname: "/project-form",
                  params: {
                    id: 1,
                    type: projectLabel,
                  },
                });
              }}
              onFork={(project) => {
                setupDraft({ draft: project, isForked: true });
                router.push({
                  pathname: "/project-form",
                  params: {
                    id: 1,
                    type: projectLabel,
                  },
                });
              }}
              onPublish={(project) => {
                syncProjectVisibility(project);
              }}
              onToggleProject={(projectId) => {
                setSelectedProjectIds((prev) =>
                  prev.includes(projectId)
                    ? prev.filter((id) => id !== projectId)
                    : [...prev, projectId],
                );
              }}
            />
          )}
          contentContainerStyle={{
            paddingBottom: headerHeight + 20,
          }}
        />
      )}
      <AddButton
        projectColor={colors.tint}
        label={t("screen:project_browse.add_button")}
        onClick={() => {
          if (!session?.user) {
            setVisibleLogin(true);
            return;
          }

          openProjectForm();
        }}
      />
      <ConfirmCancelButton
        color={colors.tint}
        labelConfirm={t("screen:project_browse.confirm_button")}
        isActive={hasSelectionChanges}
        onClickConfirm={handleConfirmSelection}
        onClickCancel={() =>
          router.navigate({
            pathname: "/",
            params: { type: projectLabel },
          })
        }
      />
      <ModalGeneric visible={visibleLogin} setVisible={setVisibleLogin}>
        <Auth />
      </ModalGeneric>
    </View>
  );
}
