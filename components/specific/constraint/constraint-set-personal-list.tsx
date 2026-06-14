import { useStyles } from "@/hooks/use-styles";
import { SavedConstraintSet } from "@/types/constraints";
import { router } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { ConstraintsSetCard } from "./constraint-set-card";

interface ConstraintSetPersonalListProps {
  constraintSets: SavedConstraintSet[];
  loading: boolean;
  publishingConstraintSetId: string | number | null;
  onDelete: (id: string | number) => void;
  onPublish: (item: SavedConstraintSet) => void;
  onRefresh: () => void;
}

export function ConstraintSetPersonalList({
  constraintSets,
  loading,
  publishingConstraintSetId,
  onDelete,
  onPublish,
  onRefresh,
}: ConstraintSetPersonalListProps) {
  const { t } = useTranslation();
  const { globalStyles } = useStyles();

  return (
    <FlatList
      data={constraintSets}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <ConstraintsSetCard
          item={item}
          deleteRecord={onDelete}
          publishRecord={onPublish}
          isPublishing={publishingConstraintSetId === item.id}
          submit={() =>
            router.push({
              pathname: "/publication-form",
              params: { id: item.id.toString() },
            })
          }
        />
      )}
      onRefresh={onRefresh}
      refreshing={loading}
      contentContainerStyle={{ paddingBottom: 24 }}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={globalStyles.subtitle}>
            {t("screen:constraint_sets.no_constraint_sets")}
          </Text>
          <TouchableOpacity
            style={globalStyles.secondaryButton}
            onPress={() => {
              void onRefresh();
            }}
          >
            <Text style={[globalStyles.secondaryButtonText, { padding: 16 }]}>
              {t("screen:constraint_sets.refresh")}
            </Text>
          </TouchableOpacity>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    marginTop: 50,
    alignItems: "center",
    gap: 16,
  },
});
