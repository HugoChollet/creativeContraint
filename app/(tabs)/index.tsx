import { ThemedView } from "@/components/themed-view";
import { useStyles } from "@/hooks/use-styles";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TouchableOpacity } from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { globalStyles, colors } = useStyles();

  return (
    <ScrollView style={{ backgroundColor: colors.background }}>
      <ThemedView style={globalStyles.shadeContainer}>
        <TouchableOpacity
          style={globalStyles.transparentButton}
          onPress={() =>
            router.push({ pathname: "/lab", params: { id: 1, type: "book" } })
          }
        >
          <Text style={globalStyles.transparentButtonText}>
            {t("common:home.book_button")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={globalStyles.transparentButton}
          onPress={() =>
            router.push({
              pathname: "/lab",
              params: { id: 2, type: "videoGame" },
            })
          }
        >
          <Text style={globalStyles.transparentButtonText}>
            {t("common:home.videogame_button")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={globalStyles.transparentButton}
          onPress={() =>
            router.push({ pathname: "/lab", params: { id: 3, type: "music" } })
          }
        >
          <Text style={globalStyles.transparentButtonText}>
            {t("common:home.music_button")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={globalStyles.transparentButton}
          onPress={() =>
            router.push({
              pathname: "/lab",
              params: { id: 3, type: "videoInternet" },
            })
          }
        >
          <Text style={globalStyles.transparentButtonText}>
            {t("common:home.videointernet_button")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={globalStyles.transparentButton}
          onPress={() =>
            router.push({
              pathname: "/lab",
              params: { id: 3, type: "videoFiction" },
            })
          }
        >
          <Text style={globalStyles.transparentButtonText}>
            {t("common:home.videofiction_button")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={globalStyles.transparentButton}
          onPress={() =>
            router.push({
              pathname: "/lab",
              params: { id: 3, type: "photography" },
            })
          }
        >
          <Text style={globalStyles.transparentButtonText}>
            {t("common:home.photography_button")}
          </Text>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}
