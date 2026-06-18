import { AddButton } from "@/components/generic/add-button";
import GeneratorLanguageFilter from "@/components/generic/generator-language-filter";
import HomeGeneratorButton from "@/components/specific/home/home-generator-button";
import {
  getDefaultGeneratorLanguage,
  matchesGeneratorLanguage,
  GeneratorLanguage,
} from "@/constants/generator-metadata";
import { useAuth } from "@/contexts/auth-context";
import {
  HomeContextGenerator,
  useHomeGenerators,
} from "@/contexts/home-generators-context";
import { useCollection } from "@/hooks/use-collection";
import { useStyles } from "@/hooks/use-styles";
import {
  buildGeneratorFromGeneratorRelation,
  buildGeneratorJsonFromGenerator,
  getGeneratorRouteType,
  GENERATOR_RELATION_SELECT,
} from "@/lib/generator-data";
import { GeneratorRelation } from "@/types/generators";
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
  const { generators: selectedGenerators, loading: loadingSelectedGenerators, refreshGenerators } =
    useHomeGenerators();
  const [languageFilter, setLanguageFilter] = useState<GeneratorLanguage | null>(
    () => getDefaultGeneratorLanguage(i18n.language),
  );
  const {
    data: officialGeneratorRelations,
    loading: loadingOfficialGenerators,
    refresh: refreshOfficialGenerators,
  } = useCollection<GeneratorRelation>("projects", {
    select: GENERATOR_RELATION_SELECT,
    filterColumn: "source",
    filterValue: "official",
    orderBy: "name",
    ascending: true,
  });

  useFocusEffect(
    useCallback(() => {
      if (session) {
        void refreshGenerators();
        return;
      }

      void refreshOfficialGenerators();
    }, [refreshOfficialGenerators, refreshGenerators, session]),
  );

  useEffect(() => {
    setLanguageFilter(getDefaultGeneratorLanguage(i18n.language));
  }, [i18n.language]);

  const officialGenerators = useMemo<HomeContextGenerator[]>(
    () =>
      officialGeneratorRelations.map((projectRelation) => {
        const project = buildGeneratorFromGeneratorRelation(projectRelation);
        const routeType = getGeneratorRouteType(project.name);

        return {
          ...project,
          selected_category_ids: project.categories.map((category) => category.id),
          routeType,
          ownerUsername: null,
          dataSource: buildGeneratorJsonFromGenerator(project, routeType),
        };
      }),
    [officialGeneratorRelations],
  );

  const generators = session ? selectedGenerators : officialGenerators;
  const filteredGenerators = useMemo(
    () =>
      generators.filter((generator) =>
        matchesGeneratorLanguage(generator.language, languageFilter),
      ),
    [languageFilter, generators],
  );
  const isLoading =
    loadingAuth || (session ? loadingSelectedGenerators : loadingOfficialGenerators);

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
            ? "screen:home.selected_generator_choice"
            : "screen:home.generator_choice",
        )}
      </Text>
      <GeneratorLanguageFilter
        label={t("component:metadata.language_label")}
        selectedLanguage={languageFilter}
        onChange={setLanguageFilter}
        color={colors.tint}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredGenerators.length > 0 ? (
          filteredGenerators.map((project) => (
            <HomeGeneratorButton
              key={project.id}
              project={project}
              currentUserId={session?.user.id}
            />
          ))
        ) : generators.length > 0 ? (
          <View style={[globalStyles.card, styles.emptyState]}>
            <Text style={globalStyles.subtitle}>
              {t(
                session
                  ? "screen:home.no_filtered_generators"
                  : "screen:home.no_official_generators",
              )}
            </Text>
            <Text style={globalStyles.discreetText}>
              {t(
                session
                  ? "screen:home.no_filtered_generators_hint"
                  : "screen:home.no_official_generators_hint",
              )}
            </Text>
          </View>
        ) : session ? (
          <View style={[globalStyles.card, styles.emptyState]}>
            <Text style={globalStyles.subtitle}>
              {t("screen:home.no_selected_generators")}
            </Text>
            <Text style={globalStyles.discreetText}>
              {t("screen:home.no_selected_generators_hint", {
                email: session.user.email ?? "",
              })}
            </Text>
          </View>
        ) : (
          <View style={[globalStyles.card, styles.emptyState]}>
            <Text style={globalStyles.subtitle}>
              {t("screen:generator_browse.no_projects")}
            </Text>
          </View>
        )}

        <AddButton
          generatorColor={colors.tint}
          label={t("screen:home.manage_generators_button")}
          onClick={() =>
            router.push({
              pathname: "/generator-browse",
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
