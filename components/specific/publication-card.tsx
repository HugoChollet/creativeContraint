import { getProjectColor } from "@/constants/theme";
import { useStyles } from "@/hooks/use-styles";
import { Publication } from "@/types/publication";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { ConstraintsTags } from "./constraint-tags";

interface PublicationCardProps {
  publication: Publication;
}

export const PublicationCard = ({ publication }: PublicationCardProps) => {
  const { globalStyles } = useStyles();
  const projectColor = getProjectColor(publication.project_type);

  console.log(publication.generated_constraints);

  return (
    <View style={[globalStyles.card]}>
      <View
        style={[
          globalStyles.headerRow,
          { backgroundColor: getProjectColor(publication.project_type, 0.1) },
        ]}
      >
        <Text style={{ color: projectColor, fontWeight: "bold" }}>
          {publication.title}
        </Text>
      </View>

      {publication.generated_constraints && (
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
  container: { marginBottom: 20, padding: 15 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  mainImage: { width: "100%", height: 250, borderRadius: 12, marginBottom: 12 },
  description: { marginBottom: 15, opacity: 0.8 },
  constraintWrapper: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  },
});
