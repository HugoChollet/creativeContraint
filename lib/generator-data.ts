import { getHomeGeneratorType } from "@/constants/home-generators";
import i18n from "@/i18n";
import { Category } from "@/types/category";
import { GeneratorJSON } from "@/types/json-objects";
import { Generator, GeneratorRelation } from "@/types/generators";

const DEFAULT_GENERATOR_NAMESPACE = "book";

const generatorNamespaceByType: Record<string, string> = {
  book: "book",
  music: "music",
  photography: "photo",
  videofiction: "videoFiction",
  videointernet: "videoInternet",
  cooking: "cooking",
  boardgame: "boardGame",
  videogame: "videoGame",
};

export const GENERATOR_RELATION_SELECT = `
  *,
  project_category_relations (
    categories (
      id,
      name,
      description,
      options,
      language,
      tags,
      is_public,
      owner_id,
      source
    )
  )
`;

export const getGeneratorRouteType = (value?: string | null) => {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return "book";
  }

  return getHomeGeneratorType(normalizedValue) ?? normalizedValue;
};

export const getOptionalGeneratorBundleNamespace = (
  generatorType?: string | null,
) => {
  const routeType = getGeneratorRouteType(generatorType).trim().toLowerCase();

  return generatorNamespaceByType[routeType] ?? null;
};

export const getGeneratorBundleNamespace = (generatorType?: string | null) => {
  return (
    getOptionalGeneratorBundleNamespace(generatorType) ??
    DEFAULT_GENERATOR_NAMESPACE
  );
};

export const getGeneratorTitle = ({
  project_label,
  project_type,
}: Pick<GeneratorJSON, "project_label" | "project_type">) =>
  project_label ?? project_type;

export const buildGeneratorFromGeneratorRelation = (
  generatorRelation: GeneratorRelation,
): Generator => {
  const { project_category_relations, ...generator } = generatorRelation;

  return {
    ...generator,
    categories: project_category_relations.flatMap((relation) =>
      relation.categories ? [relation.categories] : [],
    ),
  };
};

// Bundled JSON remains the fallback when no DB-backed public generator is available.
export const getBundledGeneratorData = ({
  generatorType,
  language = i18n.language,
}: {
  generatorType?: string | null;
  language?: string;
}): GeneratorJSON => {
  const namespace = getGeneratorBundleNamespace(generatorType);
  const bundledProject = i18n.getResourceBundle(language, namespace) as
    | GeneratorJSON
    | undefined;

  if (bundledProject) {
    return bundledProject;
  }

  console.error(
    `Namespace "${namespace}" does not exist for "${language}", falling back to "${DEFAULT_GENERATOR_NAMESPACE}"`,
  );

  const fallbackProject = i18n.getResourceBundle(
    language,
    DEFAULT_GENERATOR_NAMESPACE,
  ) as GeneratorJSON | undefined;

  return (
    fallbackProject ?? {
      id: DEFAULT_GENERATOR_NAMESPACE,
      project_type: "book",
      project_label: "Book",
      categories: [],
    }
  );
};

// Reshape DB-backed projects so generators can keep consuming a single generator format.
export const buildGeneratorJsonFromGenerator = (
  generator: Pick<
    Generator,
    | "id"
    | "name"
    | "description"
    | "language"
    | "supported_files"
    | "tags"
    | "categories"
  >,
  generatorType = getGeneratorRouteType(generator.name),
): GeneratorJSON => ({
  id: generator.id,
  project_type: generatorType,
  project_label: generator.name,
  description: generator.description,
  language: generator.language ?? undefined,
  supported_files: generator.supported_files ?? undefined,
  tags: generator.tags ?? undefined,
  categories: generator.categories.map((category: Category) => ({
    id: category.id,
    name: category.name,
    label: category.name,
    description: category.description,
    options: category.options,
    language: category.language ?? undefined,
    tags: category.tags ?? undefined,
  })),
});
