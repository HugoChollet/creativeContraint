import { Colors } from "@/constants/theme";
import { useCollection } from "@/hooks/use-collection";
import { useStyles } from "@/hooks/use-styles";
import { SavedProjectConstraints } from "@/types/data";
import { Ionicons } from "@expo/vector-icons"; // Or your preferred icon set
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
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

  useEffect(() => {
    refresh();
  }, []);

  console.log(projects);

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
          <View>
            <Text style={[globalStyles.label, { color: colors.text }]}>
              {item.project_type.toUpperCase()}
            </Text>
            <Text style={globalStyles.subtitle}>
              {t("screen:projects.difficulty")}: {item.difficulty}
            </Text>
          </View>

          <TouchableOpacity onPress={() => deleteRecord(item.id)}>
            <Ionicons name="trash-outline" size={20} color={Colors.alert} />
          </TouchableOpacity>
        </View>

        {/* Constraints Tags Section */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {constraintKeys.map((key) => (
            <View
              key={key}
              style={{
                backgroundColor: colors.shadeContainer,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: colors.borderColor,
                maxWidth: "100%",
              }}
            >
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
              style={[globalStyles.secondaryButton]}
              onPress={refresh}
            >
              Refresh
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}
