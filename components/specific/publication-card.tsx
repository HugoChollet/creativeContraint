import { getProjectColor } from "@/constants/theme";
import { useStyles } from "@/hooks/use-styles";
import { getConstraintSetProjectLabel } from "@/lib/constraint-set-data";
import { Publication } from "@/types/publication";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ConstraintsTags } from "./constraint/constraint-tags";
import { DifficultyIndicator } from "./difficulty-indicator";

interface PublicationCardProps {
  publication: Publication;
}

export const PublicationCard = ({ publication }: PublicationCardProps) => {
  const { globalStyles, colors, theme } = useStyles();
  const constraintSet = publication.generated_constraints ?? null;
  const fallbackProjectLabel = publication.project_type;
  const projectLabel = constraintSet
    ? getConstraintSetProjectLabel(constraintSet)
    : fallbackProjectLabel;
  const projectColor = getProjectColor({
    color: constraintSet?.color?.toString(),
    theme,
  });
  const projectBackgroundColor = getProjectColor({
    color: constraintSet?.color?.toString(),
    opacity: 0.1,
    theme,
  });
  const difficulty = constraintSet?.difficulty ?? 0;
  const canToggleConstraints = Boolean(constraintSet);
  const [isConstraintsVisible, setIsConstraintsVisible] = useState(false);

  return (
    <View style={[globalStyles.card]}>
      <View
        style={[
          globalStyles.headerRow,
          {
            backgroundColor: projectBackgroundColor,
            justifyContent: "space-between",
            gap: 8,
            height: 72,
          },
        ]}
      >
        <View style={{ flexDirection: "column", alignItems: "center" }}>
          <Image
            source={
              publication.profile?.avatar_url
                ? { uri: publication.profile.avatar_url }
                : require("@/assets/images/blank-avatar.jpg")
            }
            style={styles.image}
          />
          <Text
            numberOfLines={1}
            style={[
              styles.userText,
              {
                color: colors.text,
              },
            ]}
          >
            {publication.profile?.username}
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text
            style={{ color: projectColor, fontWeight: "bold", fontSize: 16 }}
            numberOfLines={1}
          >
            {publication.title}
          </Text>
          <Text style={{ color: colors.textDiscreet, fontSize: 11 }}>
            {projectLabel}
          </Text>
        </View>
        <View style={styles.headerLeft}>
          <DifficultyIndicator
            isLabel={isConstraintsVisible}
            difficultyIndicator={difficulty}
          />
          {canToggleConstraints && (
            <TouchableOpacity
              onPress={() => setIsConstraintsVisible((prev) => !prev)}
            >
              <Ionicons
                name={isConstraintsVisible ? "chevron-up" : "chevron-down"}
                size={20}
                color={projectColor}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isConstraintsVisible && publication.description && (
        <View
          style={{
            backgroundColor: projectBackgroundColor,
          }}
        >
          <View
            style={{
              marginHorizontal: 12,
              padding: 12,
              borderRadius: 12,
              backgroundColor: getProjectColor({
                color: constraintSet?.color?.toString(),
                opacity: 0.15,
                theme,
              }),
            }}
          >
            <Text style={{ color: colors.text }}>
              {publication.description}
            </Text>
          </View>
        </View>
      )}
      {constraintSet && isConstraintsVisible && (
        <ConstraintsTags constraintSet={constraintSet} />
      )}

      {publication.media_type === "image" && publication.media_url && (
        <Image
          source={{ uri: publication.media_url }}
          style={{ width: "100%", height: 200, borderRadius: 8 }}
        />
      )}
      {publication.media_type === "book_text" && publication.content_text && (
        <Text style={{ margin: 10, color: projectColor }}>
          {publication.content_text}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  userText: {
    fontSize: 10,
    maxWidth: 70,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
    maxWidth: 70,
    gap: 8,
  },
  image: { width: 24, height: 24, borderRadius: 20 },
});
