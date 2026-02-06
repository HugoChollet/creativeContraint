import Auth from "@/components/specific/auth";
import { ConstraintsSetCard } from "@/components/specific/constraints-set-card";
import { useAuth } from "@/contexts/auth-context";
import { useCollection } from "@/hooks/use-collection";
import { useStyles } from "@/hooks/use-styles";
import { SavedProjectConstraints } from "@/types/data";
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

export default function ConstraintSetScreen() {
  const { t } = useTranslation();
  const { globalStyles, colors } = useStyles();
  const {
    data: projects,
    loading,
    deleteRecord,
    refresh,
  } = useCollection<SavedProjectConstraints>("projects");
  const { session } = useAuth();

  useEffect(() => {
    refresh();
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  if (loading && projects.length === 0) {
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
        {t("screen:projects.title")}
      </Text>

      {session?.user ? (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ConstraintsSetCard
              item={item}
              deleteRecord={deleteRecord}
              submit={() =>
                router.push({
                  pathname: "/submit-form",
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
                {t("screen:projects.no_projects")}
              </Text>
              <TouchableOpacity
                style={globalStyles.secondaryButton}
                onPress={refresh}
              >
                <Text
                  style={[globalStyles.secondaryButtonText, { padding: 16 }]}
                >
                  {t("screen:projects.refresh")}
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      ) : (
        <View>
          <Text style={globalStyles.subtitle}>
            {t("screen:projects.auth_required")}
          </Text>
          <Auth />
        </View>
      )}
    </View>
  );
}
