import { useAuth } from "@/contexts/auth-context";
import { useCollection } from "@/hooks/use-collection";
import {
  buildGeneratorJsonFromGenerator,
  getGeneratorRouteType,
} from "@/lib/generator-data";
import { Category } from "@/types/category";
import { GeneratorJSON } from "@/types/json-objects";
import {
  Generator,
  GeneratorRelation,
  UserGeneratorSelection,
} from "@/types/generators";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface HomeGeneratorRelation extends GeneratorRelation {
  project_category_relations: {
    categories: Category | null;
  }[];
}

interface HomeGeneratorSelectionRecord extends UserGeneratorSelection {
  project: HomeGeneratorRelation | null;
}

interface ProfileRecord {
  id: string;
  username: string | null;
}

export interface HomeContextGenerator extends Generator {
  selected_category_ids: string[];
  routeType: string;
  ownerUsername?: string | null;
  dataSource: GeneratorJSON;
}

interface HomeGeneratorsContextType {
  generators: HomeContextGenerator[];
  activeGenerator: HomeContextGenerator | null;
  activeGeneratorId: string | null;
  setActiveGeneratorId: (projectId: string | null) => void;
  clearActiveGenerator: () => void;
  refreshGenerators: () => Promise<void>;
  loading: boolean;
}

const HomeGeneratorsContext = createContext<HomeGeneratorsContextType | undefined>(
  undefined,
);

export function HomeGeneratorsProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [activeGeneratorId, setActiveGeneratorId] = useState<string | null>(null);
  const userId = session?.user.id;

  const {
    data: selections,
    loading: loadingSelections,
    refresh,
  } = useCollection<HomeGeneratorSelectionRecord>("user_project_selections", {
    select: `
        id,
        owner_id,
        project_id,
        selected_category_ids,
        created_at,
        project:projects!project_id (
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
        )
      `,
    filterColumn: "owner_id",
    filterValue: userId,
  });

  const uniqueSelections = useMemo(() => {
    const selectionsByProject = new Map<string, HomeGeneratorSelectionRecord>();

    selections.forEach((selection) => {
      const previousSelection = selectionsByProject.get(selection.project_id);

      if (!previousSelection) {
        selectionsByProject.set(selection.project_id, selection);
        return;
      }

      selectionsByProject.set(selection.project_id, {
        ...previousSelection,
        project: previousSelection.project ?? selection.project,
        selected_category_ids: Array.from(
          new Set([
            ...previousSelection.selected_category_ids,
            ...selection.selected_category_ids,
          ]),
        ),
      });
    });

    return Array.from(selectionsByProject.values());
  }, [selections]);

  const ownerIds = useMemo(
    () =>
      Array.from(
        new Set(
          uniqueSelections
            .map((selection) => selection.project)
            .filter((project): project is HomeGeneratorRelation =>
              Boolean(project),
            )
            .filter(
              (project) =>
                project.source !== "official" &&
                project.owner_id !== session?.user.id,
            )
            .map((project) => project.owner_id),
        ),
      ),
    [uniqueSelections, session?.user.id],
  );

  const { data: ownerProfiles, loading: loadingProfiles } =
    useCollection<ProfileRecord>("profiles", {
      filterColumn: "id",
      filterValue: ownerIds,
      filterOperator: "in",
      orderBy: "username",
      ascending: true,
    });

  const ownerProfilesById = useMemo(
    () =>
      new Map(
        ownerProfiles.map((profile) => [profile.id, profile.username ?? null]),
      ),
    [ownerProfiles],
  );

  const generators = useMemo<HomeContextGenerator[]>(
    () =>
      uniqueSelections.flatMap((selection) => {
        if (!selection.project) {
          return [];
        }

        const { project_category_relations, ...projectRecord } =
          selection.project;
        const allCategories = project_category_relations.flatMap((relation) =>
          relation.categories ? [relation.categories] : [],
        );
        const selectedCategoryIdSet = new Set(selection.selected_category_ids);
        // Home/generators should only see the categories the user explicitly selected for this generator.
        const categories = allCategories.filter((category) =>
          selectedCategoryIdSet.has(category.id),
        );
        const routeType = getGeneratorRouteType(projectRecord.name);
        const baseProject: HomeContextGenerator = {
          ...projectRecord,
          categories,
          selected_category_ids: selection.selected_category_ids,
          routeType,
          ownerUsername: ownerProfilesById.get(projectRecord.owner_id),
          // Generators still consume the legacy GeneratorJSON shape, even when the source is the DB.
          dataSource: buildGeneratorJsonFromGenerator(
            {
              ...projectRecord,
              categories,
            },
            routeType,
          ),
        };

        return [baseProject];
      }),
    [ownerProfilesById, uniqueSelections],
  );

  const activeGenerator = useMemo(
    () =>
      generators.find((generator) => generator.id === activeGeneratorId) ?? null,
    [activeGeneratorId, generators],
  );

  useEffect(() => {
    // Clear stale selections after logout or after a refresh removed the active generator.
    setActiveGeneratorId((currentProjectId) => {
      if (!session?.user.id) {
        return null;
      }

      if (!currentProjectId) {
        return currentProjectId;
      }

      return generators.some((generator) => generator.id === currentProjectId)
        ? currentProjectId
        : null;
    });
  }, [generators, session?.user.id]);

  const refreshGenerators = useCallback(async () => {
    await refresh();
  }, [refresh]);

  return (
    <HomeGeneratorsContext.Provider
      value={{
        generators,
        activeGenerator,
        activeGeneratorId,
        setActiveGeneratorId,
        clearActiveGenerator: () => setActiveGeneratorId(null),
        refreshGenerators,
        loading: loadingSelections || loadingProfiles,
      }}
    >
      {children}
    </HomeGeneratorsContext.Provider>
  );
}

export function useHomeGenerators() {
  const context = useContext(HomeGeneratorsContext);

  if (!context) {
    throw new Error(
      "useHomeGenerators must be used within a HomeGeneratorsProvider",
    );
  }

  return context;
}
