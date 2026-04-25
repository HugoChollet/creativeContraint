import { AddButton } from "@/components/generic/add-button";
import { ConfirmButton } from "@/components/generic/confirm-button";
import { Header } from "@/components/generic/header";
import ProjectSection from "@/components/specific/project/project-section";
import { useAuth } from "@/contexts/auth-context";
import { useProjectDraft } from "@/contexts/project-draft-context";
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
  const { globalStyles, colors } = useStyles();
  const { session } = useAuth();
  const { t } = useTranslation();
  const headerHeight = useHeaderHeight();
  const { resetProjectDraft } = useProjectDraft();

  const userId = session?.user?.id;

  const { data, updateRecord, loading } = useCollection<Project>("projects");
  const { data: selected } = useCollection<ProjectCategoryRelation>(
    "user_project_selections",
  ); // TODO add filter for user_id and project_type

  const personalProjects = useMemo(
    () => data.filter((item) => item.owner_id === userId),
    [data, userId],
  );

  const officialProjects = useMemo(
    () => data.filter((item) => item.source === "official"),
    [data],
  );

  const getSelected = useMemo(() => {
    if (!selected) return [];
    return selected.map((sel) => sel.project_id.toString());
  }, [selected]);

  const communityProjects = useMemo(
    () =>
      data.filter(
        (item) => item.source === "community" && item.owner_id !== userId,
      ),
    [data, userId],
  );

  const sections: ProjectSectionData[] = [
    {
      title: t("screen:project_browse.personal_section"),
      data: personalProjects,
      selected: getSelected, // This should be an array of selected project IDs as strings
    },
    {
      title: t("screen:project_browse.official_section"),
      data: officialProjects,
      selected: getSelected, // This should be an array of selected project IDs as strings
      // selected
      //   .filter((source) => source.source === "official")
      //   .map((project) => project.id.toString()),
    },
    {
      title: t("screen:project_browse.community_section"),
      data: communityProjects,
      selected: getSelected,
    },
  ];

  console.log("sections", sections);

  return (
    <View style={globalStyles.screenContainer}>
      <Header
        title={t("screen:project_browse.title", { type: projectLabel })}
      />
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
              onDelete={() => {}}
              onEdit={() => {}}
              onFork={() => {}}
              onPublish={(cat) => {
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
        projectColor={colors.tint}
        label={t("screen:project_browse.add_button")}
        onClick={() => {
          resetProjectDraft();
          router.push({
            pathname: "/project-form",
            params: { id: 1, type: projectLabel },
          });
        }}
      />
      <View style={{ paddingTop: 12, paddingBottom: 20 }}>
        <ConfirmButton
          projectColor={colors.tint}
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
