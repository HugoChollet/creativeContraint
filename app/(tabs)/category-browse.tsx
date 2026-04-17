import { Header } from "@/components/generic/header";
import { getProjectColor } from "@/constants/theme";
import { useCollection } from "@/hooks/use-collection";
import { useStyles } from "@/hooks/use-styles";
import { Category } from "@/types/category";
import { Option } from "@/types/constraints";
import { useHeaderHeight } from "@react-navigation/elements";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

export default function CategoryBrowseScreen() {
  const { type: projectLabel } = useLocalSearchParams<{
    type: string;
  }>();
  const { globalStyles, colors } = useStyles();
  const { t } = useTranslation();
  const headerHeight = useHeaderHeight();
  const { data, loading: isSaving } = useCollection<Category>("categories");

  const [isLoading] = useState(false);

  const [options, setOptions] = useState<Option[]>([]);

  const projectColor = getProjectColor(projectLabel);
  const projectColorSoft = getProjectColor(projectLabel, 0.2);

  return (
    <View style={globalStyles.screenContainer}>
      <Header title="Browse Categories" />
      {isLoading ? (
        <View
          style={[globalStyles.screenContainer, { justifyContent: "center" }]}
        >
          <ActivityIndicator size="large" color={projectColor} />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View
              style={[
                globalStyles.card,
                { marginBottom: 15, borderColor: projectColor },
              ]}
            >
              <Text style={globalStyles.subtitle}>{item.name}</Text>
              <Text style={globalStyles.text}>{item.description}</Text>
            </View>
          )}
          contentContainerStyle={{
            padding: 20,
            paddingBottom: headerHeight + 20,
          }}
        />
      )}
    </View>
  );
}
