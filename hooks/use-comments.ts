import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useMemo, useState } from "react";

type CommentTarget = "constraint_set" | "publication";

type CommentConfig = {
  table: "constraint_set_comments" | "publication_comments";
  targetColumn: "constraint_set_id" | "publication_id";
};

export type CommentSummary = {
  count: number;
};

export type Comment = {
  id: string;
  user_id: string;
  body: string;
  created_at: string;
  updated_at?: string | null;
  profile?: {
    username: string | null;
    avatar_url: string | null;
  } | null;
};

const COMMENT_CONFIG: Record<CommentTarget, CommentConfig> = {
  constraint_set: {
    table: "constraint_set_comments",
    targetColumn: "constraint_set_id",
  },
  publication: {
    table: "publication_comments",
    targetColumn: "publication_id",
  },
};

const getItemKey = (itemId: string | number) => itemId.toString();

export function useComments(
  target: CommentTarget,
  itemIds: (string | number)[],
  userId?: string | null,
) {
  const [summaries, setSummaries] = useState<Record<string, CommentSummary>>(
    {},
  );
  const [commentsByItem, setCommentsByItem] = useState<
    Record<string, Comment[]>
  >({});
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingCommentId, setPendingCommentId] = useState<string | null>(null);
  const config = COMMENT_CONFIG[target];

  const uniqueItemIds = useMemo(() => {
    const seen = new Set<string>();

    return itemIds.filter((itemId) => {
      const key = getItemKey(itemId);

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
  }, [itemIds]);

  const refreshSummaries = useCallback(async () => {
    if (uniqueItemIds.length === 0) {
      setSummaries({});
      return;
    }

    const { data, error } = await supabase
      .from(config.table)
      .select(config.targetColumn)
      .in(config.targetColumn, uniqueItemIds);

    if (error) {
      console.error("Could not load comment summaries:", error);
      return;
    }

    const nextSummaries = uniqueItemIds.reduce<Record<string, CommentSummary>>(
      (acc, itemId) => {
        acc[getItemKey(itemId)] = { count: 0 };
        return acc;
      },
      {},
    );

    (data ?? []).forEach((row) => {
      const commentRow = row as Record<string, string | number | null>;
      const targetId = commentRow[config.targetColumn];

      if (targetId == null) {
        return;
      }

      const key = getItemKey(targetId);
      nextSummaries[key] = {
        count: (nextSummaries[key]?.count ?? 0) + 1,
      };
    });

    setSummaries(nextSummaries);
  }, [config.table, config.targetColumn, uniqueItemIds]);

  const fetchProfilesByUserId = useCallback(async (userIds: string[]) => {
    if (userIds.length === 0) {
      return new Map<string, Comment["profile"]>();
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .in("id", userIds);

    if (error) {
      console.error("Could not load comment profiles:", error);
      return new Map<string, Comment["profile"]>();
    }

    return new Map(
      (data ?? []).map((profile) => [
        profile.id as string,
        {
          username: profile.username as string | null,
          avatar_url: profile.avatar_url as string | null,
        },
      ]),
    );
  }, []);

  const fetchComments = useCallback(
    async (itemId: string | number) => {
      const key = getItemKey(itemId);
      setLoadingItemId(key);

      const { data, error } = await supabase
        .from(config.table)
        .select("id, user_id, body, created_at, updated_at")
        .eq(config.targetColumn, itemId)
        .order("created_at", { ascending: true });

      setLoadingItemId(null);

      if (error) {
        console.error("Could not load comments:", error);
        return [];
      }

      const rawComments = (data ?? []) as Omit<Comment, "profile">[];
      const profileMap = await fetchProfilesByUserId([
        ...new Set(rawComments.map((comment) => comment.user_id)),
      ]);
      const hydratedComments = rawComments.map((comment) => ({
        ...comment,
        profile: profileMap.get(comment.user_id) ?? null,
      }));

      setCommentsByItem((previous) => ({
        ...previous,
        [key]: hydratedComments,
      }));

      setSummaries((previous) => ({
        ...previous,
        [key]: { count: hydratedComments.length },
      }));

      return hydratedComments;
    },
    [config.table, config.targetColumn, fetchProfilesByUserId],
  );

  const addComment = useCallback(
    async (itemId: string | number, body: string) => {
      const trimmedBody = body.trim();

      if (!userId || !trimmedBody) {
        return null;
      }

      const key = getItemKey(itemId);
      setSubmitting(true);

      const { data, error } = await supabase
        .from(config.table)
        .insert({
          [config.targetColumn]: itemId,
          user_id: userId,
          body: trimmedBody,
        })
        .select("id, user_id, body, created_at, updated_at")
        .single();

      setSubmitting(false);

      if (error) {
        console.error("Could not add comment:", error);
        return null;
      }

      const profileMap = await fetchProfilesByUserId([userId]);
      const comment = {
        ...(data as Omit<Comment, "profile">),
        profile: profileMap.get(userId) ?? null,
      };

      setCommentsByItem((previous) => ({
        ...previous,
        [key]: [...(previous[key] ?? []), comment],
      }));
      setSummaries((previous) => ({
        ...previous,
        [key]: { count: (previous[key]?.count ?? 0) + 1 },
      }));

      return comment;
    },
    [config.table, config.targetColumn, fetchProfilesByUserId, userId],
  );

  const updateComment = useCallback(
    async (itemId: string | number, commentId: string, body: string) => {
      const trimmedBody = body.trim();

      if (!userId || !trimmedBody) {
        return false;
      }

      const key = getItemKey(itemId);
      setPendingCommentId(commentId);

      const { data, error } = await supabase
        .from(config.table)
        .update({
          body: trimmedBody,
          updated_at: new Date().toISOString(),
        })
        .eq("id", commentId)
        .eq("user_id", userId)
        .select("id, user_id, body, created_at, updated_at")
        .single();

      setPendingCommentId(null);

      if (error) {
        console.error("Could not update comment:", error);
        return false;
      }

      setCommentsByItem((previous) => ({
        ...previous,
        [key]: (previous[key] ?? []).map((comment) =>
          comment.id === commentId
            ? {
                ...(data as Omit<Comment, "profile">),
                profile: comment.profile,
              }
            : comment,
        ),
      }));

      return true;
    },
    [config.table, userId],
  );

  const deleteComment = useCallback(
    async (itemId: string | number, commentId: string) => {
      if (!userId) {
        return false;
      }

      const key = getItemKey(itemId);
      setPendingCommentId(commentId);

      const { error } = await supabase
        .from(config.table)
        .delete()
        .eq("id", commentId)
        .eq("user_id", userId);

      setPendingCommentId(null);

      if (error) {
        console.error("Could not delete comment:", error);
        return false;
      }

      setCommentsByItem((previous) => ({
        ...previous,
        [key]: (previous[key] ?? []).filter(
          (comment) => comment.id !== commentId,
        ),
      }));
      setSummaries((previous) => ({
        ...previous,
        [key]: { count: Math.max(0, (previous[key]?.count ?? 0) - 1) },
      }));

      return true;
    },
    [config.table, userId],
  );

  useEffect(() => {
    void refreshSummaries();
  }, [refreshSummaries]);

  return {
    summaries,
    commentsByItem,
    loadingItemId,
    submitting,
    pendingCommentId,
    refreshSummaries,
    fetchComments,
    addComment,
    updateComment,
    deleteComment,
  };
}
