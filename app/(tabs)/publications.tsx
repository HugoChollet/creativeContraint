import { Header } from "@/components/generic/header";
import { PublicationCard } from "@/components/specific/publication-card";
import { useStyles } from "@/hooks/use-styles";
import { publicationService } from "@/services/publication.service";
import { Publication } from "@/types/publication";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
} from "react-native";

export default function PublicationsScreen() {
  const { globalStyles, colors } = useStyles();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFeed = async () => {
    try {
      const data = await publicationService.getFeed();
      setPublications(data);
      console.log(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

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
        renderItem={({ item }) => <PublicationCard publication={item} />}
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
