import Auth from "@/components/specific/auth";
import { DifficultyIndicator } from "@/components/specific/difficulty-indicator";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useCollection } from "@/hooks/use-collection";
import { useStyles } from "@/hooks/use-styles";
import { SavedProjectConstraints } from "@/types/data";
import { Ionicons } from "@expo/vector-icons"; // Or your preferred icon set
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProjectLibraryScreen() {
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

  const renderProjectItem = ({ item }: { item: SavedProjectConstraints }) => {
    // Extract constraint keys (Instruments, Emotion, etc.)
    const constraintKeys = Object.keys(item.constraints);

    return (
      <View style={[globalStyles.shadeContainer, { marginBottom: 16 }]}>
        {/* Header: Project Type & Difficulty */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <DifficultyIndicator difficultyIndicator={item.difficulty} />
          <Text style={[globalStyles.title, { color: colors.text }]}>
            {item.project_type.toUpperCase()}
          </Text>

          <TouchableOpacity onPress={() => deleteRecord(item.id)}>
            <Ionicons name="trash-outline" size={20} color={Colors.alert} />
          </TouchableOpacity>
        </View>

        {/* Constraints Tags Section */}
        <View style={styles.tagContainer}>
          {constraintKeys.map((key) => (
            <View key={key} style={globalStyles.tag}>
              <Text style={{ fontSize: 12, color: colors.textDiscreet }}>
                {key}:{" "}
                <Text style={{ color: colors.text, fontWeight: "600" }}>
                  {item.constraints[key].value}
                </Text>
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

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
    <View style={globalStyles.backgroundContainer}>
      <Text style={[globalStyles.title, { marginBottom: 20 }]}>
        {t("screen:projects.title")}
      </Text>

      {session?.user ? (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProjectItem}
          onRefresh={refresh}
          refreshing={loading}
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
          contentContainerStyle={{ paddingBottom: 100 }}
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

export const styles = StyleSheet.create({
  tagContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
