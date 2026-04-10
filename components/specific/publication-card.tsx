import { getProjectColor } from "@/constants/theme";
import { useStyles } from "@/hooks/use-styles";
import { Publication } from "@/types/publication";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ConstraintsTags } from "./constraint-tags";
import { DifficultyIndicator } from "./difficulty-indicator";

interface PublicationCardProps {
  publication: Publication;
}

export const PublicationCard = ({ publication }: PublicationCardProps) => {
  const { globalStyles, colors } = useStyles();
  const projectColor = getProjectColor(publication.project_type);
  const [isConstraintsVisible, setIsConstraintsVisible] = useState(false);

  return (
    <View style={[globalStyles.card]}>
      <View
        style={[
          globalStyles.headerRow,
          {
            backgroundColor: getProjectColor(publication.project_type, 0.1),
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
        <Text style={{ color: projectColor, fontWeight: "bold", fontSize: 16 }}>
          {publication.title}
        </Text>
        <View style={styles.headerLeft}>
          <DifficultyIndicator
            isLabel={isConstraintsVisible}
            difficultyIndicator={
              publication.generated_constraints?.difficulty ?? 0
            }
          />
          <TouchableOpacity
            onPress={() => setIsConstraintsVisible((prev) => !prev)}
          >
            <Ionicons
              name={isConstraintsVisible ? "chevron-up" : "chevron-down"}
              size={20}
              color={projectColor}
            />
          </TouchableOpacity>
        </View>
      </View>

      {publication.generated_constraints && isConstraintsVisible && (
        <ConstraintsTags item={publication.generated_constraints} />
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
