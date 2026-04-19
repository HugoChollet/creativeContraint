import { AddButton } from "@/components/generic/add-button";
import { Header } from "@/components/generic/header";
import CategorySection from "@/components/specific/category/category-section";
import { getProjectColor } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useCollection } from "@/hooks/use-collection";
import { useStyles } from "@/hooks/use-styles";
import { Category } from "@/types/category";
import { useHeaderHeight } from "@react-navigation/elements";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, View } from "react-native";

export interface CategorySectionData {
  title: string;
  data: Category[];
}

export default function CategoryBrowseScreen() {
  const { type: projectLabel } = useLocalSearchParams<{
    type: string;
  }>();
  const { globalStyles, theme } = useStyles();
  const { session } = useAuth();
  const { t } = useTranslation();
  const headerHeight = useHeaderHeight();

  const projectColor = getProjectColor(projectLabel, 1, theme);
  const userId = session?.user?.id;

  const { data, updateRecord, loading } = useCollection<Category>("categories", {
    filterColumn: "project_type_id",
    filterValue: projectLabel,
  });

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
    },
    {
      title: t("screen:category_browse.official_section"),
      data: officialCategories,
    },
    {
      title: t("screen:category_browse.community_section"),
      data: communityCategories,
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
    </View>
  );
}
