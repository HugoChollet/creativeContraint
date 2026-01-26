import MainButton from "@/components/generic/main-button";
import { ProjectsColors } from "@/constants/theme";
import { useStyles } from "@/hooks/use-styles";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { globalStyles } = useStyles();

  return (
    <View style={globalStyles.screenContainer}>
      <Text style={[globalStyles.title, { marginBottom: 20 }]}>
        {t("screen:home.project_choice")}
      </Text>

      <ScrollView>
        <MainButton
          title={t("screen:home.book_button")}
          color={ProjectsColors.book}
          image={require("@/assets/images/projects/png/book.png")}
          onPress={() =>
            router.push({ pathname: "/lab", params: { id: 1, type: "book" } })
          }
        />
        <MainButton
          title={t("screen:home.music_button")}
          color={ProjectsColors.music}
          image={require("@/assets/images/projects/png/music.png")}
          onPress={() =>
            router.push({ pathname: "/lab", params: { id: 1, type: "music" } })
          }
        />
        <MainButton
          title={t("screen:home.photography_button")}
          color={ProjectsColors.photography}
          image={require("@/assets/images/projects/png/photography.png")}
          onPress={() =>
            router.push({
              pathname: "/lab",
              params: { id: 1, type: "photography" },
            })
          }
        />
        <MainButton
          title={t("screen:home.videofiction_button")}
          color={ProjectsColors.videoFiction}
          image={require("@/assets/images/projects/png/videoFiction.png")}
          onPress={() =>
            router.push({
              pathname: "/lab",
              params: { id: 1, type: "videoFiction" },
            })
          }
        />
        <MainButton
          title={t("screen:home.videointernet_button")}
          color={ProjectsColors.videoInternet}
          image={require("@/assets/images/projects/png/videoInternet.png")}
          onPress={() =>
            router.push({
              pathname: "/lab",
              params: { id: 1, type: "videoInternet" },
            })
          }
        />
        <MainButton
          title={t("screen:home.cooking_button")}
          color={ProjectsColors.cooking}
          image={require("@/assets/images/projects/png/cooking.png")}
          onPress={() =>
            router.push({
              pathname: "/lab",
              params: { id: 1, type: "cooking" },
            })
          }
        />
        <MainButton
          title={t("screen:home.boardgame_button")}
          color={ProjectsColors.boardgame}
          image={require("@/assets/images/projects/png/boardgame.png")}
          onPress={() =>
            router.push({
              pathname: "/lab",
              params: { id: 1, type: "boardgame" },
            })
          }
        />
      </ScrollView>
    </View>
  );
}
