import { getHomeProjectType } from "@/constants/home-projects";
import i18n from "@/i18n";
import { Category } from "@/types/category";
import { ProjectJSON } from "@/types/json-objects";
import { Project } from "@/types/projects";

const DEFAULT_PROJECT_NAMESPACE = "book";

const projectNamespaceByType: Record<string, string> = {
  book: "book",
  music: "music",
  photography: "photo",
  videofiction: "videoFiction",
  videointernet: "videoInternet",
  cooking: "cooking",
  boardgame: "boardGame",
  videogame: "videoGame",
};

export const getProjectRouteType = (value?: string | null) => {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return "book";
  }

  return getHomeProjectType(normalizedValue) ?? normalizedValue;
};

export const getProjectBundleNamespace = (projectType?: string | null) => {
  const routeType = getProjectRouteType(projectType).trim().toLowerCase();

  return projectNamespaceByType[routeType] ?? DEFAULT_PROJECT_NAMESPACE;
};

export const getProjectTitle = ({
  project_label,
  project_type,
}: Pick<ProjectJSON, "project_label" | "project_type">) =>
  project_label ?? project_type;

// Guest/offline flows still rely on the bundled JSON project definitions.
export const getBundledProjectData = ({
  projectType,
  language = i18n.language,
}: {
  projectType?: string | null;
  language?: string;
}): ProjectJSON => {
  const namespace = getProjectBundleNamespace(projectType);
  const bundledProject = i18n.getResourceBundle(language, namespace) as
    | ProjectJSON
    | undefined;

  if (bundledProject) {
    return bundledProject;
  }

  console.error(
    `Namespace "${namespace}" does not exist for "${language}", falling back to "${DEFAULT_PROJECT_NAMESPACE}"`,
  );

  const fallbackProject = i18n.getResourceBundle(
    language,
    DEFAULT_PROJECT_NAMESPACE,
  ) as ProjectJSON | undefined;

  return (
    fallbackProject ?? {
      id: DEFAULT_PROJECT_NAMESPACE,
      project_type: "book",
      project_label: "Book",
      categories: [],
    }
  );
};

// Reshape DB-backed projects so Lab can keep consuming a single project format.
export const buildProjectJsonFromProject = (
  project: Pick<
    Project,
    | "id"
    | "name"
    | "description"
    | "language"
    | "supported_files"
    | "tags"
    | "categories"
  >,
  projectType = getProjectRouteType(project.name),
): ProjectJSON => ({
  id: project.id,
  project_type: projectType,
  project_label: project.name,
  description: project.description,
  language: project.language ?? undefined,
  supported_files: project.supported_files ?? undefined,
  tags: project.tags ?? undefined,
  categories: project.categories.map((category: Category) => ({
    name: category.name,
    label: category.name,
    description: category.description,
    options: category.options,
    language: category.language ?? undefined,
    tags: category.tags ?? undefined,
  })),
});
