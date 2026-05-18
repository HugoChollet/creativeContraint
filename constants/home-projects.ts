import { normalizeProjectTags, ProjectTag } from "./project-metadata";
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

const homeProjectImageTypeByTag: Partial<
  Record<ProjectTag, HomeProjectConfig["type"]>
> = {
  all: "book",
  fiction: "videoFiction",
  writing: "book",
  music: "music",
  video: "videoInternet",
  game: "boardgame",
  character: "videoFiction",
  localisation: "book",
  physical: "photography",
  numerical: "videoGame",
  photography: "photography",
  short: "videoInternet",
  podcast: "music",
  long: "book",
  "internet-content": "videoInternet",
  "board game": "boardgame",
  art: "photography",
  drawing: "photography",
  cooking: "cooking",
  vlog: "videoInternet",
  stream: "videoInternet",
  dnd: "boardgame",
  object: "photography",
  sport: "videoInternet",
  clothe: "photography",
  vehicle: "photography",
  business: "book",
  product: "photography",
  website: "videoInternet",
  comic: "videoFiction",
  architecture: "photography",
  education: "book",
  enigma: "boardgame",
  other: "book",
  "video game": "videoGame",
};

const homeProjectImagePriorityByTag: ProjectTag[] = [
  "video game",
  "board game",
  "dnd",
  "enigma",
  "music",
  "podcast",
  "photography",
  "art",
  "drawing",
  "architecture",
  "clothe",
  "object",
  "product",
  "vehicle",
  "cooking",
  "video",
  "internet-content",
  "website",
  "vlog",
  "stream",
  "comic",
  "fiction",
  "character",
  "game",
  "sport",
  "writing",
  "education",
  "business",
  "other",
  "all",
];

export const getHomeProjectImage = (
  value?: string | null,
): ImageSourcePropType =>
  getHomeProjectConfig(value)?.image ??
  require("@/assets/images/projects/png/book.png");

export const getHomeProjectTypeFromTag = (
  tag?: string | null,
): HomeProjectConfig["type"] | undefined => {
  if (!tag) {
    return undefined;
  }

  return homeProjectImageTypeByTag[tag as ProjectTag];
};

export const getHomeProjectTypeFromTags = (
  tags?: readonly string[] | null,
): HomeProjectConfig["type"] => {
  const normalizedTags = normalizeProjectTags(tags);

  for (const tag of normalizedTags) {
    const mappedType = getHomeProjectTypeFromTag(tag);

    if (mappedType) {
      return mappedType;
    }
  }

  const normalizedTagSet = new Set(normalizedTags);

  for (const tag of homeProjectImagePriorityByTag) {
    if (!normalizedTagSet.has(tag)) {
      continue;
    }

    const mappedType = getHomeProjectTypeFromTag(tag);

    if (mappedType) {
      return mappedType;
    }
  }

  return "book";
};

export const getHomeProjectImageFromTag = (
  tag?: string | null,
): ImageSourcePropType => getHomeProjectImage(getHomeProjectTypeFromTag(tag));

export const getHomeProjectImageFromTags = (
  tags?: readonly string[] | null,
): ImageSourcePropType => getHomeProjectImage(getHomeProjectTypeFromTags(tags));
