import { AddButton } from "@/components/generic/add-button";
import MetadataBadges from "@/components/generic/metadata-badges";
import { Spacer } from "@/components/generic/spacer";
import { getHomeProjectConfig, getHomeProjectType } from "@/constants/home-projects";
import { getProjectColor } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useCollection } from "@/hooks/use-collection";
import { useStyles } from "@/hooks/use-styles";
import { Project } from "@/types/projects";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface UserProjectSelection {
  id: number;
  user_id: string;
  project_id: number;
  source: "official" | "community";
  categories: string[];
}

interface HomeProjectRecord {
  id: string;
  name: string;
  description: string;
  language?: Project["language"];
  tags?: Project["tags"];
  color?: string;
  is_public: boolean;
  owner_id: string;
  source: Project["source"];
}

export default function AuthenticatedHomeView() {
  const router = useRouter();
  const { t } = useTranslation();
  const { session } = useAuth();
  const { globalStyles, theme, colors } = useStyles();

  const { data: selections, loading: loadingSelections } =
    useCollection<UserProjectSelection>("user_project_selections");
  const { data: projects, loading: loadingProjects } =
    useCollection<HomeProjectRecord>("projects");

  const selectedProjects = useMemo(() => {
    const selectedProjectIds = selections.map((selection) =>
      selection.project_id.toString(),
    );
    const selectedProjectIdSet = new Set(selectedProjectIds);
    const projectMap = new Map(projects.map((project) => [project.id, project]));

    return selectedProjectIds
      .map((projectId) => projectMap.get(projectId))
      .filter((project): project is HomeProjectRecord => Boolean(project))
      .filter((project) => selectedProjectIdSet.has(project.id));
  }, [projects, selections]);

  if (loadingSelections || loadingProjects) {
    return (
      <View
        style={[globalStyles.screenContainer, styles.centeredContent]}
      >
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
          selectedProjects.map((project) => {
            const config = getHomeProjectConfig(project.name);
            const routeType =
              getHomeProjectType(project.name) ?? project.name;
            const cardColor = getProjectColor({
              label: routeType,
              color: project.color,
              theme,
            });

            return (
              <TouchableOpacity
                key={project.id}
                activeOpacity={0.9}
                style={[
                  globalStyles.card,
                  styles.projectCard,
                  { backgroundColor: cardColor },
                ]}
                onPress={() =>
                  router.push({
                    pathname: "/lab",
                    params: { id: project.id, type: routeType },
                  })
                }
              >
                <View style={styles.projectTextColumn}>
                  <Text
                    style={[
                      globalStyles.primaryButtonText,
                      styles.projectTitle,
                    ]}
                  >
                    {project.name}
                  </Text>
                  {project.description ? (
                    <Text
                      style={[
                        globalStyles.primaryButtonText,
                        styles.projectDescription,
                      ]}
                      numberOfLines={3}
                    >
                      {project.description}
                    </Text>
                  ) : null}
                  <Spacer height={8} />
                  <MetadataBadges
                    language={project.language}
                    tags={project.tags}
                    color="rgba(255,255,255,0.7)"
                  />
                </View>

                {config ? (
                  <Image
                    source={config.image}
                    style={styles.projectImage}
                    resizeMode="contain"
                  />
                ) : null}
              </TouchableOpacity>
            );
          })
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
  projectCard: {
    marginBottom: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  projectTextColumn: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 20,
    marginBottom: 8,
  },
  projectDescription: {
    fontSize: 13,
    opacity: 0.88,
  },
  projectImage: {
    width: 104,
    height: 104,
  },
  emptyState: {
    padding: 20,
    marginBottom: 16,
  },
});
