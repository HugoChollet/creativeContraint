import { normalizeProjectTags } from "@/constants/project-metadata";
import { AppTheme, getProjectColor } from "@/constants/theme";
import { buildProjectJsonFromProject } from "@/lib/project-data";
import {
  GeneratedConstraintSet,
  SavedConstraintSet,
} from "@/types/constraints";
import { CategoryJSON, ProjectJSON } from "@/types/json-objects";
import { Project } from "@/types/projects";

type ConstraintCategoryLike = Pick<CategoryJSON, "id" | "name">;

type ParsedConstraintKey = {
  categoryIdentifier: string;
  subCategoryName: string | null;
};

export interface ResolvedConstraintCategoryContext {
  category: CategoryJSON | null;
  categoryIdentifier: string;
  subCategoryName: string | null;
}

const PROJECT_SELECT = `
  id,
  name,
  description,
  language,
  supported_files,
  tags,
  color,
  is_public,
  owner_id,
  source,
  created_at,
  favorited_counter,
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

export const CONSTRAINT_SET_SELECT = `
  *,
  project:projects!project_id (
    ${PROJECT_SELECT}
  )
`;

const isStringOrNumber = (value: unknown): value is string | number =>
  typeof value === "string" || typeof value === "number";

const parseConstraintKey = (key: string): ParsedConstraintKey | null => {
  try {
    const parsed = JSON.parse(key);

    if (!Array.isArray(parsed) || (parsed.length !== 2 && parsed.length !== 3)) {
      return null;
    }

    const [categoryIdentifier, subCategoryName, optionId] = parsed;

    if (!isStringOrNumber(categoryIdentifier)) {
      return null;
    }

    if (!(subCategoryName === null || typeof subCategoryName === "string")) {
      return null;
    }

    if (parsed.length === 3 && typeof optionId !== "number") {
      return null;
    }

    return {
      categoryIdentifier: String(categoryIdentifier),
      subCategoryName: subCategoryName ?? null,
    };
  } catch {
    return null;
  }
};

const flattenConstraintSetProject = (
  project: NonNullable<SavedConstraintSet["project"]>,
): Project => {
  const { project_category_relations, ...projectRecord } = project;

  return {
    ...projectRecord,
    categories: project_category_relations.flatMap((relation) =>
      relation.categories ? [relation.categories] : [],
    ),
  };
};

export const getConstraintCategoryIdentifier = (
  category: ConstraintCategoryLike,
) => String(category.id ?? category.name);

export const getConstraintValueKey = (
  category: ConstraintCategoryLike,
  subCategoryName?: string | null,
) =>
  JSON.stringify([
    getConstraintCategoryIdentifier(category),
    subCategoryName ?? null,
  ]);

export const getConstraintSelectionKey = (
  category: ConstraintCategoryLike,
  optionId: number,
  subCategoryName?: string | null,
) =>
  JSON.stringify([
    getConstraintCategoryIdentifier(category),
    subCategoryName ?? null,
    optionId,
  ]);

export const resolveConstraintCategoryContext = (
  key: string,
  categories: CategoryJSON[],
): ResolvedConstraintCategoryContext | null => {
  const parsedKey = parseConstraintKey(key);

  if (!parsedKey) {
    return null;
  }

  const category =
    categories.find(
      (item) =>
        getConstraintCategoryIdentifier(item) === parsedKey.categoryIdentifier,
    ) ?? null;

  return {
    category,
    categoryIdentifier: parsedKey.categoryIdentifier,
    subCategoryName: parsedKey.subCategoryName,
  };
};

export const getDefaultConstraintSetName = (projectLabel?: string | null) =>
  projectLabel?.trim() || "Project";

export const normalizeConstraintSetName = (
  value: string | null | undefined,
  projectLabel?: string | null,
) => {
  const trimmedValue = value?.trim();

  return trimmedValue && trimmedValue.length > 0
    ? trimmedValue
    : getDefaultConstraintSetName(projectLabel);
};

export const hasCustomConstraintSetName = (
  constraintSet: Pick<GeneratedConstraintSet, "name" | "projectLabel">,
) =>
  normalizeConstraintSetName(constraintSet.name, constraintSet.projectLabel) !==
  getDefaultConstraintSetName(constraintSet.projectLabel);

export const getConstraintSetName = (
  constraintSet: Pick<SavedConstraintSet, "name" | "project_label">,
) => normalizeConstraintSetName(constraintSet.name, constraintSet.project_label);

export const getConstraintSetProjectLabel = (constraintSet: SavedConstraintSet) =>
  constraintSet.project_label.trim() || constraintSet.project?.name?.trim() || "Project";

export const getConstraintSetProjectLanguage = (
  constraintSet: SavedConstraintSet,
) => constraintSet.language ?? constraintSet.project?.language ?? null;

export const getConstraintSetProjectSupportedFile = (
  constraintSet: SavedConstraintSet,
) => constraintSet.supported_files ?? constraintSet.project?.supported_files ?? null;

export const getConstraintSetProjectTags = (constraintSet: SavedConstraintSet) =>
  normalizeProjectTags(constraintSet.tags ?? constraintSet.project?.tags ?? []);

export const getConstraintSetProjectColor = ({
  constraintSet,
  theme,
}: {
  constraintSet: SavedConstraintSet;
  theme: AppTheme;
}) => {
  if (constraintSet.color) {
    return getProjectColor({ color: constraintSet.color, theme });
  }

  if (constraintSet.project?.color) {
    return getProjectColor({ color: constraintSet.project.color, theme });
  }

  return getProjectColor({
    label: constraintSet.project?.name ?? constraintSet.project_label,
    theme,
  });
};

export const getConstraintSetProjectDataSource = ({
  constraintSet,
}: {
  constraintSet: SavedConstraintSet;
}): ProjectJSON | null => {
  if (!constraintSet.project) {
    return null;
  }

  const project = flattenConstraintSetProject(constraintSet.project);

  return buildProjectJsonFromProject(project);
};
