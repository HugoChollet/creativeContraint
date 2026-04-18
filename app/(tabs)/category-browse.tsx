import { AddButton } from "@/components/generic/add-button";
import { Header } from "@/components/generic/header";
import CategoryItem from "@/components/specific/category-section";
import { getProjectColor } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useStyles } from "@/hooks/use-styles";
import { supabase } from "@/lib/supabase";
import { Category } from "@/types/category";
import { useHeaderHeight } from "@react-navigation/elements";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
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
  const { globalStyles, colors } = useStyles();
  const { session } = useAuth();
  const { t } = useTranslation();
  const headerHeight = useHeaderHeight();
  const [data, setData] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const projectColor = getProjectColor(projectLabel);
  const userId = session?.user?.id;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);

        const { data: categories, error } = await supabase
          .from("categories")
          .select("*")
          .eq("project_type_id", projectLabel)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setData((categories as Category[]) || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (projectLabel) {
      fetchCategories();
    }
  }, [projectLabel]);

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
      {isLoading ? (
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
            <CategoryItem
              key={section.title}
              section={section}
              projectColor={projectColor}
            />
          )}
          contentContainerStyle={{
            padding: 20,
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
