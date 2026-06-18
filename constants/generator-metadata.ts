export const GENERATOR_LANGUAGES = ["en", "fr"] as const;
export const GENERATOR_SUPPORTED_FILE_TYPES = [
  "png/jpg",
  "docs/pdf",
  "plain text",
  "youtube link",
  "mp3",
] as const;
export const GENERATOR_TAGS = [
  "all",
  "fiction",
  "writing",
  "video",
  "game",
  "music",
  "character",
  "photography",
  "podcast",
  "internet-content",
  "video game",
  "board game",
  "art",
  "drawing",
  "cooking",
  "vlog",
  "stream",
  "dnd",
  "sport",
  "clothe",
  "vehicle",
  "business",
  "product",
  "website",
  "comic",
  "architecture",
  "education",
  "enigma",
  "other",
] as const;

export type GeneratorLanguage = (typeof GENERATOR_LANGUAGES)[number];
export type GeneratorSupportedFileType =
  (typeof GENERATOR_SUPPORTED_FILE_TYPES)[number];
export type GeneratorTag = (typeof GENERATOR_TAGS)[number];

export const DEFAULT_GENERATOR_LANGUAGE: GeneratorLanguage = "en";
export const DEFAULT_GENERATOR_SUPPORTED_FILE_TYPE: GeneratorSupportedFileType =
  "plain text";
export const DEFAULT_GENERATOR_TAGS: GeneratorTag[] = ["all"];
export const PROJECT_LANGUAGE_FLAGS: Record<GeneratorLanguage, string> = {
  en: "🇬🇧",
  fr: "🇫🇷",
};

const projectLanguageSet = new Set<string>(GENERATOR_LANGUAGES);
const projectSupportedFileTypeSet = new Set<string>(
  GENERATOR_SUPPORTED_FILE_TYPES,
);
const projectTagSet = new Set<string>(GENERATOR_TAGS);

export const isGeneratorLanguage = (
  value?: string | null,
): value is GeneratorLanguage => projectLanguageSet.has(value ?? "");

export const getDefaultGeneratorLanguage = (
  preferredLanguage?: string | null,
): GeneratorLanguage =>
  isGeneratorLanguage(preferredLanguage)
    ? preferredLanguage
    : DEFAULT_GENERATOR_LANGUAGE;

export const isGeneratorSupportedFileType = (
  value?: string | null,
): value is GeneratorSupportedFileType =>
  projectSupportedFileTypeSet.has(value ?? "");

export const getDefaultGeneratorSupportedFileType = (
  preferredFileType?: string | null,
): GeneratorSupportedFileType =>
  isGeneratorSupportedFileType(preferredFileType)
    ? preferredFileType
    : DEFAULT_GENERATOR_SUPPORTED_FILE_TYPE;

export const getGeneratorLanguageFlag = (language: GeneratorLanguage) =>
  PROJECT_LANGUAGE_FLAGS[language];

export const normalizeGeneratorTags = (
  values?: readonly string[] | null,
): GeneratorTag[] => {
  const normalized = Array.from(
    new Set(
      (values ?? []).filter((value): value is GeneratorTag =>
        projectTagSet.has(value),
      ),
    ),
  );

  return normalized.includes("all") ? ["all"] : normalized;
};

export const getDefaultGeneratorTags = (
  preferredTags?: readonly string[] | null,
): GeneratorTag[] => {
  const normalizedTags = normalizeGeneratorTags(preferredTags);

  return normalizedTags.length > 0 ? normalizedTags : DEFAULT_GENERATOR_TAGS;
};

export const getPrimaryGeneratorTag = (
  values?: readonly string[] | null,
): GeneratorTag => getDefaultGeneratorTags(values)[0];

export const prioritizeGeneratorTag = (
  values: readonly string[],
  preferredTag: GeneratorTag,
): GeneratorTag[] => {
  const normalizedTags = getDefaultGeneratorTags(values);

  if (!normalizedTags.includes(preferredTag)) {
    return normalizedTags;
  }

  return [
    preferredTag,
    ...normalizedTags.filter((tag) => tag !== preferredTag),
  ];
};

export const toggleGeneratorTag = (
  currentTags: readonly string[],
  nextTag: GeneratorTag,
  limit: number,
): GeneratorTag[] => {
  const normalizedCurrent = normalizeGeneratorTags(currentTags);

  if (normalizedCurrent.includes(nextTag)) {
    return normalizedCurrent.filter((tag) => tag !== nextTag);
  }

  if (nextTag === "all") {
    return ["all"];
  }

  const withoutAll = normalizedCurrent.filter((tag) => tag !== "all");

  if (withoutAll.length >= limit) {
    return withoutAll;
  }

  return [...withoutAll, nextTag];
};

export const getCategoryTagsFromGenerator = (
  values?: readonly string[] | null,
  limit = 2,
): GeneratorTag[] => {
  const normalized = normalizeGeneratorTags(values);

  return normalized.includes("all") ? ["all"] : normalized.slice(0, limit);
};

export const matchesGeneratorLanguage = (
  candidateLanguage?: string | null,
  filterLanguage?: string | null,
) => {
  if (!filterLanguage) return true;
  if (!candidateLanguage) return true;

  return candidateLanguage === filterLanguage;
};

export const matchesGeneratorTags = (
  candidateTags?: readonly string[] | null,
  filterTags?: readonly string[] | null,
) => {
  const normalizedFilter = normalizeGeneratorTags(filterTags);

  if (normalizedFilter.length === 0) {
    return true;
  }

  const normalizedCandidate = normalizeGeneratorTags(candidateTags);

  if (normalizedCandidate.length === 0) {
    return false;
  }

  if (normalizedFilter.includes("all") || normalizedCandidate.includes("all")) {
    return true;
  }

  return normalizedFilter.some((tag) => normalizedCandidate.includes(tag));
};
