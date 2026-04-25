import { AddButton } from "@/components/generic/add-button";
import { ConfirmButton } from "@/components/generic/confirm-button";
import { Header } from "@/components/generic/header";
import CategorySection from "@/components/specific/category/category-section";
import { useAuth } from "@/contexts/auth-context";
import { useProjectDraft } from "@/contexts/project-draft-context";
import { useCollection } from "@/hooks/use-collection";
import { useStyles } from "@/hooks/use-styles";
import { Category, CategorySectionData } from "@/types/category";
import { useHeaderHeight } from "@react-navigation/elements";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, View } from "react-native";

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
  const { selectedCategories, toggleSelectedCategory, projectColor } =
    useProjectDraft();
  const activeSelectedCategories = useMemo(
    () => (isProjectFormSelection ? selectedCategories : []),
    [isProjectFormSelection, selectedCategories],
  );

  const { data, updateRecord, loading } = useCollection<Category>(
    "categories",
    {
      filterColumn: "project_type_id",
      filterValue: projectLabel === "new" ? undefined : projectLabel,
    },
  );

  const selectedCategoryIds = useMemo(
    () => activeSelectedCategories.map((category) => category.id),
    [activeSelectedCategories],
  );

  const personalCategories = useMemo(
    () => data.filter((item) => item.owner_id === userId),
    [data, userId],
  );

  const officialCategories = useMemo(
    () => data.filter((item) => item.source === "official"),
    [data],
  );

  const communityCategories = useMemo(
    () =>
      data.filter(
        (item) => item.source === "community" && item.owner_id !== userId,
      ),
    [data, userId],
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
      <View style={{ paddingTop: 12, paddingBottom: 20 }}>
        <ConfirmButton
          projectColor={projectColor}
          label={t("screen:category_browse.confirm_button")}
          onClick={() => {
            console.log("confirm selection", isProjectFormSelection);

            if (isProjectFormSelection) {
              router.navigate({
                pathname: "/project-form",
                params: { type: projectLabel },
              });
              return;
            }

            console.log("validate category with name: ", projectLabel);
          }}
          isActive={activeSelectedCategories.length > 0}
        />
      </View>
    </View>
  );
}
