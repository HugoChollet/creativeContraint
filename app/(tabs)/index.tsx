import MainButton from "@/components/generic/main-button";
import { getProjectColor } from "@/constants/theme";
import { useStyles } from "@/hooks/use-styles";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { globalStyles, theme } = useStyles();

  return (
    <View style={globalStyles.screenContainer}>
      <Text style={[globalStyles.title, { marginBottom: 20 }]}>
        {t("screen:home.project_choice")}
      </Text>

      <ScrollView>
        <MainButton
          title={t("screen:home.videointernet_button")}
          color={getProjectColor("videoInternet", 1, theme)}
          image={require("@/assets/images/projects/png/videoInternet.png")}
          onPress={() =>
            router.push({
              pathname: "/lab",
              params: { id: 1, type: "videoInternet" },
            })
          }
        />
        <MainButton
          title={t("screen:home.music_button")}
          color={getProjectColor("music", 1, theme)}
          image={require("@/assets/images/projects/png/music.png")}
          onPress={() =>
            router.push({ pathname: "/lab", params: { id: 1, type: "music" } })
          }
        />
        <MainButton
          title={t("screen:home.book_button")}
          color={getProjectColor("book", 1, theme)}
          image={require("@/assets/images/projects/png/book.png")}
          onPress={() =>
            router.push({ pathname: "/lab", params: { id: 1, type: "book" } })
          }
        />
        <MainButton
          title={t("screen:home.videogame_button")}
          color={getProjectColor("videoGame", 1, theme)}
          image={require("@/assets/images/projects/png/videoGame.png")}
          onPress={() =>
            router.push({
              pathname: "/lab",
              params: { id: 1, type: "music" },
            })
          }
        />
        <MainButton
          title={t("screen:home.photography_button")}
          color={getProjectColor("photography", 1, theme)}
          image={require("@/assets/images/projects/png/photography.png")}
          onPress={() =>
            router.push({
              pathname: "/lab",
              params: { id: 1, type: "photography" },
            })
          }
        />
        <MainButton
          title={t("screen:home.boardgame_button")}
          color={getProjectColor("boardgame", 1, theme)}
          image={require("@/assets/images/projects/png/boardgame.png")}
          onPress={() =>
            router.push({
              pathname: "/lab",
              params: { id: 1, type: "boardgame" },
            })
          }
        />
        <MainButton
          title={t("screen:home.cooking_button")}
          color={getProjectColor("cooking", 1, theme)}
          image={require("@/assets/images/projects/png/cooking.png")}
          onPress={() =>
            router.push({
              pathname: "/lab",
              params: { id: 1, type: "cooking" },
            })
          }
        />
        <MainButton
          title={t("screen:home.videofiction_button")}
          color={getProjectColor("videoFiction", 1, theme)}
          image={require("@/assets/images/projects/png/videoFiction.png")}
          onPress={() =>
            router.push({
              pathname: "/lab",
              params: { id: 1, type: "videoFiction" },
            })
          }
        />
      </ScrollView>
    </View>
  );
}
