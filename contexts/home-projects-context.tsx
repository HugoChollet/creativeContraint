import { useAuth } from "@/contexts/auth-context";
import { useCollection } from "@/hooks/use-collection";
import {
  buildProjectJsonFromProject,
  getProjectRouteType,
} from "@/lib/project-data";
import { Category } from "@/types/category";
import { ProjectJSON } from "@/types/json-objects";
import {
  Project,
  ProjectRelation,
  UserProjectSelection,
} from "@/types/projects";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface HomeProjectRelation extends ProjectRelation {
  project_category_relations: {
    categories: Category | null;
  }[];
}

interface HomeProjectSelectionRecord extends UserProjectSelection {
  project: HomeProjectRelation | null;
}

interface ProfileRecord {
  id: string;
  username: string | null;
}

export interface HomeContextProject extends Project {
  selected_category_ids: string[];
  routeType: string;
  ownerUsername?: string | null;
  dataSource: ProjectJSON;
}

interface HomeProjectsContextType {
  projects: HomeContextProject[];
  activeProject: HomeContextProject | null;
  activeProjectId: string | null;
  setActiveProjectId: (projectId: string | null) => void;
  clearActiveProject: () => void;
  refreshProjects: () => Promise<void>;
  loading: boolean;
}

const HomeProjectsContext = createContext<HomeProjectsContextType | undefined>(
  undefined,
);

export function HomeProjectsProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const userId = session?.user.id ?? "__guest__";

  const {
    data: selections,
    loading: loadingSelections,
    refresh,
  } = useCollection<HomeProjectSelectionRecord>("user_project_selections", {
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

  const ownerIds = useMemo(
    () =>
      Array.from(
        new Set(
          selections
            .map((selection) => selection.project)
            .filter((project): project is HomeProjectRelation =>
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
    [selections, session?.user.id],
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

  const projects = useMemo<HomeContextProject[]>(
    () =>
      selections.flatMap((selection) => {
        if (!selection.project) {
          return [];
        }

        const { project_category_relations, ...projectRecord } =
          selection.project;
        const allCategories = project_category_relations.flatMap((relation) =>
          relation.categories ? [relation.categories] : [],
        );
        const selectedCategoryIdSet = new Set(selection.selected_category_ids);
        // Home/Lab should only see the categories the user explicitly selected for this project.
        const categories = allCategories.filter((category) =>
          selectedCategoryIdSet.has(category.id),
        );
        const routeType = getProjectRouteType(projectRecord.name);
        const baseProject: HomeContextProject = {
          ...projectRecord,
          categories,
          selected_category_ids: selection.selected_category_ids,
          routeType,
          ownerUsername: ownerProfilesById.get(projectRecord.owner_id),
          // Lab still consumes the legacy ProjectJSON shape, even when the source is the DB.
          dataSource: buildProjectJsonFromProject(
            {
              ...projectRecord,
              categories,
            },
            routeType,
          ),
        };

        return [baseProject];
      }),
    [ownerProfilesById, selections],
  );

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) ?? null,
    [activeProjectId, projects],
  );

  useEffect(() => {
    // Clear stale selections after logout or after a refresh removed the active project.
    setActiveProjectId((currentProjectId) => {
      if (!session?.user.id) {
        return null;
      }

      if (!currentProjectId) {
        return currentProjectId;
      }

      return projects.some((project) => project.id === currentProjectId)
        ? currentProjectId
        : null;
    });
  }, [projects, session?.user.id]);

  const refreshProjects = useCallback(async () => {
    await refresh();
  }, [refresh]);

  return (
    <HomeProjectsContext.Provider
      value={{
        projects,
        activeProject,
        activeProjectId,
        setActiveProjectId,
        clearActiveProject: () => setActiveProjectId(null),
        refreshProjects,
        loading: loadingSelections || loadingProfiles,
      }}
    >
      {children}
    </HomeProjectsContext.Provider>
  );
}

export function useHomeProjects() {
  const context = useContext(HomeProjectsContext);

  if (!context) {
    throw new Error(
      "useHomeProjects must be used within a HomeProjectsProvider",
    );
  }

  return context;
}
