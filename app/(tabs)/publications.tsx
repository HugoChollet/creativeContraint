import { Header } from "@/components/generic/header";
import { PublicationCard } from "@/components/specific/publication-card";
import { useAuth } from "@/contexts/auth-context";
import { useLikes } from "@/hooks/use-likes";
import { useStyles } from "@/hooks/use-styles";
import { publicationService } from "@/services/publication.service";
import { Publication } from "@/types/publication";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
} from "react-native";

export default function PublicationsScreen() {
  const { globalStyles, colors } = useStyles();
  const { session } = useAuth();
  const currentUserId = session?.user.id;
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const publicationIds = useMemo(
    () => publications.map((publication) => publication.id),
    [publications],
  );
  const {
    summaries: publicationLikeSummaries,
    pendingId: pendingPublicationLikeId,
    toggleLike: togglePublicationLike,
  } = useLikes("publication", publicationIds, currentUserId);

  const loadFeed = useCallback(async () => {
    try {
      const data = await publicationService.getFeed();
      setPublications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadFeed();
  }, [loadFeed]);

  if (loading) {
    return (
      <View
        style={[globalStyles.screenContainer, { justifyContent: "center" }]}
      >
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  return (
    <View style={globalStyles.screenContainer}>
      <Header title="Community Feed" />
      <FlatList
        data={publications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const likeSummary = publicationLikeSummaries[item.id] ?? {
            count: 0,
            isLiked: false,
          };
          const canLike = Boolean(currentUserId && item.user_id !== currentUserId);

          return (
            <PublicationCard
              publication={item}
              likeCount={likeSummary.count}
              isLiked={likeSummary.isLiked}
              isLikePending={pendingPublicationLikeId === item.id}
              onToggleLike={
                canLike ? () => void togglePublicationLike(item.id) : undefined
              }
            />
          );
        }}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadFeed();
            }}
          />
        }
      />
    </View>
  );
}
