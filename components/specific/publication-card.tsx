import { ContentHeader } from "@/components/generic/content-header";
import { getProjectColor } from "@/constants/theme";
import { useStyles } from "@/hooks/use-styles";
import { getConstraintSetProjectLabel } from "@/lib/constraint-set-data";
import { Publication } from "@/types/publication";
import React, { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { ConstraintsTags } from "./constraint/constraint-tags";

interface PublicationCardProps {
  publication: Publication;
  likeCount?: number;
  isLiked?: boolean;
  isLikePending?: boolean;
  onToggleLike?: () => void;
  commentCount?: number;
  onOpenComments?: () => void;
  onOpenDetails?: () => void;
}

export const PublicationCard = ({
  publication,
  likeCount = 0,
  isLiked = false,
  isLikePending = false,
  onToggleLike,
  commentCount = 0,
  onOpenComments,
  onOpenDetails,
}: PublicationCardProps) => {
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
      <ContentHeader
        title={publication.title}
        subtitle={projectLabel}
        avatarUrl={publication.profile?.avatar_url}
        username={publication.profile?.username}
        createdAt={publication.created_at}
        difficulty={difficulty}
        color={projectColor}
        backgroundColor={projectBackgroundColor}
        textColor={colors.text}
        discreetTextColor={colors.textDiscreet}
        likeCount={likeCount}
        isLiked={isLiked}
        isLikePending={isLikePending}
        onToggleLike={onToggleLike}
        commentCount={commentCount}
        onOpenComments={onOpenComments}
        onPress={onOpenDetails}
        isExpanded={isConstraintsVisible}
        onToggleExpanded={
          canToggleConstraints
            ? () => setIsConstraintsVisible((prev) => !prev)
            : undefined
        }
      />

      {isConstraintsVisible && publication.description && (
        <Pressable
          onPress={onOpenDetails}
          disabled={!onOpenDetails}
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
        </Pressable>
      )}
      {constraintSet && isConstraintsVisible && (
        <ConstraintsTags constraintSet={constraintSet} />
      )}

      {publication.media_type === "image" && publication.media_url && (
        <Pressable onPress={onOpenDetails} disabled={!onOpenDetails}>
          <Image
            source={{ uri: publication.media_url }}
            style={{ width: "100%", height: 200, borderRadius: 8 }}
          />
        </Pressable>
      )}
      {publication.media_type === "book_text" && publication.content_text && (
        <Pressable onPress={onOpenDetails} disabled={!onOpenDetails}>
          <Text style={{ margin: 10, color: projectColor }}>
            {publication.content_text}
          </Text>
        </Pressable>
      )}
    </View>
  );
};
