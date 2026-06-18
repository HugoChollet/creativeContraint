import { CommentsSection } from "@/components/generic/comments-section";
import { ContentHeader } from "@/components/generic/content-header";
import { ConstraintsTags } from "@/components/specific/constraint/constraint-tags";
import { getGeneratorColor } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useComments } from "@/hooks/use-comments";
import { useLikes } from "@/hooks/use-likes";
import { useStyles } from "@/hooks/use-styles";
import {
  getConstraintSetGeneratorLabel,
  getConstraintSetName,
} from "@/lib/constraint-set-data";
import { publicationService } from "@/services/publication.service";
import { Publication } from "@/types/publication";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PublicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { globalStyles, colors, theme } = useStyles();
  const { session } = useAuth();
  const currentUserId = session?.user.id;
  const scrollRef = useRef<ScrollView>(null);
  const [publication, setPublication] = useState<Publication | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentsY, setCommentsY] = useState(0);
  const publicationIds = useMemo(() => (id ? [id] : []), [id]);
  const {
    summaries: likeSummaries,
    pendingId: pendingLikeId,
    toggleLike,
  } = useLikes("publication", publicationIds, currentUserId);
  const {
    summaries: commentSummaries,
    commentsByItem,
    loadingItemId,
    submitting,
    pendingCommentId,
    fetchComments,
    addComment,
    updateComment,
    deleteComment,
  } = useComments("publication", publicationIds, currentUserId);

  useEffect(() => {
    if (!id) {
      return;
    }

    setLoading(true);
    publicationService
      .getPublication(id)
      .then(setPublication)
      .finally(() => setLoading(false));
    void fetchComments(id);
  }, [fetchComments, id]);

  const constraintSet = publication?.generated_constraints ?? null;
  const projectLabel = constraintSet
    ? getConstraintSetGeneratorLabel(constraintSet)
    : (publication?.project_type ?? "");
  const generatorColor = getGeneratorColor({
    color: constraintSet?.color?.toString(),
    theme,
  });
  const projectBackgroundColor = getGeneratorColor({
    color: constraintSet?.color?.toString(),
    opacity: 0.1,
    theme,
  });
  const likeSummary = id
    ? (likeSummaries[id] ?? { count: 0, isLiked: false })
    : { count: 0, isLiked: false };
  const commentSummary = id
    ? (commentSummaries[id] ?? { count: 0 })
    : { count: 0 };
  const canLike = Boolean(
    currentUserId && publication && publication.user_id !== currentUserId,
  );

  if (loading) {
    return (
      <View
        style={[
          globalStyles.backgroundColor,
          globalStyles.root,
          globalStyles.centered,
        ]}
      >
        <ActivityIndicator color={colors.tint} />
      </View>
    );
  }

  if (!publication || !id) {
    return (
      <View
        style={[
          globalStyles.backgroundColor,
          globalStyles.root,
          globalStyles.centered,
        ]}
      >
        <Text style={globalStyles.subtitle}>Publication not found.</Text>
      </View>
    );
  }

  return (
    <View style={[globalStyles.backgroundColor, globalStyles.root]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ContentHeader
        variant="detail"
        title={publication.title}
        subtitle={projectLabel}
        avatarUrl={publication.profile?.avatar_url}
        username={publication.profile?.username}
        createdAt={publication.created_at}
        difficulty={constraintSet?.difficulty}
        color={generatorColor}
        backgroundColor={projectBackgroundColor}
        textColor={colors.text}
        discreetTextColor={colors.textDiscreet}
        likeCount={likeSummary.count}
        isLiked={likeSummary.isLiked}
        isLikePending={pendingLikeId === id}
        onToggleLike={canLike ? () => void toggleLike(id) : undefined}
        commentCount={commentSummary.count}
        onOpenComments={() => scrollRef.current?.scrollTo({ y: commentsY })}
        onBack={() => router.back()}
      />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={globalStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            globalStyles.shadeContainer,
            styles.publicationPanel,
            { backgroundColor: projectBackgroundColor },
          ]}
        >
          {publication.description && (
            <Text style={[styles.description, { color: colors.text }]}>
              {publication.description}
            </Text>
          )}

          {constraintSet && (
            <>
              <TouchableOpacity
                style={globalStyles.inlineLink}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/constraint-set/constraint-set-detail",
                    params: { id: constraintSet.id.toString() },
                  })
                }
              >
                <Text
                  style={[
                    globalStyles.inlineLinkText,
                    { color: generatorColor },
                  ]}
                  numberOfLines={1}
                >
                  {getConstraintSetName(constraintSet)}
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={14}
                  color={generatorColor}
                />
              </TouchableOpacity>
              {publication.media_type === "image" && publication.media_url && (
                <Image
                  source={{ uri: publication.media_url }}
                  style={styles.mediaImage}
                />
              )}
              {publication.media_type === "book_text" &&
                publication.content_text && (
                  <Text style={[styles.contentText, { color: colors.text }]}>
                    {publication.content_text}
                  </Text>
                )}
              <ConstraintsTags constraintSet={constraintSet} />
            </>
          )}
        </View>

        <View onLayout={(event) => setCommentsY(event.nativeEvent.layout.y)}>
          <CommentsSection
            itemId={id}
            color={generatorColor}
            comments={commentsByItem[id] ?? []}
            currentUserId={currentUserId}
            loading={loadingItemId === id}
            submitting={submitting}
            pendingCommentId={pendingCommentId}
            onAddComment={addComment}
            onUpdateComment={updateComment}
            onDeleteComment={deleteComment}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  publicationPanel: {
    marginTop: 10,
    marginBottom: 4,
    gap: 14,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  mediaImage: {
    width: "100%",
    height: 260,
    borderRadius: 8,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 22,
  },
});
