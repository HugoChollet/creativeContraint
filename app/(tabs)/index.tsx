import { AddButton } from "@/components/generic/add-button";
import ProjectLanguageFilter from "@/components/generic/project-language-filter";
import HomeProjectButton from "@/components/specific/home/home-project-button";
import {
  getDefaultProjectLanguage,
  matchesProjectLanguage,
  ProjectLanguage,
} from "@/constants/project-metadata";
import { useAuth } from "@/contexts/auth-context";
import {
  HomeContextProject,
  useHomeProjects,
} from "@/contexts/home-projects-context";
import { useCollection } from "@/hooks/use-collection";
import { useStyles } from "@/hooks/use-styles";
import {
  buildProjectFromProjectRelation,
  buildProjectJsonFromProject,
  getProjectRouteType,
  PROJECT_RELATION_SELECT,
} from "@/lib/project-data";
import { ProjectRelation } from "@/types/projects";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const { session, loading: loadingAuth } = useAuth();
  const { t, i18n } = useTranslation();
  const { globalStyles, colors } = useStyles();
  const { projects: selectedProjects, loading: loadingSelected, refreshProjects } =
    useHomeProjects();
  const [languageFilter, setLanguageFilter] = useState<ProjectLanguage | null>(
    () => getDefaultProjectLanguage(i18n.language),
  );
  const {
    data: officialProjectRelations,
    loading: loadingOfficial,
    refresh: refreshOfficialProjects,
  } = useCollection<ProjectRelation>("projects", {
    select: PROJECT_RELATION_SELECT,
    filterColumn: "source",
    filterValue: "official",
    orderBy: "name",
    ascending: true,
  });

  useFocusEffect(
    useCallback(() => {
      if (session) {
        void refreshProjects();
        return;
      }

      void refreshOfficialProjects();
    }, [refreshOfficialProjects, refreshProjects, session]),
  );

  useEffect(() => {
    setLanguageFilter(getDefaultProjectLanguage(i18n.language));
  }, [i18n.language]);

  const officialProjects = useMemo<HomeContextProject[]>(
    () =>
      officialProjectRelations.map((projectRelation) => {
        const project = buildProjectFromProjectRelation(projectRelation);
        const routeType = getProjectRouteType(project.name);

        return {
          ...project,
          selected_category_ids: project.categories.map((category) => category.id),
          routeType,
          ownerUsername: null,
          dataSource: buildProjectJsonFromProject(project, routeType),
        };
      }),
    [officialProjectRelations],
  );

  const projects = session ? selectedProjects : officialProjects;
  const filteredProjects = useMemo(
    () =>
      projects.filter((project) =>
        matchesProjectLanguage(project.language, languageFilter),
      ),
    [languageFilter, projects],
  );
  const isLoading =
    loadingAuth || (session ? loadingSelected : loadingOfficial);

  if (isLoading) {
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
      <Text style={[globalStyles.title, { marginBottom: 20 }]}>
        {t(
          session
            ? "screen:home.selected_project_choice"
            : "screen:home.project_choice",
        )}
      </Text>
      <ProjectLanguageFilter
        label={t("component:metadata.language_label")}
        selectedLanguage={languageFilter}
        onChange={setLanguageFilter}
        color={colors.tint}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <HomeProjectButton
              key={project.id}
              project={project}
              currentUserId={session?.user.id}
            />
          ))
        ) : projects.length > 0 ? (
          <View style={[globalStyles.card, styles.emptyState]}>
            <Text style={globalStyles.subtitle}>
              {t(
                session
                  ? "screen:home.no_filtered_projects"
                  : "screen:home.no_official_projects",
              )}
            </Text>
            <Text style={globalStyles.discreetText}>
              {t(
                session
                  ? "screen:home.no_filtered_projects_hint"
                  : "screen:home.no_official_projects_hint",
              )}
            </Text>
          </View>
        ) : session ? (
          <View style={[globalStyles.card, styles.emptyState]}>
            <Text style={globalStyles.subtitle}>
              {t("screen:home.no_selected_projects")}
            </Text>
            <Text style={globalStyles.discreetText}>
              {t("screen:home.no_selected_projects_hint", {
                email: session.user.email ?? "",
              })}
            </Text>
          </View>
        ) : (
          <View style={[globalStyles.card, styles.emptyState]}>
            <Text style={globalStyles.subtitle}>
              {t("screen:project_browse.no_projects")}
            </Text>
          </View>
        )}

        <AddButton
          projectColor={colors.tint}
          label={t("screen:home.manage_projects_button")}
          onClick={() =>
            router.push({
              pathname: "/project-browse",
              params: { id: 1, type: "new" },
            })
          }
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    padding: 20,
    marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: 20,
  },
});
