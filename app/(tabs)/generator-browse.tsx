import { AddButton } from "@/components/generic/add-button";
import { ConfirmCancelButton } from "@/components/generic/confirm-cancel-buttons";
import { Header } from "@/components/generic/header";
import { ModalGeneric } from "@/components/generic/modal-generic";
import GeneratorLanguageFilter from "@/components/generic/generator-language-filter";
import Auth from "@/components/specific/auth";
import GeneratorSection from "@/components/specific/generator/generator-section";
import {
  getDefaultGeneratorLanguage,
  getDefaultGeneratorSupportedFileType,
  getDefaultGeneratorTags,
  matchesGeneratorLanguage,
  GeneratorLanguage,
} from "@/constants/generator-metadata";
import { useAuth } from "@/contexts/auth-context";
import { useGeneratorDraft } from "@/contexts/generator-draft-context";
import { useCollection } from "@/hooks/use-collection";
import { useStyles } from "@/hooks/use-styles";
import { Category } from "@/types/category";
import {
  Generator,
  GeneratorRelation,
  GeneratorSectionData,
  UserGeneratorSelection,
} from "@/types/generators";
import { useHeaderHeight } from "@react-navigation/elements";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, View } from "react-native";

export default function GeneratorBrowseScreen() {
  const { type: projectLabel } = useLocalSearchParams<{
    type: string;
  }>();
  const { globalStyles, colors } = useStyles();
  const { session } = useAuth();
  const { t, i18n } = useTranslation();
  const headerHeight = useHeaderHeight();
  const [languageFilter, setLanguageFilter] = useState<GeneratorLanguage | null>(
    () => getDefaultGeneratorLanguage(i18n.language),
  );

  const userId = session?.user?.id;

  const {
    data,
    updateRecord,
    refresh,
    loading,
    deleteRecord: deleteGenerator,
  } = useCollection<GeneratorRelation>("projects", {
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
    addRecord: addGeneratorSelection,
    deleteRecords: deleteGeneratorSelections,
    refresh: refreshSelectedGenerators,
  } = useCollection<UserGeneratorSelection>("user_project_selections", {
    filterColumn: "owner_id",
    filterValue: userId,
  });
  const { updateRecord: updateCategoryRecord } =
    useCollection<Category>("categories");

  const parsedGenerators = useMemo<Generator[]>(
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
      refreshSelectedGenerators();
    }, [refresh, refreshSelectedGenerators]),
  );

  const filteredGenerators = useMemo(
    () =>
      parsedGenerators.filter((project) =>
        matchesGeneratorLanguage(project.language, languageFilter),
      ),
    [languageFilter, parsedGenerators],
  );

  const personalGenerators = useMemo(
    () =>
      filteredGenerators.filter(
        (item) => item.owner_id === userId && item.is_public === false,
      ),
    [filteredGenerators, userId],
  );

  const publishedGenerators = useMemo(
    () =>
      filteredGenerators.filter(
        (item) => item.owner_id === userId && item.is_public === true,
      ),
    [filteredGenerators, userId],
  );

  const officialGenerators = useMemo(
    () => filteredGenerators.filter((item) => item.source === "official"),
    [filteredGenerators],
  );

  const communityGenerators = useMemo(
    () =>
      filteredGenerators.filter(
        (item) => item.source === "community" && item.owner_id !== userId,
      ),
    [filteredGenerators, userId],
  );

  const persistedSelectedIds = useMemo(() => {
    if (!selected.length) return [];

    return Array.from(
      new Set(selected.map((selection) => selection.project_id.toString())),
    );
  }, [selected]);
  const [selectedGeneratorIds, setSelectedGeneratorIds] = useState<string[]>([]);
  const [visibleLogin, setVisibleLogin] = useState(false);

  useEffect(() => {
    setSelectedGeneratorIds(persistedSelectedIds);
  }, [persistedSelectedIds]);

  useEffect(() => {
    setLanguageFilter(getDefaultGeneratorLanguage(i18n.language));
  }, [i18n.language]);

  const hasSelectionChanges = useMemo(() => {
    if (selectedGeneratorIds.length !== persistedSelectedIds.length) {
      return true;
    }

    const persistedSelectionSet = new Set(persistedSelectedIds);

    return selectedGeneratorIds.some(
      (projectId) => !persistedSelectionSet.has(projectId),
    );
  }, [persistedSelectedIds, selectedGeneratorIds]);

  const sections: GeneratorSectionData[] = [
    {
      title: t("screen:generator_browse.personal_section"),
      data: personalGenerators,
      selected: selectedGeneratorIds,
    },
    {
      title: t("screen:generator_browse.published_section"),
      data: publishedGenerators,
      selected: selectedGeneratorIds,
    },
    {
      title: t("screen:generator_browse.official_section"),
      data: officialGenerators,
      selected: selectedGeneratorIds,
    },
    {
      title: t("screen:generator_browse.community_section"),
      data: communityGenerators,
      selected: selectedGeneratorIds,
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
    resetGeneratorDraft,
  } = useGeneratorDraft();

  const openGeneratorForm = useCallback(() => {
    resetGeneratorDraft();
    router.push({
      pathname: "/generator-form",
      params: { id: 1, type: projectLabel },
    });
  }, [projectLabel, resetGeneratorDraft]);

  const setupDraft = ({
    draft,
    isForked,
  }: {
    draft: Generator;
    isForked: boolean;
  }) => {
    setName(draft.name);
    setDescription(draft.description);
    setLanguage(getDefaultGeneratorLanguage(draft.language ?? i18n.language));
    setSupportedFileType(
      getDefaultGeneratorSupportedFileType(draft.supported_files),
    );
    setTags(getDefaultGeneratorTags(draft.tags));
    setSelectedCategories(draft.categories);
    setId(isForked ? "" : draft.id);
  };

  const syncGeneratorVisibility = async (project: Generator) => {
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
    openGeneratorForm();
  }, [openGeneratorForm, session?.user, visibleLogin]);

  const handleConfirmSelection = async () => {
    const selectionIdsToDelete = selected.map((selection) => selection.id);

    if (selectionIdsToDelete.length > 0) {
      const didDelete = await deleteGeneratorSelections(selectionIdsToDelete);

      if (!didDelete) {
        console.error("Failed to delete old project selections");
        return;
      }
    }

    const nextSelections = parsedGenerators
      .filter((project) => selectedGeneratorIds.includes(project.id))
      .map((project) => ({
        project_id: project.id,
        selected_category_ids: project.categories.map(
          (category) => category.id,
        ),
      }));

    if (nextSelections.length > 0) {
      const insertedSelections = await Promise.all(
        nextSelections.map((selection) => addGeneratorSelection(selection)),
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
        title={t("screen:generator_browse.title", { type: projectLabel })}
      />
      <View style={{ marginTop: 16, marginBottom: 8 }}>
        <GeneratorLanguageFilter
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
            <GeneratorSection
              key={section.title}
              section={section}
              onDelete={(id) => {
                deleteGenerator(id);
              }}
              onEdit={(project) => {
                setupDraft({ draft: project, isForked: false });
                router.push({
                  pathname: "/generator-form",
                  params: {
                    id: 1,
                    type: projectLabel,
                  },
                });
              }}
              onFork={(project) => {
                setupDraft({ draft: project, isForked: true });
                router.push({
                  pathname: "/generator-form",
                  params: {
                    id: 1,
                    type: projectLabel,
                  },
                });
              }}
              onPublish={(project) => {
                syncGeneratorVisibility(project);
              }}
              onToggleGenerator={(projectId) => {
                setSelectedGeneratorIds((prev) =>
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
        generatorColor={colors.tint}
        label={t("screen:generator_browse.add_button")}
        onClick={() => {
          if (!session?.user) {
            setVisibleLogin(true);
            return;
          }

          openGeneratorForm();
        }}
      />
      <ConfirmCancelButton
        color={colors.tint}
        labelConfirm={t("screen:generator_browse.confirm_button")}
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
