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
import { getProjectColor } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useHomeProjects } from "@/contexts/home-projects-context";
import { useProjectDraft } from "@/contexts/project-draft-context";
import { useCollection } from "@/hooks/use-collection";
import { useStyles } from "@/hooks/use-styles";
import { getProjectTitle } from "@/lib/project-data";
import { Category, CategorySectionData } from "@/types/category";
import { useHeaderHeight } from "@react-navigation/elements";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

export default function CategoryBrowseScreen() {
  const { mode } = useLocalSearchParams<{
    mode?: string;
  }>();
  const { globalStyles, theme, colors } = useStyles();
  const { session } = useAuth();
  const { activeProject, loading: loadingHomeProjects } = useHomeProjects();
  const { t } = useTranslation();
  const headerHeight = useHeaderHeight();

  const userId = session?.user?.id;
  const isCreation = mode === "creation";
  const {
    name,
    selectedCategories,
    toggleSelectedCategory,
    projectColor: draftProjectColor,
    language,
    tags,
  } = useProjectDraft();
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
  const currentProjectTags = normalizeProjectTags(
    isCreation ? tags : (activeProject?.tags ?? undefined),
  );
  console.log(currentProjectTags);

  const activeSelectedCategories = useMemo(
    () => (isCreation ? selectedCategories : []),
    [isCreation, selectedCategories],
  );
  const selectedCategoryIds = useMemo(
    () => activeSelectedCategories.map((category) => category.id),
    [activeSelectedCategories],
  );
  const { data, updateRecord, loading } = useCollection<Category>("categories");

  const filteredCategories = useMemo(
    () =>
      // Keep the tag/language rule in one place so the same OR logic applies everywhere.
      data.filter((item) => {
        return (
          matchesProjectLanguage(item.language, currentProjectLanguage) &&
          matchesProjectTags(item.tags, currentProjectTags)
        );
      }),
    [currentProjectLanguage, currentProjectTags, data],
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
      {currentProjectTags.length > 0 && (
        <View style={{ marginTop: 16, marginBottom: 8 }}>
          <Text style={globalStyles.label}>
            {t("screen:category_browse.filters_label")}
          </Text>
          <MetadataBadges
            tags={currentProjectTags}
            color={screenProjectColor}
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
              onToggleCategory={isCreation ? toggleSelectedCategory : () => {}}
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
                type: activeProjectTitle ?? activeProject.routeType,
              },
            })
          }
        />
      )}

      <ConfirmCancelButton
        color={screenProjectColor}
        labelConfirm={t("screen:category_browse.confirm_button")}
        onClickConfirm={() => {
          if (isCreation) {
            router.back();
            return;
          }
        }}
        onClickCancel={() =>
          activeProject
            ? router.navigate({
                pathname: "/lab",
                params: {
                  id: activeProject.id,
                  type: activeProjectTitle,
                },
              })
            : router.back()
        }
      />
    </View>
  );
}
