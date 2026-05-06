import { ImageSourcePropType } from "react-native";

export interface HomeProjectConfig {
  type: string;
  labelKey: string;
  image: ImageSourcePropType;
}

export const HOME_PROJECTS: HomeProjectConfig[] = [
  {
    type: "videoInternet",
    labelKey: "screen:home.videointernet_button",
    image: require("@/assets/images/projects/png/videoInternet.png"),
  },
  {
    type: "music",
    labelKey: "screen:home.music_button",
    image: require("@/assets/images/projects/png/music.png"),
  },
  {
    type: "book",
    labelKey: "screen:home.book_button",
    image: require("@/assets/images/projects/png/book.png"),
  },
  {
    type: "videoGame",
    labelKey: "screen:home.videogame_button",
    image: require("@/assets/images/projects/png/videoGame.png"),
  },
  {
    type: "photography",
    labelKey: "screen:home.photography_button",
    image: require("@/assets/images/projects/png/photography.png"),
  },
  {
    type: "boardgame",
    labelKey: "screen:home.boardgame_button",
    image: require("@/assets/images/projects/png/boardgame.png"),
  },
  {
    type: "cooking",
    labelKey: "screen:home.cooking_button",
    image: require("@/assets/images/projects/png/cooking.png"),
  },
  {
    type: "videoFiction",
    labelKey: "screen:home.videofiction_button",
    image: require("@/assets/images/projects/png/videoFiction.png"),
  },
];

const homeProjectTypeAliases: Record<string, string> = {
  book: "book",
  music: "music",
  photography: "photography",
  "video fiction": "videoFiction",
  videofiction: "videoFiction",
  "internet video": "videoInternet",
  videointernet: "videoInternet",
  "video internet": "videoInternet",
  cooking: "cooking",
  "board game": "boardgame",
  boardgame: "boardgame",
  "video game": "videoGame",
  videogame: "videoGame",
};

export const getHomeProjectType = (value?: string | null) => {
  if (!value) return undefined;

  return homeProjectTypeAliases[value.trim().toLowerCase()];
};

export const getHomeProjectConfig = (value?: string | null) => {
  const type = getHomeProjectType(value);

  if (!type) {
    return undefined;
  }

  return HOME_PROJECTS.find((project) => project.type === type);
};
