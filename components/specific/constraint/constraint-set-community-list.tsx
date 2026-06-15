import { ConfirmButton } from "@/components/generic/confirm-button";
import ProjectLanguageFilter from "@/components/generic/project-language-filter";
import { SearchBar } from "@/components/generic/search-bar";
import {
  matchesProjectLanguage,
  matchesProjectTags,
  ProjectLanguage,
  ProjectTag,
} from "@/constants/project-metadata";
import { useStyles } from "@/hooks/use-styles";
import { LikeSummary } from "@/hooks/use-likes";
import {
  getConstraintSetName,
  getConstraintSetProjectLanguage,
  getConstraintSetProjectLabel,
  getConstraintSetProjectSupportedFile,
  getConstraintSetProjectTags,
} from "@/lib/constraint-set-data";
import { SavedConstraintSet } from "@/types/constraints";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { ConstraintsSetCard } from "./constraint-set-card";

interface ConstraintSetCommunityListProps {
  constraintSets: SavedConstraintSet[];
  currentUserId?: string;
  likeSummaries: Record<string, LikeSummary>;
  pendingLikeId: string | null;
  loading: boolean;
  savingConstraintSetId: string | number | null;
  onToggleLike: (item: SavedConstraintSet) => void;
  onSave: (item: SavedConstraintSet) => void;
  onRefresh: () => void;
}

const normalizeSearchText = (value: string) => value.trim().toLowerCase();

export function ConstraintSetCommunityList({
  constraintSets,
  currentUserId,
  likeSummaries,
  pendingLikeId,
  loading,
  savingConstraintSetId,
  onToggleLike,
  onSave,
  onRefresh,
}: ConstraintSetCommunityListProps) {
  const { t } = useTranslation();
  const { globalStyles, colors } = useStyles();
  const [searchQuery, setSearchQuery] = useState("");
  const [languageFilter, setLanguageFilter] = useState<ProjectLanguage | null>(
    null,
  );
  const [tagFilters, setTagFilters] = useState<ProjectTag[]>([]);

  const communityConstraintSets = useMemo(() => {
    const normalizedQuery = normalizeSearchText(searchQuery);

    return constraintSets.filter((item) => {
      if (!item.is_public || item.owner_id === currentUserId) {
        return false;
      }

      const tags = getConstraintSetProjectTags(item);
      const searchableText = [
        getConstraintSetName(item),
        getConstraintSetProjectLabel(item),
        getConstraintSetProjectLanguage(item),
        getConstraintSetProjectSupportedFile(item),
        ...tags,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        searchableText.includes(normalizedQuery) &&
        matchesProjectLanguage(
          getConstraintSetProjectLanguage(item),
          languageFilter,
        ) &&
        matchesProjectTags(tags, tagFilters)
      );
    });
  }, [constraintSets, currentUserId, languageFilter, searchQuery, tagFilters]);

  const renderHeader = () => (
    <View>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={t("screen:constraint_set_browse.search_placeholder")}
        style={styles.searchBar}
      />

      <ProjectLanguageFilter
        label={t("screen:constraint_set_browse.filters_label")}
        languageLabel={t("component:metadata.language_label")}
        tagsLabel={t("component:metadata.tags_label")}
        selectedLanguage={languageFilter}
        onChange={setLanguageFilter}
        selectedTags={tagFilters}
        onTagsChange={setTagFilters}
        color={colors.tint}
      />
    </View>
  );

  return (
    <FlatList
      data={communityConstraintSets}
      keyExtractor={(item) => item.id.toString()}
      ListHeaderComponent={renderHeader}
      renderItem={({ item }) => {
        const itemKey = item.id.toString();
        const likeSummary = likeSummaries[itemKey] ?? {
          count: 0,
          isLiked: false,
        };

        return (
          <ConstraintsSetCard
            item={item}
            likeCount={likeSummary.count}
            isLiked={likeSummary.isLiked}
            isLikePending={pendingLikeId === itemKey}
            onToggleLike={() => onToggleLike(item)}
            submitLabel={t("screen:constraint_set_browse.save_button")}
            submit={() => onSave(item)}
            isSubmitting={savingConstraintSetId === item.id}
          />
        );
      }}
      onRefresh={onRefresh}
      refreshing={loading}
      contentContainerStyle={{ paddingBottom: 24 }}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={globalStyles.subtitle}>
            {t("screen:constraint_set_browse.no_constraint_sets")}
          </Text>
          <ConfirmButton
            projectColor={colors.tint}
            label={t("screen:constraint_sets.refresh")}
            onClick={() => {
              void onRefresh();
            }}
          />
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  searchBar: {
    marginBottom: 16,
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: "center",
    gap: 16,
  },
});
