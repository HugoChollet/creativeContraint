import { CommentsSection } from "@/components/generic/comments-section";
import { ContentHeader } from "@/components/generic/content-header";
import { ConstraintsSetCard } from "@/components/specific/constraint/constraint-set-card";
import { getProjectColor } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useComments } from "@/hooks/use-comments";
import { useLikes } from "@/hooks/use-likes";
import { useStyles } from "@/hooks/use-styles";
import {
  CONSTRAINT_SET_SELECT,
  getConstraintSetName,
  getConstraintSetProjectColor,
  getConstraintSetProjectLabel,
} from "@/lib/constraint-set-data";
import { supabase } from "@/lib/supabase";
import { SavedConstraintSet } from "@/types/constraints";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type OwnerProfile = {
  username: string | null;
  avatar_url: string | null;
};

export default function ConstraintSetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { globalStyles, colors, theme } = useStyles();
  const { session } = useAuth();
  const currentUserId = session?.user.id;
  const scrollRef = useRef<ScrollView>(null);
  const [constraintSet, setConstraintSet] = useState<SavedConstraintSet | null>(
    null,
  );
  const [ownerProfile, setOwnerProfile] = useState<OwnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentsY, setCommentsY] = useState(0);
  const constraintSetIds = useMemo(() => (id ? [id] : []), [id]);
  const {
    summaries: likeSummaries,
    pendingId: pendingLikeId,
    toggleLike,
  } = useLikes("constraint_set", constraintSetIds, currentUserId);
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
  } = useComments("constraint_set", constraintSetIds, currentUserId);

  useEffect(() => {
    if (!id) {
      return;
    }

    const loadConstraintSet = async () => {
      setLoading(true);
      setOwnerProfile(null);
      const { data, error } = await supabase
        .from("constraint_sets")
        .select(CONSTRAINT_SET_SELECT)
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching constraint set:", error);
        setConstraintSet(null);
      } else {
        const loadedConstraintSet = data as SavedConstraintSet;
        setConstraintSet(loadedConstraintSet);

        if (loadedConstraintSet.owner_id) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("id", loadedConstraintSet.owner_id)
            .single();

          if (profileError) {
            console.error("Error fetching constraint set owner:", profileError);
            setOwnerProfile(null);
          } else {
            setOwnerProfile(profile as OwnerProfile);
          }
        }
      }

      setLoading(false);
    };

    void loadConstraintSet();
    void fetchComments(id);
  }, [fetchComments, id]);

  const title = constraintSet ? getConstraintSetName(constraintSet) : "";
  const projectColor = constraintSet
    ? getConstraintSetProjectColor({ constraintSet, theme })
    : colors.tint;
  const projectBackgroundColor = constraintSet
    ? constraintSet.color
      ? getProjectColor({
          color: constraintSet.color,
          opacity: 0.1,
          theme,
        })
      : getProjectColor({
          label: constraintSet.project?.name ?? constraintSet.project_label,
          opacity: 0.1,
          theme,
        })
    : colors.background;
  const likeSummary = id
    ? (likeSummaries[id] ?? { count: 0, isLiked: false })
    : { count: 0, isLiked: false };
  const commentSummary = id
    ? (commentSummaries[id] ?? { count: 0 })
    : { count: 0 };
  const canLike = Boolean(
    currentUserId && constraintSet && constraintSet.owner_id !== currentUserId,
  );

  if (loading) {
    return (
      <View style={[globalStyles.backgroundColor, styles.root, styles.centered]}>
        <ActivityIndicator color={colors.tint} />
      </View>
    );
  }

  if (!constraintSet || !id) {
    return (
      <View style={[globalStyles.backgroundColor, styles.root, styles.centered]}>
        <Text style={globalStyles.subtitle}>Constraint set not found.</Text>
      </View>
    );
  }

  return (
    <View style={[globalStyles.backgroundColor, styles.root]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ContentHeader
        variant="detail"
        title={title}
        subtitle={getConstraintSetProjectLabel(constraintSet)}
        avatarUrl={ownerProfile?.avatar_url}
        username={ownerProfile?.username}
        createdAt={constraintSet.created_at}
        difficulty={constraintSet.difficulty}
        color={projectColor}
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
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardWrap}>
          <ConstraintsSetCard item={constraintSet} hideHeader />
        </View>

        <View onLayout={(event) => setCommentsY(event.nativeEvent.layout.y)}>
          <CommentsSection
            itemId={id}
            color={projectColor}
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
  root: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  cardWrap: {
    paddingTop: 10,
  },
});
