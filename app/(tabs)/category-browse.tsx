import { AddButton } from "@/components/generic/add-button";
import { ConfirmCancelButton } from "@/components/generic/confirm-cancel-buttons";
import { Header } from "@/components/generic/header";
import MetadataBadges from "@/components/generic/metadata-badges";
import CategorySection from "@/components/specific/category/category-section";
import {
  matchesProjectLanguage,
  matchesProjectTags,
  normalizeProjectTags,
} from "@/constants/project-metadata";
import { useAuth } from "@/contexts/auth-context";
import { useProjectDraft } from "@/contexts/project-draft-context";
import { useCollection } from "@/hooks/use-collection";
import { useStyles } from "@/hooks/use-styles";
import { Category, CategorySectionData } from "@/types/category";
import { useHeaderHeight } from "@react-navigation/elements";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

export default function CategoryBrowseScreen() {
  const { type: projectLabel, selectionMode } = useLocalSearchParams<{
    type: string;
    selectionMode?: string;
  }>();
  const { globalStyles } = useStyles();
  const { session } = useAuth();
  const { t } = useTranslation();
  const headerHeight = useHeaderHeight();

  const userId = session?.user?.id;
  const isProjectFormSelection = selectionMode === "project-form";
  const {
    selectedCategories,
    toggleSelectedCategory,
    projectColor,
    language,
    tags,
  } = useProjectDraft();
  const activeSelectedCategories = useMemo(
    () => (isProjectFormSelection ? selectedCategories : []),
    [isProjectFormSelection, selectedCategories],
  );
  const selectedCategoryIds = useMemo(
    () => activeSelectedCategories.map((category) => category.id),
    [activeSelectedCategories],
  );
  const tagFilterValue = useMemo(() => {
    if (!isProjectFormSelection) {
      return undefined;
    }

    const normalizedTags = normalizeProjectTags(tags);

    console.log("tags : ", normalizedTags);

    if (normalizedTags.length === 0 || normalizedTags.includes("all")) {
      return undefined;
    }

    console.log(normalizedTags);
    return [...normalizedTags, "all"];
  }, [isProjectFormSelection, tags]);

  const { data, updateRecord, loading } = useCollection<Category>(
    "categories",
    {
      filterColumn: isProjectFormSelection ? "tags" : undefined,
      filterValue: isProjectFormSelection ? tagFilterValue : undefined,
      filterOperator: isProjectFormSelection ? "overlaps" : "eq",
    },
  );

  const filteredCategories = useMemo(
    () =>
      data.filter((item) => {
        if (!isProjectFormSelection) {
          return true;
        }

        if (selectedCategoryIds.includes(item.id)) {
          return true;
        }

        return (
          matchesProjectLanguage(item.language, language) &&
          matchesProjectTags(item.tags, tags)
        );
      }),
    [data, isProjectFormSelection, language, selectedCategoryIds, tags],
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

  return (
    <View style={globalStyles.screenContainer}>
      <Header
        title={t("screen:category_browse.title", { type: projectLabel })}
      />
      {isProjectFormSelection && (
        <View style={{ marginTop: 16, marginBottom: 8 }}>
          <Text style={globalStyles.label}>
            {t("screen:category_browse.filters_label")}
          </Text>
          <MetadataBadges tags={tags} color={projectColor} />
        </View>
      )}
      {loading ? (
        <View
          style={[globalStyles.screenContainer, { justifyContent: "center" }]}
        >
          <ActivityIndicator size="large" color={projectColor} />
        </View>
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(item) => item.title}
          renderItem={({ item: section }) => (
            <CategorySection
              key={section.title}
              section={section}
              projectColor={projectColor}
              onDelete={() => {}}
              onEdit={() => {}}
              onFork={() => {}}
              onToggleCategory={
                isProjectFormSelection ? toggleSelectedCategory : () => {}
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
      {projectLabel !== "new" && (
        <AddButton
          projectColor={projectColor}
          label={t("screen:category_browse.add_button")}
          onClick={() =>
            router.push({
              pathname: "/category-form",
              params: { id: 1, type: projectLabel },
            })
          }
        />
      )}

      <ConfirmCancelButton
        color={projectColor}
        labelConfirm={t("screen:category_browse.confirm_button")}
        onClickConfirm={() => {
          if (isProjectFormSelection) {
            router.navigate({
              pathname: "/project-form",
              params: { type: projectLabel },
            });
            return;
          }
        }}
        onClickCancel={() =>
          // TODO fix redirection to book
          router.navigate({
            pathname: "/lab",
            params: { type: projectLabel },
          })
        }
      />
    </View>
  );
}
