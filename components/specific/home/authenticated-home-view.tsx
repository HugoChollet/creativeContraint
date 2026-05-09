import { AddButton } from "@/components/generic/add-button";
import HomeProjectButton, {
  HomeProjectRecord,
} from "@/components/specific/home/home-project-button";
import { useAuth } from "@/contexts/auth-context";
import { useCollection } from "@/hooks/use-collection";
import { useStyles } from "@/hooks/use-styles";
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

interface HomeProjectSelectionRecord {
  id: string;
  owner_id: string;
  project_id: string;
  selected_category_ids: string[];
  created_at: string;
  project: HomeProjectRecord | null;
}

interface ProfileRecord {
  id: string;
  username: string | null;
}

export default function AuthenticatedHomeView() {
  const router = useRouter();
  const { t } = useTranslation();
  const { session } = useAuth();
  const { globalStyles, colors } = useStyles();

  const { data: selections, loading } =
    useCollection<HomeProjectSelectionRecord>("user_project_selections", {
      select: `
        id,
        owner_id,
        project_id,
        selected_category_ids,
        created_at,
        project:projects!project_id (
          id,
          name,
          description,
          language,
          tags,
          color,
          is_public,
          owner_id,
          source
        )
      `,
    });

  const selectedProjects = useMemo(() => {
    return selections
      .map((selection) => selection.project)
      .filter((project): project is NonNullable<typeof project> =>
        Boolean(project),
      );
  }, [selections]);

  const ownerIds = useMemo(
    () =>
      Array.from(
        new Set(
          selectedProjects
            .filter(
              (project) =>
                project.source !== "official" &&
                project.owner_id !== session?.user.id,
            )
            .map((project) => project.owner_id),
        ),
      ),
    [selectedProjects, session?.user.id],
  );

  const { data: ownerProfiles, loading: loadingProfiles } =
    useCollection<ProfileRecord>("profiles", {
      filterColumn: "id",
      filterValue: ownerIds,
      filterOperator: "in",
      orderBy: "username",
      ascending: true,
    });

  const ownerProfilesById = useMemo(
    () =>
      new Map(
        ownerProfiles.map((profile) => [profile.id, profile.username ?? null]),
      ),
    [ownerProfiles],
  );

  if (loading || loadingProfiles) {
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
              ownerUsername={ownerProfilesById.get(project.owner_id)}
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
