import { AddButton } from "@/components/generic/add-button";
import { Header } from "@/components/generic/header";
import { useAuth } from "@/contexts/auth-context";
import CategoryCrud from "@/components/specific/category-crud";
import { getProjectColor } from "@/constants/theme";
import { useStyles } from "@/hooks/use-styles";
import { supabase } from "@/lib/supabase";
import { Category } from "@/types/category";
import { useHeaderHeight } from "@react-navigation/elements";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

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

  const sections = [
    { title: "Personal", data: personalCategories },
    { title: "Official", data: officialCategories },
    { title: "Community", data: communityCategories },
  ];

  return (
    <View style={globalStyles.screenContainer}>
      <Header title="Browse Categories" />
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
            <View style={{ marginBottom: 24 }}>
              <Text
                style={[
                  globalStyles.subtitle,
                  { color: colors.text, marginBottom: 12 },
                ]}
              >
                {section.title}
              </Text>
              {section.data.length > 0 ? (
                section.data.map((item) => (
                  <CategoryCrud
                    key={item.id}
                    category={item}
                    onDelete={() => {}}
                    onEdit={() => {}}
                    projectColor={projectColor}
                  />
                ))
              ) : (
                <Text style={{ color: colors.placeholder }}>
                  No categories yet.
                </Text>
              )}
            </View>
          )}
          contentContainerStyle={{
            padding: 20,
            paddingBottom: headerHeight + 20,
          }}
        />
      )}
      <AddButton
        projectColor={projectColor}
        label={t("screen:lab.add-button.label-category")}
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
