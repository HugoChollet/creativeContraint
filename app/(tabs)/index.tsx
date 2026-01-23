import MainButton from "@/components/generic/main-button";
import { useStyles } from "@/hooks/use-styles";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { globalStyles, colors } = useStyles();

  return (
    <View style={globalStyles.screenContainer}>
      <Text style={[globalStyles.title, { marginBottom: 20 }]}>
        {t("screen:home.project_choice")}
      </Text>

      <ScrollView>
        <MainButton
          title={t("screen:home.book_button")}
          color={colors.book}
          image={require("@/assets/images/projects/book.svg")}
          onPress={() =>
            router.push({ pathname: "/lab", params: { id: 1, type: "book" } })
          }
        />
        <MainButton
          title={t("screen:home.music_button")}
          color={colors.music}
          image={require("@/assets/images/projects/music.svg")}
          onPress={() =>
            router.push({ pathname: "/lab", params: { id: 1, type: "music" } })
          }
        />
        <MainButton
          title={t("screen:home.photography_button")}
          color={colors.photography}
          image={require("@/assets/images/projects/photography.svg")}
          onPress={() =>
            router.push({
              pathname: "/lab",
              params: { id: 1, type: "photography" },
            })
          }
        />
        <MainButton
          title={t("screen:home.videofiction_button")}
          color={colors.videoFiction}
          image={require("@/assets/images/projects/videoFiction.svg")}
          onPress={() =>
            router.push({
              pathname: "/lab",
              params: { id: 1, type: "videoFiction" },
            })
          }
        />
        <MainButton
          title={t("screen:home.videointernet_button")}
          color={colors.videoInternet}
          image={require("@/assets/images/projects/videoInternet.svg")}
          onPress={() =>
            router.push({
              pathname: "/lab",
              params: { id: 1, type: "videoInternet" },
            })
          }
        />
        <MainButton
          title={t("screen:home.cooking_button")}
          color={colors.cooking}
          image={require("@/assets/images/projects/cooking.svg")}
          onPress={() =>
            router.push({
              pathname: "/lab",
              params: { id: 1, type: "cooking" },
            })
          }
        />
      </ScrollView>
    </View>
  );
}
