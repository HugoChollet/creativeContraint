export const PROJECT_LANGUAGES = ["en", "fr"] as const;
export const PROJECT_SUPPORTED_FILE_TYPES = [
  "png/jpg",
  "docs/pdf",
  "plain text",
  "youtube link",
  "mp3",
] as const;
export const PROJECT_TAGS = [
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
  "object",
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

export type ProjectLanguage = (typeof PROJECT_LANGUAGES)[number];
export type ProjectSupportedFileType =
  (typeof PROJECT_SUPPORTED_FILE_TYPES)[number];
export type ProjectTag = (typeof PROJECT_TAGS)[number];

export const DEFAULT_PROJECT_LANGUAGE: ProjectLanguage = "en";
export const DEFAULT_PROJECT_SUPPORTED_FILE_TYPE: ProjectSupportedFileType =
  "plain text";
export const PROJECT_LANGUAGE_FLAGS: Record<ProjectLanguage, string> = {
  en: "🇬🇧",
  fr: "🇫🇷",
};

const projectLanguageSet = new Set<string>(PROJECT_LANGUAGES);
const projectSupportedFileTypeSet = new Set<string>(
  PROJECT_SUPPORTED_FILE_TYPES,
);
const projectTagSet = new Set<string>(PROJECT_TAGS);

export const isProjectLanguage = (
  value?: string | null,
): value is ProjectLanguage => projectLanguageSet.has(value ?? "");

export const getDefaultProjectLanguage = (
  preferredLanguage?: string | null,
): ProjectLanguage =>
  isProjectLanguage(preferredLanguage)
    ? preferredLanguage
    : DEFAULT_PROJECT_LANGUAGE;

export const isProjectSupportedFileType = (
  value?: string | null,
): value is ProjectSupportedFileType =>
  projectSupportedFileTypeSet.has(value ?? "");

export const getDefaultProjectSupportedFileType = (
  preferredFileType?: string | null,
): ProjectSupportedFileType =>
  isProjectSupportedFileType(preferredFileType)
    ? preferredFileType
    : DEFAULT_PROJECT_SUPPORTED_FILE_TYPE;

export const getProjectLanguageFlag = (language: ProjectLanguage) =>
  PROJECT_LANGUAGE_FLAGS[language];

export const normalizeProjectTags = (
  values?: readonly string[] | null,
): ProjectTag[] => {
  const normalized = Array.from(
    new Set(
      (values ?? []).filter((value): value is ProjectTag =>
        projectTagSet.has(value),
      ),
    ),
  );

  return normalized.includes("all") ? ["all"] : normalized;
};

export const toggleProjectTag = (
  currentTags: readonly string[],
  nextTag: ProjectTag,
  limit: number,
): ProjectTag[] => {
  const normalizedCurrent = normalizeProjectTags(currentTags);

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

export const getCategoryTagsFromProject = (
  values?: readonly string[] | null,
  limit = 2,
): ProjectTag[] => {
  const normalized = normalizeProjectTags(values);

  return normalized.includes("all") ? ["all"] : normalized.slice(0, limit);
};

export const matchesProjectLanguage = (
  candidateLanguage?: string | null,
  filterLanguage?: string | null,
) => {
  if (!filterLanguage) return true;
  if (!candidateLanguage) return true;

  return candidateLanguage === filterLanguage;
};

export const matchesProjectTags = (
  candidateTags?: readonly string[] | null,
  filterTags?: readonly string[] | null,
) => {
  const normalizedFilter = normalizeProjectTags(filterTags);

  if (normalizedFilter.length === 0) {
    return true;
  }

  const normalizedCandidate = normalizeProjectTags(candidateTags);

  if (normalizedCandidate.length === 0) {
    return false;
  }

  if (normalizedFilter.includes("all") || normalizedCandidate.includes("all")) {
    return true;
  }

  return normalizedFilter.some((tag) => normalizedCandidate.includes(tag));
};
