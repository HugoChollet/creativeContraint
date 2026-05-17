import { AddButton } from "@/components/generic/add-button";
import HomeProjectButton from "@/components/specific/home/home-project-button";
import { useAuth } from "@/contexts/auth-context";
import { useHomeProjects } from "@/contexts/home-projects-context";
import { useStyles } from "@/hooks/use-styles";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback } from "react";
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
  const { projects: selectedProjects, loading, refreshProjects } =
    useHomeProjects();

  useFocusEffect(
    useCallback(() => {
      refreshProjects();
    }, [refreshProjects]),
  );

  if (loading) {
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
