import { ImageSourcePropType } from "react-native";
import { normalizeProjectTags, ProjectTag } from "./project-metadata";
import { getProjectColor } from "./theme";

export interface HomeProjectConfig {
  type: string;
  labelKey: string;
  image: ImageSourcePropType;
}

const PROJECT_IMAGES = {
  videoInternet: require("@/assets/images/projects/png/videoInternet.png"),
  music: require("@/assets/images/projects/png/music.png"),
  book: require("@/assets/images/projects/png/book.png"),
  videoGame: require("@/assets/images/projects/png/videoGame.png"),
  photography: require("@/assets/images/projects/png/photography.png"),
  boardgame: require("@/assets/images/projects/png/boardgame.png"),
  cooking: require("@/assets/images/projects/png/cooking.png"),
  videoFiction: require("@/assets/images/projects/png/videoFiction.png"),
  allOther: require("@/assets/images/projects/png/all-other.png"),
  architecture: require("@/assets/images/projects/png/architecture.png"),
  art: require("@/assets/images/projects/png/art.png"),
  business: require("@/assets/images/projects/png/business.png"),
  character: require("@/assets/images/projects/png/charater.png"),
  clothes: require("@/assets/images/projects/png/clothes.png"),
  comic: require("@/assets/images/projects/png/comic.png"),
  dnd: require("@/assets/images/projects/png/dnd.png"),
  drawing: require("@/assets/images/projects/png/drawing.png"),
  education: require("@/assets/images/projects/png/education.png"),
  enigma: require("@/assets/images/projects/png/enigma.png"),
  podcast: require("@/assets/images/projects/png/podcast.png"),
  product: require("@/assets/images/projects/png/product.png"),
  sports: require("@/assets/images/projects/png/sports.png"),
  stream: require("@/assets/images/projects/png/stream.png"),
  vehicle: require("@/assets/images/projects/png/vehicle.png"),
  vlog: require("@/assets/images/projects/png/vlog.png"),
  website: require("@/assets/images/projects/png/website.png"),
} as const;

interface HomeProjectTagVisual {
  type: HomeProjectConfig["type"];
  image: ImageSourcePropType;
  color: string;
}

export const HOME_PROJECTS: HomeProjectConfig[] = [
  {
    type: "videoInternet",
    labelKey: "screen:home.videointernet_button",
    image: PROJECT_IMAGES.videoInternet,
  },
  {
    type: "music",
    labelKey: "screen:home.music_button",
    image: PROJECT_IMAGES.music,
  },
  {
    type: "book",
    labelKey: "screen:home.book_button",
    image: PROJECT_IMAGES.book,
  },
  {
    type: "videoGame",
    labelKey: "screen:home.videogame_button",
    image: PROJECT_IMAGES.videoGame,
  },
  {
    type: "photography",
    labelKey: "screen:home.photography_button",
    image: PROJECT_IMAGES.photography,
  },
  {
    type: "boardgame",
    labelKey: "screen:home.boardgame_button",
    image: PROJECT_IMAGES.boardgame,
  },
  {
    type: "cooking",
    labelKey: "screen:home.cooking_button",
    image: PROJECT_IMAGES.cooking,
  },
  {
    type: "videoFiction",
    labelKey: "screen:home.videofiction_button",
    image: PROJECT_IMAGES.videoFiction,
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

const homeProjectVisualsByTag: Partial<
  Record<ProjectTag, HomeProjectTagVisual>
> = {
  all: {
    type: "book",
    image: PROJECT_IMAGES.allOther,
    color: "#C3C3C3",
  },
  fiction: {
    type: "videoFiction",
    image: PROJECT_IMAGES.videoFiction,
    color: "rgba(255, 193, 0, 1)",
  },
  writing: {
    type: "book",
    image: PROJECT_IMAGES.book,
    color: "rgba(27, 23, 208, 1)",
  },
  video: {
    type: "videoInternet",
    image: PROJECT_IMAGES.videoInternet,
    color: "rgba(130, 200, 104, 1)",
  },
  game: {
    type: "boardgame",
    image: PROJECT_IMAGES.boardgame,
    color: "rgba(197, 63, 63, 1)",
  },
  music: {
    type: "music",
    image: PROJECT_IMAGES.music,
    color: "rgba(23, 184, 166, 1)",
  },
  character: {
    type: "videoFiction",
    image: PROJECT_IMAGES.character,
    color: "#5ECCFF",
  },
  localisation: {
    type: "book",
    image: PROJECT_IMAGES.book,
    color: "rgba(27, 23, 208, 1)",
  },
  physical: {
    type: "photography",
    image: PROJECT_IMAGES.photography,
    color: "rgba(184, 22, 128, 1)",
  },
  numerical: {
    type: "videoGame",
    image: PROJECT_IMAGES.videoGame,
    color: "rgba(84, 35, 147, 1)",
  },
  photography: {
    type: "photography",
    image: PROJECT_IMAGES.photography,
    color: "rgba(184, 22, 128, 1)",
  },
  short: {
    type: "videoInternet",
    image: PROJECT_IMAGES.videoInternet,
    color: "rgba(130, 200, 104, 1)",
  },
  podcast: {
    type: "music",
    image: PROJECT_IMAGES.podcast,
    color: "#22883C",
  },
  long: {
    type: "book",
    image: PROJECT_IMAGES.book,
    color: "rgba(27, 23, 208, 1)",
  },
  "internet-content": {
    type: "videoInternet",
    image: PROJECT_IMAGES.videoInternet,
    color: "rgba(130, 200, 104, 1)",
  },
  "video game": {
    type: "videoGame",
    image: PROJECT_IMAGES.videoGame,
    color: "rgba(84, 35, 147, 1)",
  },
  "board game": {
    type: "boardgame",
    image: PROJECT_IMAGES.boardgame,
    color: "rgba(197, 63, 63, 1)",
  },
  art: {
    type: "photography",
    image: PROJECT_IMAGES.art,
    color: "#F33FCC",
  },
  drawing: {
    type: "photography",
    image: PROJECT_IMAGES.drawing,
    color: "#466B98",
  },
  cooking: {
    type: "cooking",
    image: PROJECT_IMAGES.cooking,
    color: "rgba(255, 114, 94, 1)",
  },
  vlog: {
    type: "videoInternet",
    image: PROJECT_IMAGES.vlog,
    color: "#A7D257",
  },
  stream: {
    type: "videoInternet",
    image: PROJECT_IMAGES.stream,
    color: "#9800DF",
  },
  dnd: {
    type: "boardgame",
    image: PROJECT_IMAGES.dnd,
    color: "#B61400",
  },
  object: {
    type: "photography",
    image: PROJECT_IMAGES.photography,
    color: "#88A5D9",
  },
  sport: {
    type: "videoInternet",
    image: PROJECT_IMAGES.sports,
    color: "#FF8433",
  },
  clothe: {
    type: "photography",
    image: PROJECT_IMAGES.clothes,
    color: "#FF002B",
  },
  vehicle: {
    type: "vehicle",
    image: PROJECT_IMAGES.vehicle,
    color: "#D2B079",
  },
  business: {
    type: "book",
    image: PROJECT_IMAGES.business,
    color: "#349C81",
  },
  product: {
    type: "photography",
    image: PROJECT_IMAGES.product,
    color: "rgba(184, 22, 128, 1)",
  },
  website: {
    type: "videoInternet",
    image: PROJECT_IMAGES.website,
    color: "#BEA6ED",
  },
  comic: {
    type: "videoFiction",
    image: PROJECT_IMAGES.comic,
    color: "#A4662A",
  },
  architecture: {
    type: "photography",
    image: PROJECT_IMAGES.architecture,
    color: "#FFE5BA",
  },
  education: {
    type: "book",
    image: PROJECT_IMAGES.education,
    color: "#92E3D5",
  },
  enigma: {
    type: "boardgame",
    image: PROJECT_IMAGES.enigma,
    color: "#FF4082",
  },
  other: {
    type: "book",
    image: PROJECT_IMAGES.allOther,
    color: "#C3C3C3",
  },
};

export const getHomeProjectImage = (
  value?: string | null,
): ImageSourcePropType =>
  getHomeProjectConfig(value)?.image ?? PROJECT_IMAGES.book;

export const getHomeProjectTypeFromTag = (
  tag?: string | null,
): HomeProjectConfig["type"] | undefined => {
  if (!tag) {
    return undefined;
  }

  return homeProjectVisualsByTag[tag as ProjectTag]?.type;
};

export const getHomeProjectTypeFromTags = (
  tags?: readonly string[] | null,
): HomeProjectConfig["type"] => {
  const [primaryTag] = normalizeProjectTags(tags);

  return getHomeProjectTypeFromTag(primaryTag) ?? "book";
};

export const getHomeProjectColorFromTag = (
  tag?: string | null,
  opacity = 1,
): string =>
  getProjectColor({
    color: homeProjectVisualsByTag[tag as ProjectTag]?.color,
    opacity,
  });

export const getHomeProjectColorFromTags = (
  tags?: readonly string[] | null,
  opacity = 1,
): string => {
  const [primaryTag] = normalizeProjectTags(tags);

  return getHomeProjectColorFromTag(primaryTag, opacity);
};

export const getHomeProjectImageFromTag = (
  tag?: string | null,
): ImageSourcePropType =>
  homeProjectVisualsByTag[tag as ProjectTag]?.image ?? PROJECT_IMAGES.book;

export const getHomeProjectImageFromTags = (
  tags?: readonly string[] | null,
): ImageSourcePropType => {
  const [primaryTag] = normalizeProjectTags(tags);

  return getHomeProjectImageFromTag(primaryTag);
};
