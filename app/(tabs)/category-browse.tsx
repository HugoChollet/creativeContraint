import { AddButton } from "@/components/generic/add-button";
import { ConfirmButton } from "@/components/generic/confirm-button";
import { ConfirmCancelButton } from "@/components/generic/confirm-cancel-buttons";
import { Header } from "@/components/generic/header";
import LanguageSelector from "@/components/generic/language-selector";
import MetadataBadges from "@/components/generic/metadata-badges";
import { ModalGeneric } from "@/components/generic/modal-generic";
import Auth from "@/components/specific/auth";
import TagSelector, {
  TagSelectorOption,
} from "@/components/generic/tag-selector";
import CategorySection from "@/components/specific/category/category-section";
import {
  isGeneratorLanguage,
  matchesGeneratorLanguage,
  matchesGeneratorTags,
  normalizeGeneratorTags,
  GENERATOR_TAGS,
  GeneratorLanguage,
  GeneratorTag,
} from "@/constants/generator-metadata";
import { getGeneratorColor } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useHomeGenerators } from "@/contexts/home-generators-context";
import { useGeneratorDraft } from "@/contexts/generator-draft-context";
import { useCollection } from "@/hooks/use-collection";
import { useStyles } from "@/hooks/use-styles";
import { getGeneratorTitle } from "@/lib/generator-data";
import { Category, CategorySectionData } from "@/types/category";
import {
  Generator,
  GeneratorCategoryRelation,
  UserGeneratorSelection,
} from "@/types/generators";
import { Ionicons } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function CategoryBrowseScreen() {
  const { mode, selectionMode, type } = useLocalSearchParams<{
    mode?: string;
    selectionMode?: string;
    type?: string;
  }>();
  const { globalStyles, theme, colors } = useStyles();
  const { session } = useAuth();
  const {
    activeGenerator,
    loading: loadingHomeGenerators,
    refreshGenerators,
    setActiveGeneratorId,
  } = useHomeGenerators();
  const { t } = useTranslation();
  const headerHeight = useHeaderHeight();

  const userId = session?.user?.id;
  const scopedUserId = userId ?? "__anonymous__";
  const browseMode = mode ?? selectionMode;
  const isCreation = browseMode === "creation";
  const {
    name,
    selectedCategories,
    setSelectedCategories,
    toggleSelectedCategory,
    generatorColor: draftProjectColor,
    language,
    tags,
  } = useGeneratorDraft();
  // Edition mode batches checkbox changes locally until the user confirms.
  const [editionSelectedCategoryIds, setEditionSelectedCategoryIds] = useState<
    string[]
  >([]);
  const activeGeneratorTitle = activeGenerator
    ? getGeneratorTitle(activeGenerator.dataSource)
    : undefined;
  const activeGeneratorColor = activeGenerator?.color
    ? getGeneratorColor({
        color: activeGenerator.color,
        theme,
      })
    : getGeneratorColor({
        label: activeGenerator?.routeType,
        theme,
      });
  const screenGeneratorTitle =
    (isCreation ? name : activeGeneratorTitle) ?? activeGeneratorTitle ?? "Generator";
  const screenGeneratorColor = isCreation
    ? draftProjectColor
    : activeGeneratorColor;
  // Creation mode reads from the draft project, edition mode reads from the active home project.
  const currentGeneratorLanguage = isCreation
    ? language
    : activeGenerator?.language;
  const currentGeneratorTags = useMemo(
    () =>
      normalizeGeneratorTags(
        isCreation ? tags : (activeGenerator?.tags ?? undefined),
      ),
    [activeGenerator?.tags, isCreation, tags],
  );
  const browseFilterSeed = useMemo(
    () =>
      isCreation
        ? `creation:${currentGeneratorLanguage ?? ""}:${currentGeneratorTags.join("|")}`
        : `edition:${activeGenerator?.id ?? ""}:${currentGeneratorLanguage ?? ""}:${currentGeneratorTags.join("|")}`,
    [activeGenerator?.id, currentGeneratorLanguage, currentGeneratorTags, isCreation],
  );
  const [browseLanguageFilter, setBrowseLanguageFilter] = useState<
    string | null
  >(isGeneratorLanguage(currentGeneratorLanguage) ? currentGeneratorLanguage : null);
  const [browseTagFilters, setBrowseTagFilters] =
    useState<string[]>(currentGeneratorTags);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [visibleLogin, setVisibleLogin] = useState(false);
  const previousBrowseFilterSeedRef = useRef<string | null>(null);

  useEffect(() => {
    if (previousBrowseFilterSeedRef.current === browseFilterSeed) {
      return;
    }

    setBrowseLanguageFilter(
      isGeneratorLanguage(currentGeneratorLanguage) ? currentGeneratorLanguage : null,
    );
    setBrowseTagFilters(currentGeneratorTags);
    previousBrowseFilterSeedRef.current = browseFilterSeed;
  }, [browseFilterSeed, currentGeneratorLanguage, currentGeneratorTags]);

  useEffect(() => {
    // Reset the local edition selection whenever we switch to another active project.
    if (!isCreation) {
      setEditionSelectedCategoryIds(activeGenerator?.selected_category_ids ?? []);
    }
  }, [activeGenerator?.id, activeGenerator?.selected_category_ids, isCreation]);

  // Creation mode reads from the draft, edition mode reads from the local checkbox buffer.
  const selectedCategoryIds = useMemo(
    () =>
      isCreation
        ? selectedCategories.map((category) => category.id)
        : editionSelectedCategoryIds,
    [editionSelectedCategoryIds, isCreation, selectedCategories],
  );
  const {
    data,
    updateRecord: updateCategoryRecord,
    deleteRecord: deleteCategoryRecord,
    refresh,
    loading,
  } = useCollection<Category>("categories");
  const {
    data: userGeneratorSelections,
    updateRecord: updateGeneratorSelection,
    refresh: refreshGeneratorSelections,
    loading: loadingGeneratorSelections,
  } = useCollection<UserGeneratorSelection>("user_project_selections", {
    filterColumn: "owner_id",
    filterValue: scopedUserId,
  });
  const {
    fetchCollection: fetchGeneratorCategoryRelations,
    addRecords: addGeneratorCategoryRelations,
    deleteRecords: deleteGeneratorCategoryRelations,
    loading: loadingGeneratorCategoryRelations,
  } = useCollection<GeneratorCategoryRelation>("project_category_relations");
  const {
    addRecord: addProjectRecord,
    deleteRecord: deleteGeneratorRecord,
    loading: loadingGeneratorFork,
  } = useCollection<Generator>("projects");

  useFocusEffect(
    useCallback(() => {
      // Category browse keeps its own collection state, so refetch after coming back from the form.
      refresh();
      refreshGeneratorSelections();
      refreshGenerators();
    }, [refresh, refreshGeneratorSelections, refreshGenerators]),
  );

  // This row represents "which project this user is currently using" plus its selected categories.
  const activeGeneratorSelection = useMemo(
    () =>
      userGeneratorSelections.find(
        (selection) => selection.project_id === activeGenerator?.id,
      ) ?? null,
    [activeGenerator?.id, userGeneratorSelections],
  );

  const filteredCategories = useMemo(
    () =>
      // Keep the tag/language rule in one place so the same OR logic applies everywhere.
      data.filter((item) => {
        return (
          matchesGeneratorLanguage(item.language, browseLanguageFilter) &&
          matchesGeneratorTags(item.tags, browseTagFilters)
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
  const tagOptions = useMemo<TagSelectorOption[]>(
    () =>
      GENERATOR_TAGS.map((value) => ({
        value,
        label: t(`component:metadata.tag_values.${value}`),
      })),
    [t],
  );

  const toggleEditionSelectedCategory = useCallback((category: Category) => {
    setEditionSelectedCategoryIds((prev) =>
      prev.includes(category.id)
        ? prev.filter((id) => id !== category.id)
        : [...prev, category.id],
    );
  }, []);

  const persistGeneratorSelection = useCallback(
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
      const uniqueSelectedCategoryIds = Array.from(
        new Set(selectedCategoryIds),
      );
      const existingRelations = await fetchGeneratorCategoryRelations({
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
          await addGeneratorCategoryRelations(relationsToInsert);

        if (insertedRelations.length !== relationsToInsert.length) {
          console.error("Failed to insert project category relations");
          return false;
        }
      }

      const updatedSelection = await updateGeneratorSelection(selectionId, {
        ...(nextProjectId ? { project_id: nextProjectId } : {}),
        selected_category_ids: uniqueSelectedCategoryIds,
      });

      if (!updatedSelection) {
        console.error("Failed to update project category selection");
        return false;
      }

      return true;
    },
    [
      addGeneratorCategoryRelations,
      fetchGeneratorCategoryRelations,
      updateGeneratorSelection,
    ],
  );

  const persistEditionSelection = useCallback(async () => {
    if (!activeGenerator || !activeGeneratorSelection) {
      console.error("Missing active project selection");
      return false;
    }

    // Private projects can be updated in place for the current user selection.
    if (!activeGenerator.is_public) {
      const didPersist = await persistGeneratorSelection({
        projectId: activeGenerator.id,
        selectionId: activeGeneratorSelection.id,
        selectedCategoryIds: editionSelectedCategoryIds,
      });

      if (!didPersist) {
        return false;
      }

      await refreshGenerators();
      return activeGenerator.id;
    }

    // Public projects stay immutable here: fork first, then move the user's selection to the fork.
    const forkedProject = await addProjectRecord({
      name: activeGenerator.name,
      description: activeGenerator.description,
      language: activeGenerator.language ?? undefined,
      tags: normalizeGeneratorTags(activeGenerator.tags),
      is_public: false,
      favorited_counter: 0,
      color: activeGenerator.color,
    });

    if (!forkedProject) {
      console.error("Failed to fork public project");
      return false;
    }

    const didPersistFork = await persistGeneratorSelection({
      projectId: forkedProject.id,
      selectionId: activeGeneratorSelection.id,
      selectedCategoryIds: editionSelectedCategoryIds,
      nextProjectId: forkedProject.id,
    });

    if (!didPersistFork) {
      await deleteGeneratorRecord(forkedProject.id);
      return false;
    }

    setActiveGeneratorId(forkedProject.id);
    await refreshGenerators();
    return forkedProject.id;
  }, [
    activeGenerator,
    activeGeneratorSelection,
    addProjectRecord,
    deleteGeneratorRecord,
    editionSelectedCategoryIds,
    persistGeneratorSelection,
    refreshGenerators,
    setActiveGeneratorId,
  ]);

  const returnBrowseMode = isCreation ? "creation" : "edition";

  const openCategoryForm = useCallback(
    ({
      category,
      categoryAction,
    }: {
      category?: Category;
      categoryAction?: "edit" | "fork";
    }) => {
      router.push({
        pathname: "/category-form",
        params: {
          mode: returnBrowseMode,
          type,
          ...(category ? { categoryId: category.id } : {}),
          ...(categoryAction ? { categoryAction } : {}),
        },
      });
    },
    [returnBrowseMode, type],
  );

  useEffect(() => {
    if (!session?.user || !visibleLogin) {
      return;
    }

    setVisibleLogin(false);
    openCategoryForm({});
  }, [openCategoryForm, session?.user, visibleLogin]);

  const handleDeleteCategory = useCallback(
    async (category: Category) => {
      const relationIds = (
        await fetchGeneratorCategoryRelations({
          filterColumn: "category_id",
          filterValue: category.id,
        })
      ).map((relation) => relation.id);

      if (relationIds.length > 0) {
        const didDeleteRelations =
          await deleteGeneratorCategoryRelations(relationIds);

        if (!didDeleteRelations) {
          console.error("Failed to delete project category relations");
          return;
        }
      }

      const selectionUpdates = userGeneratorSelections.filter((selection) =>
        selection.selected_category_ids.includes(category.id),
      );

      if (selectionUpdates.length > 0) {
        const updatedSelections = await Promise.all(
          selectionUpdates.map((selection) =>
            updateGeneratorSelection(selection.id, {
              selected_category_ids: selection.selected_category_ids.filter(
                (categoryId) => categoryId !== category.id,
              ),
            }),
          ),
        );

        if (updatedSelections.some((selection) => !selection)) {
          console.error("Failed to update project selections");
          return;
        }
      }

      const didDeleteCategory = await deleteCategoryRecord(category.id);

      if (!didDeleteCategory) {
        console.error("Failed to delete category");
        return;
      }

      if (isCreation) {
        setSelectedCategories(
          selectedCategories.filter((item) => item.id !== category.id),
        );
      } else {
        setEditionSelectedCategoryIds((prev) =>
          prev.filter((categoryId) => categoryId !== category.id),
        );
      }

      await refresh();
      await refreshGeneratorSelections();
      await refreshGenerators();
    },
    [
      deleteCategoryRecord,
      deleteGeneratorCategoryRelations,
      fetchGeneratorCategoryRelations,
      isCreation,
      refresh,
      refreshGeneratorSelections,
      refreshGenerators,
      selectedCategories,
      setSelectedCategories,
      updateGeneratorSelection,
      userGeneratorSelections,
    ],
  );

  if (!isCreation && loadingHomeGenerators && !activeGenerator) {
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
        title={t("screen:category_browse.title", { type: screenGeneratorTitle })}
      />
      <View style={{ marginTop: 16, marginBottom: 8 }}>
        <Text style={globalStyles.label}>
          {t("screen:category_browse.filters_label")}
        </Text>
        <MetadataBadges
          language={browseLanguageFilter}
          tags={browseTagFilters}
          color={screenGeneratorColor}
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
          trailingContent={
            <Pressable
              onPress={() => setIsFilterModalVisible(true)}
              style={[
                globalStyles.tag,
                globalStyles.tagMedium,
                globalStyles.elementAndDescriptorContainer,
                styles.addFilterButton,
                {
                  borderColor: screenGeneratorColor,
                },
              ]}
              accessibilityLabel="Add filters"
            >
              <Ionicons name="add" size={14} color={screenGeneratorColor} />
            </Pressable>
          }
        />
      </View>
      {loading ? (
        <View
          style={[globalStyles.screenContainer, { justifyContent: "center" }]}
        >
          <ActivityIndicator size="large" color={screenGeneratorColor} />
        </View>
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(item) => item.title}
          renderItem={({ item: section }) => (
            <CategorySection
              key={section.title}
              section={section}
              generatorColor={screenGeneratorColor}
              onDelete={handleDeleteCategory}
              onEdit={(category) =>
                openCategoryForm({
                  category,
                  categoryAction: "edit",
                })
              }
              onFork={(category) =>
                openCategoryForm({
                  category,
                  categoryAction: "fork",
                })
              }
              onToggleCategory={
                isCreation
                  ? toggleSelectedCategory
                  : toggleEditionSelectedCategory
              }
              onPublish={(cat) => {
                updateCategoryRecord(cat.id, { is_public: !cat.is_public });
              }}
            />
          )}
          contentContainerStyle={{
            paddingBottom: headerHeight + 20,
          }}
        />
      )}
      {!isCreation && activeGenerator && (
        <AddButton
          generatorColor={screenGeneratorColor}
          label={t("screen:category_browse.add_button")}
          onClick={() => {
            if (!session?.user) {
              setVisibleLogin(true);
              return;
            }

            openCategoryForm({});
          }}
        />
      )}

      <ConfirmCancelButton
        color={screenGeneratorColor}
        labelConfirm={t("screen:category_browse.confirm_button")}
        isLoading={
          loadingGeneratorSelections ||
          loadingGeneratorCategoryRelations ||
          loadingGeneratorFork
        }
        onClickConfirm={async () => {
          if (isCreation) {
            router.navigate({
              pathname: "/generator-form",
              params: {
                type, // TODO refacto to prevent to have send param back to the original screen
              },
            });
            return;
          }

          if (activeGenerator) {
            const nextProjectId = await persistEditionSelection();

            if (!nextProjectId) {
              return;
            }

            router.navigate({
              pathname: "/generators",
              params: {
                id: nextProjectId,
                type: screenGeneratorTitle,
              },
            });
            return;
          }

          router.back();
        }}
        onClickCancel={() =>
          isCreation
            ? router.navigate({
                pathname: "/generator-form",
                params: {
                  type,
                },
              })
            : activeGenerator
              ? (() => {
                  setEditionSelectedCategoryIds(
                    activeGenerator.selected_category_ids ?? [],
                  );

                  router.navigate({
                    pathname: "/generators",
                    params: {
                      id: activeGenerator.id,
                      type: screenGeneratorTitle,
                    },
                  });
                })()
              : router.back()
        }
      />

      <ModalGeneric
        visible={isFilterModalVisible}
        setVisible={setIsFilterModalVisible}
      >
        <Text style={[globalStyles.subtitle, { marginTop: 0 }]}>
          {t("screen:category_browse.filters_label")}
        </Text>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.filterModalContent}
        >
          <LanguageSelector
            label={t("component:metadata.language_label")}
            selectedLanguage={
              isGeneratorLanguage(browseLanguageFilter)
                ? (browseLanguageFilter as GeneratorLanguage)
                : null
            }
            onChange={(nextLanguage) => setBrowseLanguageFilter(nextLanguage)}
            color={screenGeneratorColor}
          />
          <TagSelector
            label={t("component:metadata.tags_label")}
            options={tagOptions}
            selectedValues={browseTagFilters}
            onChange={(values) =>
              setBrowseTagFilters(normalizeGeneratorTags(values) as GeneratorTag[])
            }
            color={screenGeneratorColor}
            maxVisibleRows={3}
          />
        </ScrollView>
        <ConfirmButton
          generatorColor={screenGeneratorColor}
          label={t("component:confirm-cancel.confirm")}
          onClick={() => setIsFilterModalVisible(false)}
        />
      </ModalGeneric>
      <ModalGeneric visible={visibleLogin} setVisible={setVisibleLogin}>
        <Auth />
      </ModalGeneric>
    </View>
  );
}

const styles = StyleSheet.create({
  addFilterButton: {
    minWidth: 32,
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  filterModalContent: {
    paddingTop: 8,
    paddingBottom: 12,
  },
});
