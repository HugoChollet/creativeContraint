import { AddButton } from "@/components/generic/add-button";
import { ConfirmButton } from "@/components/generic/confirm-button";
import { Header } from "@/components/generic/header";
import ProjectSection from "@/components/specific/project/project-section";
import { getProjectColor } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useCollection } from "@/hooks/use-collection";
import { useStyles } from "@/hooks/use-styles";
import { Project, ProjectSectionData } from "@/types/projects";
import { useHeaderHeight } from "@react-navigation/elements";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, View } from "react-native";

interface ProjectCategoryRelation {
  id: number;
  user_id: string;
  project_id: number;
  source: "official" | "community";
  categories: string[];
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

  const { data, updateRecord, loading } = useCollection<Project>("projects");
  // const {
  //   data: selected,
  //   updateRecord: updateSelected,
  //   loading: loadingSelected,
  // } = useCollection<ProjectCategoryRelation>("user_project_selection", {
  //   filterColumn: "user_id",
  //   filterValue: userId,
  // });

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

  const sections: ProjectSectionData[] = [
    {
      title: t("screen:project_browse.personal_section"),
      data: personalCategories,
      selected: [],
    },
    {
      title: t("screen:project_browse.official_section"),
      data: officialCategories,
      selected: ["27cd043b-e1ea-40d8-9e77-2ddf77853f8a"],
      // selected
      //   .filter((source) => source.source === "official")
      //   .map((project) => project.id.toString()),
    },
    {
      title: t("screen:project_browse.community_section"),
      data: communityCategories,
      selected: [],
    },
  ];

  return (
    <View style={globalStyles.screenContainer}>
      <Header
        title={t("screen:project_browse.title", { type: projectLabel })}
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
            <ProjectSection
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
        label={t("screen:project_browse.add_button")}
        onClick={() =>
          router.push({
            pathname: "/project-form",
            params: { id: 1, type: projectLabel },
          })
        }
      />
      <View style={{ paddingTop: 12, paddingBottom: 20 }}>
        <ConfirmButton
          projectColor={projectColor}
          label={t("screen:project_browse.confirm_button")}
          onClick={() => {
            console.log("validate project generator with name: ", projectLabel);
            console.log("selection ", sections[1].selected);
          }}
          isActive={sections.some((section) => section.selected.length > 0)}
        />
      </View>
    </View>
  );
}
