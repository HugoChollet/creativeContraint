import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useMemo, useState } from "react";

type LikeTarget = "constraint_set" | "publication";

type LikeConfig = {
  table: "constraint_set_likes" | "publication_likes";
  targetColumn: "constraint_set_id" | "publication_id";
};

export type LikeSummary = {
  count: number;
  isLiked: boolean;
};

const LIKE_CONFIG: Record<LikeTarget, LikeConfig> = {
  constraint_set: {
    table: "constraint_set_likes",
    targetColumn: "constraint_set_id",
  },
  publication: {
    table: "publication_likes",
    targetColumn: "publication_id",
  },
};

const emptySummary: LikeSummary = {
  count: 0,
  isLiked: false,
};

const getItemKey = (itemId: string | number) => itemId.toString();

export function useLikes(
  target: LikeTarget,
  itemIds: (string | number)[],
  userId?: string | null,
) {
  const [summaries, setSummaries] = useState<Record<string, LikeSummary>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);
  const config = LIKE_CONFIG[target];

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

  const refreshLikes = useCallback(async () => {
    if (uniqueItemIds.length === 0) {
      setSummaries({});
      return;
    }

    const { data, error } = await supabase
      .from(config.table)
      .select(`${config.targetColumn}, user_id`)
      .in(config.targetColumn, uniqueItemIds);

    if (error) {
      console.error("Could not load likes:", error);
      return;
    }

    const nextSummaries = uniqueItemIds.reduce<Record<string, LikeSummary>>(
      (acc, itemId) => {
        acc[getItemKey(itemId)] = { ...emptySummary };
        return acc;
      },
      {},
    );

    (data ?? []).forEach((row) => {
      const likeRow = row as Record<string, string | number | null>;
      const targetId = likeRow[config.targetColumn];
      const likeUserId = likeRow.user_id;

      if (targetId == null) {
        return;
      }

      const key = getItemKey(targetId);
      const currentSummary = nextSummaries[key] ?? { ...emptySummary };

      nextSummaries[key] = {
        count: currentSummary.count + 1,
        isLiked: currentSummary.isLiked || likeUserId === userId,
      };
    });

    setSummaries(nextSummaries);
  }, [config.table, config.targetColumn, uniqueItemIds, userId]);

  const toggleLike = useCallback(
    async (itemId: string | number) => {
      if (!userId) {
        return false;
      }

      const key = getItemKey(itemId);
      const currentSummary = summaries[key] ?? emptySummary;
      const nextIsLiked = !currentSummary.isLiked;

      setPendingId(key);
      setSummaries((previous) => ({
        ...previous,
        [key]: {
          count: Math.max(
            0,
            (previous[key]?.count ?? 0) + (nextIsLiked ? 1 : -1),
          ),
          isLiked: nextIsLiked,
        },
      }));

      const { error } = nextIsLiked
        ? await supabase.from(config.table).insert({
            [config.targetColumn]: itemId,
            user_id: userId,
          })
        : await supabase
            .from(config.table)
            .delete()
            .eq(config.targetColumn, itemId)
            .eq("user_id", userId);

      setPendingId(null);

      if (error) {
        console.error("Could not update like:", error);
        setSummaries((previous) => ({
          ...previous,
          [key]: currentSummary,
        }));
        return false;
      }

      return true;
    },
    [config.table, config.targetColumn, summaries, userId],
  );

  useEffect(() => {
    void refreshLikes();
  }, [refreshLikes]);

  return {
    summaries,
    pendingId,
    refreshLikes,
    toggleLike,
  };
}
