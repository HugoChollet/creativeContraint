import Auth from "@/components/specific/auth";
import { ConstraintsSetCard } from "@/components/specific/constraint/constraint-set-card";
import { useAuth } from "@/contexts/auth-context";
import { useCollection } from "@/hooks/use-collection";
import { useStyles } from "@/hooks/use-styles";
import { SavedConstraintSet } from "@/types/constraints";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ConstraintSetsScreen() {
  const { t } = useTranslation();
  const { globalStyles, colors } = useStyles();
  const {
    data: constraintSets,
    loading,
    deleteRecord,
    refresh,
  } = useCollection<SavedConstraintSet>("constraint_sets");
  const { session } = useAuth();

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  if (loading && constraintSets.length === 0) {
    return (
      <View
        style={[globalStyles.backgroundColor, { justifyContent: "center" }]}
      >
        <ActivityIndicator size="large" color={colors.text} />
      </View>
    );
  }

  return (
    <View style={[globalStyles.screenContainer]}>
      <Text style={[globalStyles.title, { marginBottom: 20 }]}>
        {t("screen:constraint_sets.title")}
      </Text>

      {session?.user ? (
        <FlatList
          data={constraintSets}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ConstraintsSetCard
              item={item}
              deleteRecord={deleteRecord}
              submit={() =>
                router.push({
                  pathname: "/publication-form",
                  params: { id: item.id.toString(), type: item.project_type },
                })
              }
            />
          )}
          onRefresh={refresh}
          refreshing={loading}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={
            <View style={{ marginTop: 50, alignItems: "center" }}>
              <Text style={globalStyles.subtitle}>
                {t("screen:constraint_sets.no_constraintSets")}
              </Text>
              <TouchableOpacity
                style={globalStyles.secondaryButton}
                onPress={() => {
                  void refresh();
                }}
              >
                <Text
                  style={[globalStyles.secondaryButtonText, { padding: 16 }]}
                >
                  {t("screen:constraint_sets.refresh")}
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      ) : (
        <View>
          <Text style={globalStyles.subtitle}>
            {t("screen:constraint_sets.auth_required")}
          </Text>
          <Auth />
        </View>
      )}
    </View>
  );
}
