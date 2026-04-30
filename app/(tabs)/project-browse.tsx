import { AddButton } from "@/components/generic/add-button";
import { ConfirmButton } from "@/components/generic/confirm-button";
import { Header } from "@/components/generic/header";
import ProjectSection from "@/components/specific/project/project-section";
import { useAuth } from "@/contexts/auth-context";
import { useProjectDraft } from "@/contexts/project-draft-context";
import { useCollection } from "@/hooks/use-collection";
import { useStyles } from "@/hooks/use-styles";
import { Project, ProjectRelation, ProjectSectionData } from "@/types/projects";
import { useHeaderHeight } from "@react-navigation/elements";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, View } from "react-native";

interface UserProjectSelection {
  id: number;
  user_id: string;
  project_id: number;
  source: "official" | "community";
  categories: string[];
}

export default function ProjectBrowseScreen() {
  const { type: projectLabel } = useLocalSearchParams<{
    type: string;
  }>();
  const { globalStyles, colors } = useStyles();
  const { session } = useAuth();
  const { t } = useTranslation();
  const headerHeight = useHeaderHeight();

  const userId = session?.user?.id;

  const {
    data,
    updateRecord,
    refresh,
    loading,
    deleteRecord: deleteProject,
  } = useCollection<ProjectRelation>("projects", {
    select: `
    *,
    project_category_relations (
      categories (
        id,
        name,
        description,
        options,
        project_type_id,
        is_public,
        owner_id,
        source
      )
    )
  `,
  });
  const { data: selected } = useCollection<UserProjectSelection>(
    "user_project_selections",
  );

  const parsedProjects = useMemo<Project[]>(
    () =>
      data.map(({ project_category_relations, ...project }) => ({
        ...project,
        categories: project_category_relations.flatMap((relation) =>
          relation.categories ? [relation.categories] : [],
        ),
      })),
    [data],
  );

  const personalProjects = useMemo(
    () =>
      parsedProjects.filter(
        (item) => item.owner_id === userId && item.is_public === false,
      ),
    [parsedProjects, userId],
  );

  const publishedProjects = useMemo(
    () =>
      parsedProjects.filter(
        (item) => item.owner_id === userId && item.is_public === true,
      ),
    [parsedProjects, userId],
  );

  const officialProjects = useMemo(
    () => parsedProjects.filter((item) => item.source === "official"),
    [parsedProjects],
  );

  const getSelected = useMemo(() => {
    if (!selected) return [];
    return selected.map((sel) => sel.project_id.toString());
  }, [selected]);

  const communityProjects = useMemo(
    () =>
      parsedProjects.filter(
        (item) => item.source === "community" && item.owner_id !== userId,
      ),
    [parsedProjects, userId],
  );

  const sections: ProjectSectionData[] = [
    {
      title: t("screen:project_browse.personal_section"),
      data: personalProjects,
      selected: getSelected,
    },
    {
      title: t("screen:project_browse.published_section"),
      data: publishedProjects,
      selected: getSelected,
    },
    {
      title: t("screen:project_browse.official_section"),
      data: officialProjects,
      selected: getSelected,
    },
    {
      title: t("screen:project_browse.community_section"),
      data: communityProjects,
      selected: getSelected,
    },
  ];

  const {
    setId,
    setName,
    setDescription,
    setProjectColor,
    setSelectedCategories,
    resetProjectDraft,
  } = useProjectDraft();

  const setupDraft = ({
    draft,
    isForked,
  }: {
    draft: Project;
    isForked: boolean;
  }) => {
    setName(draft.name);
    setDescription(draft.description);
    setProjectColor(draft.color ?? "ffff");
    setSelectedCategories(draft.categories);
    setId(isForked ? "" : draft.id);
  };

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
              onDelete={(id) => {
                deleteProject(id);
              }}
              onEdit={(project) => {
                setupDraft({ draft: project, isForked: false });
                router.push({
                  pathname: "/project-form",
                  params: {
                    id: 1,
                    type: projectLabel,
                  },
                });
              }}
              onFork={(project) => {
                setupDraft({ draft: project, isForked: true });
                router.push({
                  pathname: "/project-form",
                  params: {
                    id: 1,
                    type: projectLabel,
                  },
                });
              }}
              onPublish={(project) => {
                // TODO should redirect to project-browse and refresh data
                updateRecord(project.id, { is_public: !project.is_public });
                refresh();
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
