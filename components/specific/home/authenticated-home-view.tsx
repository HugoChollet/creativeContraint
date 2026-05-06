import { AddButton } from "@/components/generic/add-button";
import HomeProjectButton, {
  HomeProjectRecord,
} from "@/components/specific/home/home-project-button";
import { useAuth } from "@/contexts/auth-context";
import { useCollection } from "@/hooks/use-collection";
import { useStyles } from "@/hooks/use-styles";
import { UserProjectSelection } from "@/types/projects";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function AuthenticatedHomeView() {
  const router = useRouter();
  const { t } = useTranslation();
  const { session } = useAuth();
  const { globalStyles, colors } = useStyles();

  const { data: selections, loading: loadingSelections } =
    useCollection<UserProjectSelection>("user_project_selections");
  const { data: projects, loading: loadingProjects } =
    useCollection<HomeProjectRecord>("projects");

  const selectedProjects = useMemo(() => {
    const selectedProjectIds = selections.map((selection) =>
      selection.project_id.toString(),
    );
    const selectedProjectIdSet = new Set(selectedProjectIds);
    const projectMap = new Map(
      projects.map((project) => [project.id, project]),
    );

    return selectedProjectIds
      .map((projectId) => projectMap.get(projectId))
      .filter((project): project is HomeProjectRecord => Boolean(project))
      .filter((project) => selectedProjectIdSet.has(project.id));
  }, [projects, selections]);

  if (loadingSelections || loadingProjects) {
    return (
      <View style={[globalStyles.screenContainer, styles.centeredContent]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  return (
    <View style={globalStyles.screenContainer}>
      <Text style={[globalStyles.title, { marginBottom: 20 }]}>
        {t("screen:home.selected_project_choice")}
      </Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {selectedProjects.length > 0 ? (
          selectedProjects.map((project) => (
            <HomeProjectButton
              key={project.id}
              project={project}
              currentUserId={session?.user.id}
            />
          ))
        ) : (
          <View style={[globalStyles.card, styles.emptyState]}>
            <Text style={globalStyles.subtitle}>
              {t("screen:home.no_selected_projects")}
            </Text>
            <Text style={globalStyles.discreetText}>
              {t("screen:home.no_selected_projects_hint", {
                email: session?.user.email ?? "",
              })}
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
  centeredContent: {
    justifyContent: "center",
  },
  emptyState: {
    padding: 20,
    marginBottom: 16,
  },
});
